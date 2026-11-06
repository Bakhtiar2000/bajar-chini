import { SignJWT, jwtVerify } from 'jose'

export const SESSION_COOKIE = 'bc_admin_session'
export const SESSION_MAX_AGE = 60 * 60 * 8 // 8 hours

export type AdminSession = { sub: string; username: string; role: 'admin' }

function secretKey() {
  const secret = process.env.AUTH_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('AUTH_SECRET must be set to a random string of at least 32 characters.')
  }
  return new TextEncoder().encode(secret)
}

export async function createSessionToken(session: AdminSession): Promise<string> {
  return new SignJWT({ username: session.username, role: session.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(session.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .setIssuer('bajarchini')
    .setAudience('bajarchini-admin')
    .sign(secretKey())
}

export async function verifySessionToken(
  token: string | undefined | null,
): Promise<AdminSession | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      algorithms: ['HS256'],
      issuer: 'bajarchini',
      audience: 'bajarchini-admin',
    })
    if (payload.role !== 'admin' || !payload.sub) return null
    return { sub: payload.sub, username: String(payload.username ?? ''), role: 'admin' }
  } catch {
    return null
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: SESSION_MAX_AGE,
}
