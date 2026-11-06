import { NextResponse, type NextRequest } from 'next/server'
import { fail, handleError, readJson } from '@/lib/api/response'
import { loginSchema } from '@/lib/validation/schemas'
import {
  clearAttempts,
  isRateLimited,
  recordFailedAttempt,
  verifyAdminCredentials,
} from '@/lib/auth/password'
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from '@/lib/auth/session'

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local'
    if (isRateLimited(ip))
      return fail(429, 'TOO_MANY_ATTEMPTS', 'Too many failed attempts. Try again in 15 minutes.')
    const { username, password } = loginSchema.parse(await readJson(req))
    const user = await verifyAdminCredentials(username, password)
    if (!user) {
      recordFailedAttempt(ip)
      return fail(401, 'INVALID_CREDENTIALS', 'Invalid username or password')
    }
    clearAttempts(ip)
    const token = await createSessionToken({ sub: user.id, username: user.username, role: 'admin' })
    const res = NextResponse.json({ data: { username: user.username } })
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions)
    return res
  } catch (error) {
    return handleError(error)
  }
}
