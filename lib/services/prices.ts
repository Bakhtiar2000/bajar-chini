/* eslint-disable @typescript-eslint/no-explicit-any */
import 'server-only'
import { Types } from 'mongoose'
import { connectDB, withTransaction } from '@/lib/db/connect'
import { Category, Market, PriceRecord, Product } from '@/lib/models'
import { ApiError, notFoundError } from '@/lib/api/response'
import { invalidate } from '@/lib/revalidate'
import { TAGS } from '@/lib/cache-tags'
import { dhakaParts } from '@/lib/format'
import { calculateReferencePrice, previousMonth } from '@/lib/prices/calc'
import { unitFromKey } from '@/lib/units'
import { loc, toCategoryRef, toMarketDTO, toPriceRecordDTO } from '@/lib/data/mappers'
import {
  bulkEntrySchema,
  type bulkSaveSchema,
  type priceRecordUpdateSchema,
} from '@/lib/validation/schemas'
import type { z } from 'zod'
import type { CategoryRef, PriceRecordDTO } from '@/lib/types'
import type { Unit } from '@/lib/units'

/** Parses YYYY-MM-DD as midday in Bangladesh so the calendar date never shifts. */
export function parseObservationDate(value: string): Date {
  const d = new Date(`${value}T12:00:00+06:00`)
  if (Number.isNaN(d.getTime()))
    throw new ApiError(422, 'VALIDATION_ERROR', 'Invalid observation date')
  return d
}

function assertDateInMonth(date: Date, month: number, year: number, label = 'Observation date') {
  const p = dhakaParts(date)
  if (p.month !== month || p.year !== year) {
    throw new ApiError(
      422,
      'VALIDATION_ERROR',
      `${label} must fall within the selected month (${month}/${year}).`,
    )
  }
  if (date.getTime() > Date.now() + 24 * 60 * 60 * 1000) {
    throw new ApiError(422, 'VALIDATION_ERROR', `${label} cannot be in the future.`)
  }
}

export type MonthlyRow = {
  product: {
    id: string
    slug: string
    name: { bn: string; en: string }
    isPublished: boolean
    defaultUnit: Unit
    category: CategoryRef | null
  }
  current: PriceRecordDTO | null
  previous: PriceRecordDTO | null
}

export async function getMonthlySheet(marketId: string, month: number, year: number) {
  await connectDB()
  const market = await Market.findById(marketId).lean()
  if (!market) throw notFoundError('Market')
  const prev = previousMonth({ year, month })
  const mId = new Types.ObjectId(marketId)

  const [products, categories, current, previous] = await Promise.all([
    Product.find({ isPublished: true })
      .select('name slug categoryId defaultUnit isPublished')
      .sort({ 'name.en': 1 })
      .lean(),
    Category.find({}).sort({ displayOrder: 1 }).lean(),
    PriceRecord.find({ marketId: mId, month, year }).lean(),
    PriceRecord.find({ marketId: mId, month: prev.month, year: prev.year }).lean(),
  ])
  const catMap = new Map(categories.map((c) => [String(c._id), toCategoryRef(c)]))
  const curMap = new Map(current.map((r) => [String(r.productId), toPriceRecordDTO(r)]))
  const prevMap = new Map(previous.map((r) => [String(r.productId), toPriceRecordDTO(r)]))

  const order = new Map(categories.map((c, i) => [String(c._id), i]))
  const rows: MonthlyRow[] = products
    .map((p: any) => ({
      product: {
        id: String(p._id),
        slug: p.slug,
        name: loc(p.name),
        isPublished: p.isPublished,
        defaultUnit: p.defaultUnit?.key
          ? { key: p.defaultUnit.key, bn: p.defaultUnit.bn, en: p.defaultUnit.en }
          : unitFromKey('kg'),
        category: catMap.get(String(p.categoryId)) ?? null,
      },
      current: curMap.get(String(p._id)) ?? null,
      previous: prevMap.get(String(p._id)) ?? null,
    }))
    .sort(
      (a, b) =>
        (order.get(a.product.category?.id ?? '') ?? 999) -
          (order.get(b.product.category?.id ?? '') ?? 999) ||
        a.product.name.en.localeCompare(b.product.name.en),
    )

  const draftCount = current.filter((r) => r.status === 'DRAFT').length
  const publishedCount = current.filter((r) => r.status === 'PUBLISHED').length
  return {
    market: toMarketDTO(market),
    month,
    year,
    previousPeriod: prev,
    rows,
    summary: {
      totalProducts: rows.length,
      entered: current.length,
      draft: draftCount,
      published: publishedCount,
      missing: rows.filter((r) => !r.current).length,
    },
    categories: categories.map((c) => toCategoryRef(c)),
  }
}

