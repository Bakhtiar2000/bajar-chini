import { adminRoute } from '@/lib/api/handler'
import { ok, readJson } from '@/lib/api/response'
import { adminGetProduct } from '@/lib/data/admin'
import { deleteProduct, updateProduct } from '@/lib/services/catalog'
import { productUpdateSchema } from '@/lib/validation/schemas'

type P = { id: string }

export const GET = adminRoute<P>(async (_req, { id }) => ok(await adminGetProduct(id)))

export const PATCH = adminRoute<P>(async (req, { id }) => {
  const input = productUpdateSchema.parse(await readJson(req))
  await updateProduct(id, input)
  return ok({ id })
})

export const DELETE = adminRoute<P>(async (_req, { id }) => {
  await deleteProduct(id)
  return ok({ id, deleted: true })
})
