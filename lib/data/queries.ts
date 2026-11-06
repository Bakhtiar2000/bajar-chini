/* eslint-disable @typescript-eslint/no-explicit-any */
import 'server-only'
import { Types } from 'mongoose'
import { connectDB } from '@/lib/db/connect'
import { Article, Category, Market, PriceRecord, Product } from '@/lib/models'
import { analyzePeriod, calculateMonthlyChange, type YearMonth } from '@/lib/prices/calc'
import { currentYearMonth } from '@/lib/prices/now'
import { escapeRegex, normalizeSearch } from '@/lib/utils'
import type {
  ArticleDTO,
  CategoryDTO,
  CategoryRef,
  LatestPriceDTO,
  MarketDTO,
  MarketPriceHistory,
  ProductCardDTO,
  ProductDetailDTO,
  SearchResultDTO,
} from '@/lib/types'
import {
  loc,
  locList,
  toArticleDTO,
  toCategoryDTO,
  toCategoryRef,
  toImageList,
  toLatestPriceDTO,
  toMarketDTO,
  toPriceRecordDTO,
  toProductCard,
} from './mappers'

const PUBLISHED = 'PUBLISHED'

export async function queryDefaultMarket(): Promise<MarketDTO | null> {
  await connectDB()
  const m =
    (await Market.findOne({ isDefaultReferenceMarket: true, isActive: true }).lean()) ??
    (await Market.findOne({ isActive: true }).sort({ createdAt: 1 }).lean())
  return m ? toMarketDTO(m) : null
}

export async function queryActiveMarkets(): Promise<MarketDTO[]> {
  await connectDB()
  const docs = await Market.find({ isActive: true })
    .sort({ isDefaultReferenceMarket: -1, createdAt: 1 })
    .lean()
  return docs.map(toMarketDTO)
}

export async function queryCategories(
  opts: { includeInactive?: boolean } = {},
): Promise<CategoryDTO[]> {
  await connectDB()
  const filter = opts.includeInactive ? {} : { isActive: true }
  const [docs, counts] = await Promise.all([
    Category.find(filter).sort({ displayOrder: 1, createdAt: 1 }).lean(),
    Product.aggregate<{ _id: Types.ObjectId; count: number }>([
      { $match: { isPublished: true } },
      { $group: { _id: '$categoryId', count: { $sum: 1 } } },
    ]),
  ])
  const countMap = new Map(counts.map((c) => [String(c._id), c.count]))
  return docs.map((d) => toCategoryDTO(d, countMap.get(String(d._id)) ?? 0))
}

export async function queryCategoryBySlug(slug: string): Promise<CategoryDTO | null> {
  await connectDB()
  const doc = await Category.findOne({ slug, isActive: true }).lean()
  if (!doc) return null
  const productCount = await Product.countDocuments({ categoryId: doc._id, isPublished: true })
  return toCategoryDTO(doc, productCount)
}

/**
 * Latest PUBLISHED observation per product for one market, in a single aggregation.
 */
export async function queryLatestPrices(
  productIds: Types.ObjectId[],
  market: MarketDTO,
  now: YearMonth,
): Promise<Map<string, LatestPriceDTO>> {
  if (!productIds.length) return new Map()
  const rows = await PriceRecord.aggregate<{ _id: Types.ObjectId; doc: any }>([
    {
      $match: {
        productId: { $in: productIds },
        marketId: new Types.ObjectId(market.id),
        status: PUBLISHED,
      },
    },
    { $sort: { year: -1, month: -1 } },
    { $group: { _id: '$productId', doc: { $first: '$$ROOT' } } },
  ])
  return new Map(rows.map((r) => [String(r._id), toLatestPriceDTO(r.doc, market, now)]))
}

async function categoryRefMap(ids?: Types.ObjectId[]): Promise<Map<string, CategoryRef>> {
  const docs = await Category.find(ids ? { _id: { $in: ids } } : {}).lean()
  return new Map(docs.map((c) => [String(c._id), toCategoryRef(c)]))
}