type BulkSaveInput = z.infer<typeof bulkSaveSchema>

export async function bulkSavePrices(input: BulkSaveInput, actor: string) {
  await connectDB()
  const market = await Market.findById(input.marketId).lean()
  if (!market) throw notFoundError('Market')
  const baseDate = parseObservationDate(input.observedAt)
  assertDateInMonth(baseDate, input.month, input.year)

  const errors: { index: number; productId?: string; message: string }[] = []
  const valid: { index: number; entry: z.infer<typeof bulkEntrySchema>; observedAt: Date }[] = []

  input.entries.forEach((raw, index) => {
    const parsed = bulkEntrySchema.safeParse(raw)
    const productId = (raw as { productId?: string })?.productId
    if (!parsed.success) {
      errors.push({
        index,
        productId,
        message: parsed.error.issues.map((i) => i.message).join('; '),
      })
      return
    }
    try {
      const observedAt = parsed.data.observedAt
        ? parseObservationDate(parsed.data.observedAt)
        : baseDate
      if (parsed.data.observedAt) assertDateInMonth(observedAt, input.month, input.year)
      valid.push({ index, entry: parsed.data, observedAt })
    } catch (e) {
      errors.push({ index, productId, message: (e as Error).message })
    }
  })

  // Reject duplicates in the same request and unknown products.
  const seen = new Set<string>()
  const deduped = valid.filter((v) => {
    if (seen.has(v.entry.productId)) {
      errors.push({
        index: v.index,
        productId: v.entry.productId,
        message: 'Duplicate product in request',
      })
      return false
    }
    seen.add(v.entry.productId)
    return true
  })
  const existingProducts = await Product.find({
    _id: { $in: deduped.map((v) => v.entry.productId) },
  })
    .select('_id')
    .lean()
  const existingSet = new Set(existingProducts.map((p) => String(p._id)))
  const toSave = deduped.filter((v) => {
    if (!existingSet.has(v.entry.productId)) {
      errors.push({
        index: v.index,
        productId: v.entry.productId,
        message: 'Product does not exist',
      })
      return false
    }
    return true
  })

  if (!toSave.length) {
    return { saved: 0, inserted: 0, updated: 0, errors, touchedPublished: false }
  }

  const marketId = new Types.ObjectId(input.marketId)
  const result = await withTransaction(async (session) => {
    const ops = toSave.map(({ entry, observedAt }) => ({
      updateOne: {
        // Each record is scoped to its own month: other months are never touched.
        filter: {
          productId: new Types.ObjectId(entry.productId),
          marketId,
          month: input.month,
          year: input.year,
        },
        update: {
          $set: {
            minimumPrice: entry.minimumPrice,
            maximumPrice: entry.maximumPrice,
            referencePrice: calculateReferencePrice(entry.minimumPrice, entry.maximumPrice),
            unit: unitFromKey(entry.unitKey),
            notes: entry.notes ?? '',
            observedAt,
            sourceType: input.sourceType,
            sourceDescription: input.sourceDescription ?? '',
            isDemo: false,
            updatedBy: actor,
          },
          $setOnInsert: { status: 'DRAFT', currency: 'BDT', createdBy: actor },
        },
        upsert: true,
      },
    }))
    const res = await PriceRecord.bulkWrite(ops, { session, ordered: false, timestamps: true })
    const touchedPublished = await PriceRecord.exists({
      marketId,
      month: input.month,
      year: input.year,
      status: 'PUBLISHED',
      productId: { $in: toSave.map((v) => new Types.ObjectId(v.entry.productId)) },
    }).session(session ?? null)
    return { res, touchedPublished: Boolean(touchedPublished) }
  })

  // Corrections to already-published records go live immediately.
  if (result.touchedPublished) invalidate(TAGS.prices)

  return {
    saved: toSave.length,
    inserted: result.res.upsertedCount,
    updated: result.res.modifiedCount,
    errors,
    touchedPublished: result.touchedPublished,
  }
}

