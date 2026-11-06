import { publicRoute } from '@/lib/api/handler'
import { assertObjectId, ok } from '@/lib/api/response'
import { queryPriceHistories } from '@/lib/data/queries'

/** GET /api/prices/history/[productId]?marketId= — full published history, one series per market. */
export const GET = publicRoute<{ productId: string }>(async (req, { productId }) => {
  assertObjectId(productId, 'productId')
  const marketId = req.nextUrl.searchParams.get('marketId') ?? undefined
  if (marketId) assertObjectId(marketId, 'marketId')
  const histories = await queryPriceHistories(productId, marketId)
  return ok(
    histories.map((h) => ({
      market: h.market,
      latest: h.latest,
      change: h.change,
      records: h.records,
    })),
  )
})
