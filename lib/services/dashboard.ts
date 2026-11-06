import 'server-only'
import { Types } from 'mongoose'
import { connectDB } from '@/lib/db/connect'
import { Article, Category, Market, PriceRecord, Product } from '@/lib/models'
import { monthIndex, previousMonth } from '@/lib/prices/calc'
import { currentYearMonth } from '@/lib/prices/now'
import { loc, toMarketDTO } from '@/lib/data/mappers'

export async function getDashboardStats() {
  await connectDB()
  const now = currentYearMonth()
  const last = previousMonth(now)

  const [totalProducts, publishedProducts, totalCategories, totalMarkets, totalArticles, market] =
    await Promise.all([
      Product.countDocuments({}),
      Product.find({ isPublished: true }).select('name slug').lean(),
      Category.countDocuments({}),
      Market.countDocuments({}),
      Article.countDocuments({}),
      Market.findOne({ isDefaultReferenceMarket: true }).lean(),
    ])

  if (!market) {
    return {
      now,
      totalProducts,
      totalCategories,
      totalMarkets,
      totalArticles,
      market: null,
      latestPublished: null,
      completion: { entered: 0, published: 0, total: publishedProducts.length, percent: 0 },
      missing: [],
      outdated: [],
    }
  }
  const marketId = new Types.ObjectId(String(market._id))
  const productIds = publishedProducts.map((p) => p._id)

  const [latestPublished, currentRecords, latestPerProduct] = await Promise.all([
    PriceRecord.findOne({ marketId, status: 'PUBLISHED' })
      .sort({ year: -1, month: -1, publishedAt: -1 })
      .lean(),
    PriceRecord.find({ marketId, month: now.month, year: now.year, productId: { $in: productIds } })
      .select('productId status')
      .lean(),
    PriceRecord.aggregate<{ _id: Types.ObjectId; year: number; month: number }>([
      { $match: { marketId, status: 'PUBLISHED', productId: { $in: productIds } } },
      { $sort: { year: -1, month: -1 } },
      { $group: { _id: '$productId', year: { $first: '$year' }, month: { $first: '$month' } } },
    ]),
  ])

  const enteredSet = new Set(currentRecords.map((r) => String(r.productId)))
  const publishedThisMonth = currentRecords.filter((r) => r.status === 'PUBLISHED').length
  const latestMap = new Map(latestPerProduct.map((l) => [String(l._id), l]))
  const lastIdx = monthIndex(last)

  const missing = publishedProducts
    .filter((p) => !enteredSet.has(String(p._id)))
    .map((p) => ({ id: String(p._id), slug: p.slug, name: loc(p.name) }))

  const outdated = publishedProducts
    .map((p) => ({ p, latest: latestMap.get(String(p._id)) }))
    .filter(({ latest }) => !latest || monthIndex(latest) < lastIdx)
    .map(({ p, latest }) => ({
      id: String(p._id),
      slug: p.slug,
      name: loc(p.name),
      latest: latest ? { year: latest.year, month: latest.month } : null,
    }))

  const total = publishedProducts.length
  return {
    now,
    totalProducts,
    totalCategories,
    totalMarkets,
    totalArticles,
    market: toMarketDTO(market),
    latestPublished: latestPublished
      ? {
          month: latestPublished.month,
          year: latestPublished.year,
          publishedAt: latestPublished.publishedAt
            ? new Date(latestPublished.publishedAt).toISOString()
            : null,
        }
      : null,
    completion: {
      entered: enteredSet.size,
      published: publishedThisMonth,
      total,
      percent: total ? Math.round((enteredSet.size / total) * 100) : 0,
    },
    missing,
    outdated,
  }
}