/** Hydrates product docs into cards with category + latest price (constant number of queries). */
async function hydrateCards(
  docs: any[],
  now: YearMonth = currentYearMonth(),
): Promise<ProductCardDTO[]> {
  if (!docs.length) return []
  const categoryIds = [...new Set(docs.map((d) => String(d.categoryId)))].map(
    (id) => new Types.ObjectId(id),
  )
  const [cats, market] = await Promise.all([categoryRefMap(categoryIds), queryDefaultMarket()])
  const latest = market
    ? await queryLatestPrices(
        docs.map((d) => d._id),
        market,
        now,
      )
    : new Map<string, LatestPriceDTO>()
  return docs.map((d) =>
    toProductCard(d, cats.get(String(d.categoryId)), latest.get(String(d._id)) ?? null),
  )
}

const CARD_FIELDS =
  'name slug shortDescription images variety seasonMonths categoryId isFeatured isPopular'

export async function queryProductCards(
  filter: Record<string, unknown> = {},
  opts: { limit?: number; skip?: number; sort?: Record<string, 1 | -1> } = {},
): Promise<ProductCardDTO[]> {
  await connectDB()
  let q = Product.find({ isPublished: true, ...filter })
    .select(CARD_FIELDS)
    .sort(opts.sort ?? { 'name.en': 1 })
  if (opts.skip) q = q.skip(opts.skip)
  if (opts.limit) q = q.limit(opts.limit)
  const docs = await q.lean()
  return hydrateCards(docs)
}

export async function queryProductCount(filter: Record<string, unknown> = {}): Promise<number> {
  await connectDB()
  return Product.countDocuments({ isPublished: true, ...filter })
}

export async function queryProductDetail(slug: string): Promise<ProductDetailDTO | null> {
  await connectDB()
  const p: any = await Product.findOne({ slug, isPublished: true }).lean()
  if (!p) return null
  const now = currentYearMonth()

  const [card] = await hydrateCards([p], now)

  // Related products: explicit list first, then fill from the same category.
  const relatedIds: Types.ObjectId[] = (p.relatedProducts ?? []).slice(0, 8)
  let relatedDocs = relatedIds.length
    ? await Product.find({ _id: { $in: relatedIds }, isPublished: true })
        .select(CARD_FIELDS)
        .lean()
    : []
  if (relatedDocs.length < 4) {
    const extra = await Product.find({
      categoryId: p.categoryId,
      isPublished: true,
      _id: { $nin: [p._id, ...relatedDocs.map((d) => d._id)] },
    })
      .select(CARD_FIELDS)
      .limit(4 - relatedDocs.length)
      .lean()
    relatedDocs = [...relatedDocs, ...extra]
  }
  const related = await hydrateCards(relatedDocs, now)

  const priceHistories = await queryPriceHistories(String(p._id), undefined, now)

  return {
    ...card,
    description: loc(p.description),
    alternativeNames: locList(p.alternativeNames),
    images: toImageList(p.images),
    identificationGuide: loc(p.identificationGuide),
    goodQualitySigns: locList(p.goodQualitySigns),
    warningSigns: locList(p.warningSigns),
    buyingTips: locList(p.buyingTips),
    seasonalInformation: loc(p.seasonalInformation),
    seasonMonths: Array.isArray(p.seasonMonths) ? [...p.seasonMonths] : [],
    defaultUnit: p.defaultUnit
      ? { key: p.defaultUnit.key, bn: p.defaultUnit.bn, en: p.defaultUnit.en }
      : { key: 'kg', bn: 'কেজি', en: 'kg' },
    updatedAt: new Date(p.updatedAt).toISOString(),
    related,
    priceHistories,
  }
}

/**
 * Published price history for one product, grouped per market (default market first).
 * Each market is an independent series — observations from different markets are never merged.
 */
export async function queryPriceHistories(
  productId: string,
  marketId?: string,
  now: YearMonth = currentYearMonth(),
): Promise<MarketPriceHistory[]> {
  await connectDB()
  const filter: Record<string, unknown> = {
    productId: new Types.ObjectId(productId),
    status: PUBLISHED,
  }
  if (marketId) filter.marketId = new Types.ObjectId(marketId)
  const records = await PriceRecord.find(filter).sort({ year: -1, month: -1 }).lean()
  const marketIds = [...new Set(records.map((r) => String(r.marketId)))]
  const markets = marketIds.length
    ? (await Market.find({ _id: { $in: marketIds }, isActive: true }).lean()).map(toMarketDTO)
    : []
  markets.sort((a, b) => Number(b.isDefaultReferenceMarket) - Number(a.isDefaultReferenceMarket))

  return markets.map((market) => {
    const own = records.filter((r) => String(r.marketId) === market.id)
    const dtos = own.map(toPriceRecordDTO)
    return {
      market,
      latest: own[0] ? toLatestPriceDTO(own[0], market, now) : null,
      change: calculateMonthlyChange(dtos),
      periods: {
        '6m': analyzePeriod(dtos, '6m', now),
        '12m': analyzePeriod(dtos, '12m', now),
        all: analyzePeriod(dtos, 'all', now),
      },
      records: dtos,
    }
  })
}

