import { adminRoute } from '@/lib/api/handler'
import { ok, readJson } from '@/lib/api/response'
import { adminGetCategory } from '@/lib/data/admin'
import { deleteCategory, updateCategory } from '@/lib/services/catalog'
import { categoryUpdateSchema } from '@/lib/validation/schemas'

type P = { id: string }

export const GET = adminRoute<P>(async (_req, { id }) => ok(await adminGetCategory(id)))

export const PATCH = adminRoute<P>(async (req, { id }) => {
  const input = categoryUpdateSchema.parse(await readJson(req))
  await updateCategory(id, input)
  return ok({ id })
})

export const DELETE = adminRoute<P>(async (_req, { id }) => {
  await deleteCategory(id)
  return ok({ id, deleted: true })
})
