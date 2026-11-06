import 'server-only'
import { cookies } from 'next/headers'
import { ApiError } from '@/lib/api/response'
import { SESSION_COOKIE, verifySessionToken, type AdminSession } from './session'

/** Reads and verifies the admin session from the request cookies (server components & handlers). */
export async function getAdminSession(): Promise<AdminSession | null> {
  const store = await cookies()
  return verifySessionToken(store.get(SESSION_COOKIE)?.value)
}

/**
 * Authorisation gate for every admin route handler. Never rely on the proxy
 * or client-side checks alone.
 *  - verifies the signed session cookie
 *  - for state-changing requests, rejects cross-site origins (CSRF defence)
 */
export async function requireAdmin(request: Request): Promise<AdminSession> {
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
  return session
}
