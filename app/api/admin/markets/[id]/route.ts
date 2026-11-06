import { adminRoute } from '@/lib/api/handler'
import { ok, readJson } from '@/lib/api/response'
import { deleteMarket, updateMarket } from '@/lib/services/catalog'
import { marketUpdateSchema } from '@/lib/validation/schemas'

type P = { id: string }

export const PATCH = adminRoute<P>(async (req, { id }) => {
  const input = marketUpdateSchema.parse(await readJson(req))
  await updateMarket(id, input)
  return ok({ id })
})

export const DELETE = adminRoute<P>(async (_req, { id }) => {
  await deleteMarket(id)
  return ok({ id, deleted: true })
})
