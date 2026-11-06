import { adminRoute } from '@/lib/api/handler'
import { created, ok, readJson } from '@/lib/api/response'
import { adminListArticles } from '@/lib/data/admin'
import { createArticle } from '@/lib/services/catalog'
import { articleCreateSchema } from '@/lib/validation/schemas'

export const GET = adminRoute(async () => ok(await adminListArticles()))

export const POST = adminRoute(async (req) => {
  const input = articleCreateSchema.parse(await readJson(req))
  const doc = await createArticle(input)
  return created({ id: String(doc._id) })
})
