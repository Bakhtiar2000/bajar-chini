/* eslint-disable @typescript-eslint/no-explicit-any */
import 'server-only'
import { Types } from 'mongoose'
import { connectDB } from '@/lib/db/connect'
import { Article, Category, Market, PriceRecord, Product } from '@/lib/models'
import { notFoundError } from '@/lib/api/response'
import {
  loc,
  locList,
  toArticleDTO,
  toCategoryDTO,
  toCategoryRef,
  toImageList,
  toMarketDTO,
} from './mappers'

/** Admin read models: include drafts, unpublished and inactive records. */

export async function adminListCategories() {
  await connectDB()
  const [docs, counts] = await Promise.all([
    Category.find({}).sort({ displayOrder: 1, createdAt: 1 }).lean(),
    Product.aggregate<{ _id: Types.ObjectId; count: number }>([
      { $group: { _id: '$categoryId', count: { $sum: 1 } } },
    ]),
  ])
  const map = new Map(counts.map((c) => [String(c._id), c.count]))
  return docs.map((d) => toCategoryDTO(d, map.get(String(d._id)) ?? 0))
}

export async function adminGetCategory(id: string) {
  await connectDB()
  const doc = await Category.findById(id).lean()
  if (!doc) throw notFoundError('Category')
  return {
    ...toCategoryDTO(doc),
    parentCategory: doc.parentCategory ? String(doc.parentCategory) : null,
  }
}

export function toAdminProduct(p: any) {
  return {
    id: String(p._id),
    slug: p.slug,
    name: loc(p.name),
    alternativeNames: locList(p.alternativeNames),
    categoryId: String(p.categoryId),
    shortDescription: loc(p.shortDescription),
    description: loc(p.description),
    images: toImageList(p.images),
    identificationGuide: loc(p.identificationGuide),
    goodQualitySigns: locList(p.goodQualitySigns),
    warningSigns: locList(p.warningSigns),
    buyingTips: locList(p.buyingTips),
    seasonalInformation: loc(p.seasonalInformation),
    seasonMonths: Array.isArray(p.seasonMonths) ? [...p.seasonMonths] : [],
    variety: loc(p.variety),
    defaultUnitKey: p.defaultUnit?.key ?? 'kg',
    relatedProducts: (p.relatedProducts ?? []).map(String),
    isFeatured: Boolean(p.isFeatured),
    isPopular: Boolean(p.isPopular),
    isPublished: Boolean(p.isPublished),
    updatedAt: new Date(p.updatedAt).toISOString(),
  }
}

export type AdminProduct = ReturnType<typeof toAdminProduct>

export async function adminListProducts(opts: {
  q?: string
  categoryId?: string
  page: number
  limit: number
}) {
  await connectDB()
  const filter: Record<string, unknown> = {}
  if (opts.categoryId) filter.categoryId = new Types.ObjectId(opts.categoryId)
  if (opts.q) {
    const rx = new RegExp(opts.q.normalize('NFC').replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    filter.$or = [{ searchText: rx }, { slug: rx }]
  }
  const [total, docs, cats] = await Promise.all([
    Product.countDocuments(filter),
    Product.find(filter)
      .select('name slug categoryId images isPublished isFeatured isPopular updatedAt')
      .sort({ updatedAt: -1 })
      .skip((opts.page - 1) * opts.limit)
      .limit(opts.limit)
      .lean(),
    Category.find({}).lean(),
  ])
  const catMap = new Map(cats.map((c) => [String(c._id), toCategoryRef(c)]))
  return {
    total,
    page: opts.page,
    limit: opts.limit,
    items: docs.map((p: any) => ({
      id: String(p._id),
      slug: p.slug,
      name: loc(p.name),
      image: toImageList(p.images)[0]?.url,
      category: catMap.get(String(p.categoryId)) ?? null,
      isPublished: p.isPublished,
      isFeatured: p.isFeatured,
      isPopular: p.isPopular,
      updatedAt: new Date(p.updatedAt).toISOString(),
    })),
  }
}

export async function adminProductOptions() {
  await connectDB()
  const docs = await Product.find({}).select('name slug categoryId').sort({ 'name.en': 1 }).lean()
  return docs.map((p) => ({
    id: String(p._id),
    slug: p.slug,
    name: loc(p.name),
    categoryId: String(p.categoryId),
  }))
}

export async function adminGetProduct(id: string) {
  await connectDB()
  const doc = await Product.findById(id).lean()
  if (!doc) throw notFoundError('Product')
  return toAdminProduct(doc)
}

export async function adminListMarkets() {
  await connectDB()
  const [docs, counts] = await Promise.all([
    Market.find({}).sort({ isDefaultReferenceMarket: -1, createdAt: 1 }).lean(),
    PriceRecord.aggregate<{ _id: Types.ObjectId; count: number; published: number }>([
      {
        $group: {
          _id: '$marketId',
          count: { $sum: 1 },
          published: { $sum: { $cond: [{ $eq: ['$status', 'PUBLISHED'] }, 1, 0] } },
        },
      },
    ]),
  ])
  const map = new Map(counts.map((c) => [String(c._id), c]))
  return docs.map((m) => ({
    ...toMarketDTO(m),
    priceRecordCount: map.get(String(m._id))?.count ?? 0,
    publishedCount: map.get(String(m._id))?.published ?? 0,
  }))
}

export async function adminListArticles() {
  await connectDB()
  const [docs, cats] = await Promise.all([
    Article.find({}).select('-content').sort({ updatedAt: -1 }).lean(),
    Category.find({}).lean(),
  ])
  const catMap = new Map(cats.map((c) => [String(c._id), toCategoryRef(c)]))
  return docs.map((a) => toArticleDTO(a, a.categoryId ? catMap.get(String(a.categoryId)) : null))
}

export async function adminGetArticle(id: string) {
  await connectDB()
  const doc = await Article.findById(id).lean()
  if (!doc) throw notFoundError('Article')
  return { ...toArticleDTO(doc), categoryId: doc.categoryId ? String(doc.categoryId) : null }
}
