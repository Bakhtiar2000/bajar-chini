import { adminRoute } from '@/lib/api/handler'
import { ok, readJson } from '@/lib/api/response'
import { adminGetArticle } from '@/lib/data/admin'
import { deleteArticle, updateArticle } from '@/lib/services/catalog'
import { articleUpdateSchema } from '@/lib/validation/schemas'

type P = { id: string }

export const GET = adminRoute<P>(async (_req, { id }) => ok(await adminGetArticle(id)))

export const PATCH = adminRoute<P>(async (req, { id }) => {
  const input = articleUpdateSchema.parse(await readJson(req))
  await updateArticle(id, input)
  return ok({ id })
})

export const DELETE = adminRoute<P>(async (_req, { id }) => {
  await deleteArticle(id)
  return ok({ id, deleted: true })
})
