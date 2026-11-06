import { publicRoute } from '@/lib/api/handler'
import { notFoundError, ok } from '@/lib/api/response'
import { getProductDetail } from '@/lib/data/public'

export const GET = publicRoute<{ slug: string }>(async (_req, { slug }) => {
  const product = await getProductDetail(slug)
  if (!product) throw notFoundError('Product')
  return ok(product)
})
