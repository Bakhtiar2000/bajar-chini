import { Types } from 'mongoose'
import { publicRoute } from '@/lib/api/handler'
import { assertObjectId, notFoundError, ok } from '@/lib/api/response'
import { connectDB } from '@/lib/db/connect'
import { Market, Product } from '@/lib/models'
import { queryCategoryBySlug, queryDefaultMarket, queryLatestPrices } from '@/lib/data/queries'
import { toMarketDTO } from '@/lib/data/mappers'
import { currentYearMonth } from '@/lib/prices/now'

/** GET /api/prices/latest?marketId=&category= — latest PUBLISHED observation per product in one market. */
export const GET = publicRoute(async (req) => {
  const sp = req.nextUrl.searchParams
  await connectDB()
  const marketId = sp.get('marketId')
  let market
  if (marketId) {
    assertObjectId(marketId, 'marketId')
    const doc = await Market.findOne({ _id: marketId, isActive: true }).lean()
    if (!doc) throw notFoundError('Market')
    market = toMarketDTO(doc)
  } else {
    market = await queryDefaultMarket()
    if (!market) throw notFoundError('Market')
  }

  const filter: Record<string, unknown> = { isPublished: true }
  const categorySlug = sp.get('category')
  if (categorySlug) {
    const category = await queryCategoryBySlug(categorySlug)
    if (!category) return ok({ market, items: [] })
    filter.categoryId = new Types.ObjectId(category.id)
  }
  const products = await Product.find(filter).select('name slug').sort({ 'name.en': 1 }).lean()
  const latest = await queryLatestPrices(
    products.map((p) => p._id),
    market,
    currentYearMonth(),
  )
  return ok({
    market,
    items: products.map((p) => ({
      product: { id: String(p._id), slug: p.slug, name: p.name },
      latest: latest.get(String(p._id)) ?? null,
    })),
  })
})
