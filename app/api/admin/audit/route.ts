import { adminRoute, pageParams } from '@/lib/api/handler'
import { assertObjectId, ok } from '@/lib/api/response'
import { listPriceAudit } from '@/lib/services/prices'

/** GET /api/admin/audit?productId=&marketId=&actor=&action=&page= — price change history. */
export const GET = adminRoute(
  async (req) => {
    const sp = req.nextUrl.searchParams
    const productId = sp.get('productId') || undefined
    const marketId = sp.get('marketId') || undefined
    if (productId) assertObjectId(productId, 'productId')
    if (marketId) assertObjectId(marketId, 'marketId')
    const { page, limit } = pageParams(req, { page: 1, limit: 30 })
    return ok(
      await listPriceAudit({
        productId,
        marketId,
        actor: sp.get('actor')?.trim().slice(0, 60) || undefined,
        action: sp.get('action') || undefined,
        page,
        limit,
      }),
    )
  },
  { permission: 'audit:view' },
)
