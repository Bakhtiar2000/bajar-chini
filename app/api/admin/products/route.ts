import { adminRoute, pageParams } from '@/lib/api/handler'
import { assertObjectId, created, ok, readJson } from '@/lib/api/response'
import { adminListProducts } from '@/lib/data/admin'
import { createProduct } from '@/lib/services/catalog'
import { productCreateSchema } from '@/lib/validation/schemas'

export const GET = adminRoute(async (req) => {
  const { page, limit } = pageParams(req, { page: 1, limit: 20 })
  const categoryId = req.nextUrl.searchParams.get('categoryId') || undefined
  if (categoryId) assertObjectId(categoryId, 'categoryId')
  const q = req.nextUrl.searchParams.get('q')?.slice(0, 100) || undefined
  return ok(await adminListProducts({ q, categoryId, page, limit }))
})

export const POST = adminRoute(async (req) => {
  const input = productCreateSchema.parse(await readJson(req))
  const doc = await createProduct(input)
  return created({ id: String(doc._id) })
})
