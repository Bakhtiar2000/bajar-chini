import 'server-only'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ApiError } from '@/lib/api/response'
import { Types } from 'mongoose'
import { connectDB } from '@/lib/db/connect'
import { AdminUser } from '@/lib/models'
import { SESSION_COOKIE, verifySessionToken, type AdminSession } from './session'
import { can, isRole, type Permission } from './roles'

/** Reads and verifies the admin session from the request cookies (server components & handlers). */
export async function getAdminSession(): Promise<AdminSession | null> {
  const store = await cookies()
  const token = await verifySessionToken(store.get(SESSION_COOKIE)?.value)
  if (!token || !Types.ObjectId.isValid(token.sub)) return null
  // Re-read the account so deactivation and role changes apply immediately,
  // not only when the 8-hour session token expires.
  await connectDB()
  const user = await AdminUser.findById(token.sub).select('username role isActive').lean()
  if (!user || user.isActive === false || !isRole(user.role)) return null
  return { sub: token.sub, username: user.username, role: user.role }
}

/**
 * Authorisation gate for every admin route handler. Never rely on the proxy
 * or client-side checks alone.
 *  - verifies the signed session cookie
 *  - for state-changing requests, rejects cross-site origins (CSRF defence)
 */
export async function requireAdmin(
  request: Request,
  permission?: Permission,
): Promise<AdminSession> {
  const session = await getAdminSession()
  if (!session) throw new ApiError(401, 'UNAUTHORIZED', 'Admin authentication required')

  if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    const origin = request.headers.get('origin')
    if (origin) {
      const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
      let originHost: string | null = null
      try {
        originHost = new URL(origin).host
      } catch {
        originHost = null
      }
      if (!host || originHost !== host) {
        throw new ApiError(403, 'FORBIDDEN', 'Cross-site request rejected')
      }
    }
  }
  // State-changing requests need an explicit permission; by default, catalogue write access.
  const needed =
    permission ?? (['GET', 'HEAD', 'OPTIONS'].includes(request.method) ? null : 'catalog:write')
  if (needed && !can(session.role, needed)) {
    throw new ApiError(403, 'FORBIDDEN', 'Your role does not allow this action')
  }
  return session
}

/** Throws 403 unless the session's role has the permission. */
export function assertCan(session: AdminSession, permission: Permission) {
  if (!can(session.role, permission)) {
    throw new ApiError(403, 'FORBIDDEN', 'Your role does not allow this action')
  }
}

/** Server-component gate for admin pages that need a specific permission. */
export async function requirePagePermission(permission: Permission): Promise<AdminSession> {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')
  if (!can(session.role, permission)) redirect('/admin/dashboard?denied=1')
  return session
}