export async function queryArticles(
  opts: { limit?: number; skip?: number } = {},
): Promise<ArticleDTO[]> {
  await connectDB()
  let q = Article.find({ isPublished: true })
    .sort({ publishedAt: -1, createdAt: -1 })
    .select('-content')
  if (opts.skip) q = q.skip(opts.skip)
  if (opts.limit) q = q.limit(opts.limit)
  const docs = await q.lean()
  const catIds = docs.map((d) => d.categoryId).filter(Boolean) as Types.ObjectId[]
  const cats = catIds.length ? await categoryRefMap(catIds) : new Map<string, CategoryRef>()
  return docs.map((d) => toArticleDTO(d, d.categoryId ? cats.get(String(d.categoryId)) : null))
}

export async function queryArticleBySlug(slug: string): Promise<ArticleDTO | null> {
  await connectDB()
  const doc = await Article.findOne({ slug, isPublished: true }).lean()
  if (!doc) return null
  const cat = doc.categoryId ? await Category.findById(doc.categoryId).lean() : null
  return toArticleDTO(doc, cat ? toCategoryRef(cat) : null)
}

/**
 * Bengali + English search across product names, alternative names and category names.
 * Text is NFC-normalised so that different encodings of Bengali letters (e.g. য়) match.
 */
export async function querySearch(raw: string, limit = 20): Promise<SearchResultDTO> {
  const q = normalizeSearch(raw)
  if (!q) return { products: [], categories: [] }
  await connectDB()
  const pattern = new RegExp(escapeRegex(q), 'i')
  // Categories match on word prefixes only ("rui" must not match "Fruits").
  const wordPrefix = new RegExp(`(^|\\s)${escapeRegex(q)}`, 'i')

  const categoryDocs = await Category.find({
    isActive: true,
    $or: [{ 'name.bn': wordPrefix }, { 'name.en': wordPrefix }],
  })
    .sort({ displayOrder: 1 })
    .lean()
  const categoryIds = categoryDocs.map((c) => c._id)

  const docs = await Product.find({
    isPublished: true,
    $or: [
      { searchText: pattern },
      ...(categoryIds.length ? [{ categoryId: { $in: categoryIds } }] : []),
    ],
  })
    .select(`${CARD_FIELDS} searchText`)
    .limit(200)
    .lean()

  const startsWord = new RegExp(`(^|\\s|\\|)${escapeRegex(q)}`, 'i')
  const score = (d: any) => {
    const names = [d.name?.bn, d.name?.en].map((n: string) => normalizeSearch(n ?? ''))
    if (names.includes(q)) return 0
    if (names.some((n) => n.startsWith(q))) return 1
    if (startsWord.test(d.searchText ?? '')) return 2
    if (pattern.test(d.searchText ?? '')) return 3
    return 4 // matched through category
  }
  docs.sort((a, b) => score(a) - score(b) || String(a.name?.en).localeCompare(String(b.name?.en)))

  return {
    products: await hydrateCards(docs.slice(0, limit)),
    categories: categoryDocs.map(toCategoryRef),
  }
}

export async function queryAllSlugs(): Promise<{
  products: string[]
  categories: string[]
  articles: string[]
}> {
  await connectDB()
  const [products, categories, articles] = await Promise.all([
    Product.find({ isPublished: true }).select('slug').lean(),
    Category.find({ isActive: true }).select('slug').lean(),
    Article.find({ isPublished: true }).select('slug').lean(),
  ])
  return {
    products: products.map((p) => p.slug),
    categories: categories.map((c) => c.slug),
    articles: articles.map((a) => a.slug),
  }
}
