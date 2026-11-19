import 'server-only'
import { Types } from 'mongoose'
import { z } from 'zod'
import { connectDB } from '@/lib/db/connect'
import { AdminUser } from '@/lib/models'
import { ApiError, notFoundError } from '@/lib/api/response'
import { hashPassword } from '@/lib/auth/password'
import { ROLES, type Role } from '@/lib/auth/roles'

export const userCreateSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9._-]{3,40}$/, 'Use 3–40 letters, digits, dots, dashes or underscores'),
  password: z.string().min(10, 'Password must be at least 10 characters').max(200),
  role: z.enum(ROLES),
})

export const userUpdateSchema = z
  .object({
    role: z.enum(ROLES).optional(),
    isActive: z.boolean().optional(),
    password: z.string().min(10, 'Password must be at least 10 characters').max(200).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, 'No changes supplied')

export type AdminUserDTO = {
  id: string
  username: string
  role: Role
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toDTO(u: any): AdminUserDTO {
  return {
    id: String(u._id),
    username: u.username,
    role: u.role,
    isActive: u.isActive !== false,
    lastLoginAt: u.lastLoginAt ? new Date(u.lastLoginAt).toISOString() : null,
    createdAt: new Date(u.createdAt).toISOString(),
  }
}

export async function listAdminUsers(): Promise<AdminUserDTO[]> {
  await connectDB()
  const users = await AdminUser.find({}).sort({ createdAt: 1 }).lean()
  return users.map(toDTO)
}

export async function createAdminUser(input: z.infer<typeof userCreateSchema>) {
  await connectDB()
  if (await AdminUser.exists({ username: input.username })) {
    throw new ApiError(409, 'CONFLICT', 'That username is already taken')
  }
  const doc = await AdminUser.create({
    username: input.username,
    passwordHash: await hashPassword(input.password),
    role: input.role,
    isActive: true,
  })
  return toDTO(doc.toObject())
}

/** Keeps at least one active admin, and stops admins from locking themselves out. */
async function assertKeepsAnAdmin(targetId: string, next: { role?: Role; isActive?: boolean }) {
  const target = await AdminUser.findById(targetId).lean()
  if (!target) throw notFoundError('User')
  const losesAdmin =
    target.role === 'admin' &&
    target.isActive !== false &&
    ((next.role && next.role !== 'admin') || next.isActive === false)
  if (!losesAdmin) return target
  const otherAdmins = await AdminUser.countDocuments({
    _id: { $ne: new Types.ObjectId(targetId) },
    role: 'admin',
    isActive: { $ne: false },
  })
  if (otherAdmins === 0) {
    throw new ApiError(409, 'CONFLICT', 'There must always be at least one active admin')
  }
  return target
}

export async function updateAdminUser(
  id: string,
  patch: z.infer<typeof userUpdateSchema>,
  actorId: string,
) {
  await connectDB()
  if (id === actorId && (patch.isActive === false || (patch.role && patch.role !== 'admin'))) {
    throw new ApiError(409, 'CONFLICT', 'You cannot deactivate or demote your own account')
  }
  await assertKeepsAnAdmin(id, patch)
  const $set: Record<string, unknown> = {}
  if (patch.role) $set.role = patch.role
  if (patch.isActive !== undefined) $set.isActive = patch.isActive
  if (patch.password) $set.passwordHash = await hashPassword(patch.password)
  const doc = await AdminUser.findByIdAndUpdate(id, { $set }, { new: true }).lean()
  if (!doc) throw notFoundError('User')
  return toDTO(doc)
}

export async function deleteAdminUser(id: string, actorId: string) {
  await connectDB()
  if (id === actorId) throw new ApiError(409, 'CONFLICT', 'You cannot delete your own account')
  await assertKeepsAnAdmin(id, { isActive: false })
  await AdminUser.deleteOne({ _id: id })
}