export async function setPublication(input: {
  marketId: string
  month: number
  year: number
  action: 'publish' | 'unpublish'
  productIds?: string[]
}) {
  await connectDB()
  const filter: Record<string, unknown> = {
    marketId: new Types.ObjectId(input.marketId),
    month: input.month,
    year: input.year,
    status: input.action === 'publish' ? 'DRAFT' : 'PUBLISHED',
  }
  if (input.productIds?.length)
    filter.productId = { $in: input.productIds.map((id) => new Types.ObjectId(id)) }
  const res = await PriceRecord.updateMany(filter, {
    $set:
      input.action === 'publish'
        ? { status: 'PUBLISHED', publishedAt: new Date() }
        : { status: 'DRAFT', publishedAt: null },
  })
  invalidate(TAGS.prices)
  return { modified: res.modifiedCount }
}

type RecordPatch = z.infer<typeof priceRecordUpdateSchema>

export async function updatePriceRecord(id: string, patch: RecordPatch, actor: string) {
  await connectDB()
  const doc = await PriceRecord.findById(id)
  if (!doc) throw notFoundError('Price record')
  const wasPublished = doc.status === 'PUBLISHED'

  if (patch.minimumPrice !== undefined) doc.minimumPrice = patch.minimumPrice
  if (patch.maximumPrice !== undefined) doc.maximumPrice = patch.maximumPrice
  if (doc.minimumPrice > doc.maximumPrice) {
    throw new ApiError(422, 'VALIDATION_ERROR', 'Minimum price cannot exceed maximum price')
  }
  if (patch.unitKey) doc.unit = unitFromKey(patch.unitKey)
  if (patch.notes !== undefined) doc.notes = patch.notes
  if (patch.sourceType) doc.sourceType = patch.sourceType
  if (patch.sourceDescription !== undefined) doc.sourceDescription = patch.sourceDescription
  if (patch.observedAt) {
    const d = parseObservationDate(patch.observedAt)
    assertDateInMonth(d, doc.month, doc.year)
    doc.observedAt = d
  }
  if (patch.status && patch.status !== doc.status) {
    doc.status = patch.status
    doc.publishedAt = patch.status === 'PUBLISHED' ? new Date() : null
  }
  // A corrected value is a verified admin entry, no longer illustrative demo data.
  if (patch.minimumPrice !== undefined || patch.maximumPrice !== undefined) doc.isDemo = false
  doc.referencePrice = calculateReferencePrice(doc.minimumPrice, doc.maximumPrice)
  doc.updatedBy = actor
  await doc.save()

  if (wasPublished || doc.status === 'PUBLISHED') invalidate(TAGS.prices)
  return toPriceRecordDTO(doc.toObject())
}

export async function deletePriceRecord(id: string) {
  await connectDB()
  const doc = await PriceRecord.findById(id).lean()
  if (!doc) throw notFoundError('Price record')
  if (doc.status === 'PUBLISHED') {
    throw new ApiError(
      409,
      'CONFLICT',
      'Published records cannot be deleted. Unpublish it first or correct the values.',
    )
  }
  await PriceRecord.deleteOne({ _id: id })
}

export async function getPriceHistory(filter: {
  productId?: string
  marketId?: string
  status?: string
  page: number
  limit: number
}) {
  await connectDB()
  const q: Record<string, unknown> = {}
  if (filter.productId) q.productId = new Types.ObjectId(filter.productId)
  if (filter.marketId) q.marketId = new Types.ObjectId(filter.marketId)
  if (filter.status === 'DRAFT' || filter.status === 'PUBLISHED') q.status = filter.status
  const [total, records] = await Promise.all([
    PriceRecord.countDocuments(q),
    PriceRecord.find(q)
      .sort({ year: -1, month: -1, updatedAt: -1 })
      .skip((filter.page - 1) * filter.limit)
      .limit(filter.limit)
      .lean(),
  ])
  const productIds = [...new Set(records.map((r) => String(r.productId)))]
  const marketIds = [...new Set(records.map((r) => String(r.marketId)))]
  const [products, markets] = await Promise.all([
    Product.find({ _id: { $in: productIds } })
      .select('name slug')
      .lean(),
    Market.find({ _id: { $in: marketIds } })
      .select('name slug')
      .lean(),
  ])
  const pMap = new Map(products.map((p) => [String(p._id), { name: loc(p.name), slug: p.slug }]))
  const mMap = new Map(markets.map((m) => [String(m._id), { name: loc(m.name), slug: m.slug }]))
  return {
    total,
    page: filter.page,
    limit: filter.limit,
    items: records.map((r) => ({
      ...toPriceRecordDTO(r),
      product: pMap.get(String(r.productId)) ?? null,
      market: mMap.get(String(r.marketId)) ?? null,
      createdBy: r.createdBy || undefined,
      updatedBy: r.updatedBy || undefined,
    })),
  }
}
