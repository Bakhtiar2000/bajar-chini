import { publicRoute } from '@/lib/api/handler'
import { assertObjectId, badRequest, isObjectId, notFoundError, ok } from '@/lib/api/response'
import { connectDB } from '@/lib/db/connect'
import { Product } from '@/lib/models'
import { queryPriceHistories } from '@/lib/data/queries'
import type { PeriodKey } from '@/lib/types'

/**
 * GET /api/products/[id]/prices?marketId=&period=6m|12m|all
 * Accepts a product id (or slug). Returns one independent series per market.
 */
export const GET = publicRoute<{ slug: string }>(async (req, { slug: idOrSlug }) => {
  const sp = req.nextUrl.searchParams
  const period = (sp.get('period') ?? '12m') as PeriodKey
  if (!['6m', '12m', 'all'].includes(period)) throw badRequest('period must be 6m, 12m or all')
  const marketId = sp.get('marketId') ?? undefined
  if (marketId) assertObjectId(marketId, 'marketId')

  await connectDB()
  const product = await Product.findOne(
    isObjectId(idOrSlug)
      ? { _id: idOrSlug, isPublished: true }
      : { slug: idOrSlug, isPublished: true },
  )
    .select('_id slug name')
    .lean()
  if (!product) throw notFoundError('Product')

  const histories = await queryPriceHistories(String(product._id), marketId)
  return ok({
    product: { id: String(product._id), slug: product.slug, name: product.name },
    period,
    markets: histories.map((h) => ({
      market: h.market,
      latest: h.latest,
      change: h.change,
      analysis: h.periods[period],
    })),
  })
})
