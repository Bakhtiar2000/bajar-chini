import 'server-only'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/db/connect'
import { AdminUser } from '@/lib/models'

export const hashPassword = (plain: string) => bcrypt.hash(plain, 12)

// Used to keep timing similar when the username does not exist.
const DUMMY_HASH = '$2b$12$YvBdTHSgFjMw/OoFl4sHx.U4uSnZsCLLvFI7DemoI7eeDAGoPkIg.'

/**
 * Verifies credentials against the hashed password stored in MongoDB.
 * On first run, if no admin exists yet, the account from ADMIN_USERNAME /
 * ADMIN_PASSWORD is created (password stored only as a bcrypt hash).
 */
export async function verifyAdminCredentials(username: string, password: string) {
  await connectDB()
  const normalized = username.trim().toLowerCase()

  if ((await AdminUser.estimatedDocumentCount()) === 0) {
    const envUser = process.env.ADMIN_USERNAME?.trim().toLowerCase()
    const envPass = process.env.ADMIN_PASSWORD
    if (envUser && envPass) {
      await AdminUser.updateOne(
        { username: envUser },
        { $setOnInsert: { username: envUser, passwordHash: await hashPassword(envPass) } },
        { upsert: true },
      )
    }
  }

  const user = await AdminUser.findOne({ username: normalized })
  const valid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH)
  if (!user || !valid) return null
  user.lastLoginAt = new Date()
  await user.save()
  return { id: String(user._id), username: user.username }
}

// Simple in-memory login throttle (per IP). Good enough for a single-instance admin panel.
const attempts = new Map<string, { count: number; first: number }>()
const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 8

export function isRateLimited(key: string): boolean {
  const now = Date.now()
  const entry = attempts.get(key)
  if (!entry || now - entry.first > WINDOW_MS) return false
  return entry.count >= MAX_ATTEMPTS
}

export function recordFailedAttempt(key: string) {
  const now = Date.now()
  const entry = attempts.get(key)
  if (!entry || now - entry.first > WINDOW_MS) attempts.set(key, { count: 1, first: now })
  else entry.count++
}

export function clearAttempts(key: string) {
  attempts.delete(key)
}
