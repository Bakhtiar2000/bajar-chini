import { adminRoute, pageParams } from '@/lib/api/handler'
import { assertObjectId, ok } from '@/lib/api/response'
import { getPriceHistory } from '@/lib/services/prices'

export const GET = adminRoute(async (req) => {
  const sp = req.nextUrl.searchParams
  const productId = sp.get('productId') || undefined
  const marketId = sp.get('marketId') || undefined
  if (productId) assertObjectId(productId, 'productId')
  if (marketId) assertObjectId(marketId, 'marketId')
  const { page, limit } = pageParams(req, { page: 1, limit: 25 })
  return ok(
    await getPriceHistory({
      productId,
      marketId,
      status: sp.get('status') || undefined,
      page,
      limit,
    }),
  )
})
