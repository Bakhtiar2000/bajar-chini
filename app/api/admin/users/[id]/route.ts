import { adminRoute } from '@/lib/api/handler'
import { ok, readJson } from '@/lib/api/response'
import { deleteAdminUser, updateAdminUser, userUpdateSchema } from '@/lib/services/admin-users'

type P = { id: string }

export const PATCH = adminRoute<P>(
  async (req, { id }, session) =>
    ok(await updateAdminUser(id, userUpdateSchema.parse(await readJson(req)), session.sub)),
  { permission: 'users:manage' },
)

export const DELETE = adminRoute<P>(
  async (_req, { id }, session) => {
    await deleteAdminUser(id, session.sub)
    return ok({ id, deleted: true })
  },
  { permission: 'users:manage' },
)
