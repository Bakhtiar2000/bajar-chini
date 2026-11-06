import { adminRoute } from '@/lib/api/handler'
import { created, ok, readJson } from '@/lib/api/response'
import { adminListCategories } from '@/lib/data/admin'
import { createCategory } from '@/lib/services/catalog'
import { categoryCreateSchema } from '@/lib/validation/schemas'

export const GET = adminRoute(async () => ok(await adminListCategories()))

export const POST = adminRoute(async (req) => {
  const input = categoryCreateSchema.parse(await readJson(req))
  const doc = await createCategory(input)
  return created({ id: String(doc._id) })
})
