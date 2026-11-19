import { adminRoute } from '@/lib/api/handler'
import { created, ok, readJson } from '@/lib/api/response'
import { createAdminUser, listAdminUsers, userCreateSchema } from '@/lib/services/admin-users'

export const GET = adminRoute(async () => ok(await listAdminUsers()), {
  permission: 'users:manage',
})

export const POST = adminRoute(
  async (req) => created(await createAdminUser(userCreateSchema.parse(await readJson(req)))),
  { permission: 'users:manage' },
)
