/* eslint-disable @typescript-eslint/no-explicit-any */
import 'server-only'
import { Types } from 'mongoose'
import { connectDB, withTransaction } from '@/lib/db/connect'
import { Category, Market, PriceRecord, Product } from '@/lib/models'
import { PriceAudit } from '@/lib/models/PriceAudit'
import { can, type Role } from '@/lib/auth/roles'
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

/** Who is making a change (from the verified admin session). */
export type Actor = { username: string; role: Role }

type Snap = {
  minimumPrice: number
  maximumPrice: number
  referencePrice: number
  unit: string
  notes: string
  status: string
  observedAt: Date
  isDemo: boolean
}

function snapshot(r: any): Snap {
  return {
    minimumPrice: r.minimumPrice,
    maximumPrice: r.maximumPrice,
    referencePrice: r.referencePrice,
    unit: r.unit?.key ?? '',
    notes: r.notes ?? '',
    status: r.status,
    observedAt: r.observedAt,
    isDemo: Boolean(r.isDemo),
  }
}

function sameValues(a: Snap, b: Snap) {
  return (
    a.minimumPrice === b.minimumPrice &&
    a.maximumPrice === b.maximumPrice &&
    a.unit === b.unit &&
    a.notes === b.notes &&
    a.status === b.status &&
    new Date(a.observedAt).getTime() === new Date(b.observedAt).getTime()
  )
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

export async function bulkSavePrices(
  input: BulkSaveInput,
  actor: Actor,
  source: 'editor' | 'csv-import' = 'editor',
) {
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

  const marketId = new Types.ObjectId(input.marketId)
  const existingRecords = await PriceRecord.find({
    marketId,
    month: input.month,
    year: input.year,
    productId: { $in: toSave.map((v) => new Types.ObjectId(v.entry.productId)) },
  }).lean()
  const existingByProduct = new Map(existingRecords.map((r) => [String(r.productId), r]))

  // Field collectors may only enter drafts; published records need an editor.
  const allowed = can(actor.role, 'prices:correctPublished')
    ? toSave
    : toSave.filter((v) => {
        if (existingByProduct.get(v.entry.productId)?.status === 'PUBLISHED') {
          errors.push({
            index: v.index,
            productId: v.entry.productId,
            message: 'This month is already published — only an editor can correct it',
          })
          return false
        }
        return true
      })

  if (!allowed.length) {
    return { saved: 0, inserted: 0, updated: 0, errors, touchedPublished: false }
  }

  const result = await withTransaction(async (session) => {
    const ops = allowed.map(({ entry, observedAt }) => ({
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
            updatedBy: actor.username,
          },
          $setOnInsert: { status: 'DRAFT', currency: 'BDT', createdBy: actor.username },
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
      productId: { $in: allowed.map((v) => new Types.ObjectId(v.entry.productId)) },
    }).session(session ?? null)

    // Audit trail: one entry per created or actually-changed record.
    const after = await PriceRecord.find({
      marketId,
      month: input.month,
      year: input.year,
      productId: { $in: allowed.map((v) => new Types.ObjectId(v.entry.productId)) },
    })
      .session(session ?? null)
      .lean()
    const audits = after.flatMap((r) => {
      const before = existingByProduct.get(String(r.productId))
      const a = snapshot(r)
      if (before && sameValues(snapshot(before), a)) return []
      return [
        {
          action: before ? 'update' : 'create',
          recordId: r._id,
          productId: r.productId,
          marketId,
          month: input.month,
          year: input.year,
          actor: actor.username,
          actorRole: actor.role,
          source,
          before: before ? snapshot(before) : null,
          after: a,
          wasPublished: before?.status === 'PUBLISHED',
        },
      ]
    })
    if (audits.length) await PriceAudit.insertMany(audits, { session })
    return { res, touchedPublished: Boolean(touchedPublished) }
  })

  // Corrections to already-published records go live immediately.
  if (result.touchedPublished) invalidate(TAGS.prices)

  return {
    saved: allowed.length,
    inserted: result.res.upsertedCount,
    updated: result.res.modifiedCount,
    errors,
    touchedPublished: result.touchedPublished,
  }
}

export async function setPublication(
  input: {
    marketId: string
    month: number
    year: number
    action: 'publish' | 'unpublish'
    productIds?: string[]
  },
  actor: Actor,
) {
  await connectDB()
  const filter: Record<string, unknown> = {
    marketId: new Types.ObjectId(input.marketId),
    month: input.month,
    year: input.year,
    status: input.action === 'publish' ? 'DRAFT' : 'PUBLISHED',
  }
  if (input.productIds?.length)
    filter.productId = { $in: input.productIds.map((id) => new Types.ObjectId(id)) }
  const affected = await PriceRecord.find(filter).lean()
  if (!affected.length) return { modified: 0 }
  const newStatus = input.action === 'publish' ? 'PUBLISHED' : 'DRAFT'
  const res = await withTransaction(async (session) => {
    const r = await PriceRecord.updateMany(
      { _id: { $in: affected.map((a) => a._id) } },
      {
        $set:
          input.action === 'publish'
            ? { status: 'PUBLISHED', publishedAt: new Date() }
            : { status: 'DRAFT', publishedAt: null },
      },
      { session },
    )
    await PriceAudit.insertMany(
      affected.map((a) => ({
        action: input.action,
        recordId: a._id,
        productId: a.productId,
        marketId: a.marketId,
        month: a.month,
        year: a.year,
        actor: actor.username,
        actorRole: actor.role,
        source: 'publication',
        before: snapshot(a),
        after: { ...snapshot(a), status: newStatus },
        wasPublished: a.status === 'PUBLISHED',
      })),
      { session },
    )
    return r
  })
  invalidate(TAGS.prices)
  return { modified: res.modifiedCount }
}

type RecordPatch = z.infer<typeof priceRecordUpdateSchema>

export async function updatePriceRecord(id: string, patch: RecordPatch, actor: Actor) {
  await connectDB()
  const doc = await PriceRecord.findById(id)
  if (!doc) throw notFoundError('Price record')
  const wasPublished = doc.status === 'PUBLISHED'
  if (wasPublished && !can(actor.role, 'prices:correctPublished')) {
    throw new ApiError(403, 'FORBIDDEN', 'Only an editor can correct a published record')
  }
  if (patch.status && patch.status !== doc.status && !can(actor.role, 'prices:publish')) {
    throw new ApiError(403, 'FORBIDDEN', 'Your role cannot publish or unpublish prices')
  }
  const before = snapshot(doc.toObject())

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
  doc.updatedBy = actor.username
  await doc.save()
  const after = snapshot(doc.toObject())
  if (!sameValues(before, after)) {
    await PriceAudit.create({
      action:
        before.status !== after.status
          ? after.status === 'PUBLISHED'
            ? 'publish'
            : 'unpublish'
          : 'update',
      recordId: doc._id,
      productId: doc.productId,
      marketId: doc.marketId,
      month: doc.month,
      year: doc.year,
      actor: actor.username,
      actorRole: actor.role,
      source: 'correction',
      before,
      after,
      wasPublished,
    })
  }

  if (wasPublished || doc.status === 'PUBLISHED') invalidate(TAGS.prices)
  return toPriceRecordDTO(doc.toObject())
}

export async function deletePriceRecord(id: string, actor: Actor) {
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
  await PriceAudit.create({
    action: 'delete',
    recordId: doc._id,
    productId: doc.productId,
    marketId: doc.marketId,
    month: doc.month,
    year: doc.year,
    actor: actor.username,
    actorRole: actor.role,
    source: 'history',
    before: snapshot(doc),
    after: null,
    wasPublished: false,
  })
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

export async function listPriceAudit(filter: {
  productId?: string
  marketId?: string
  actor?: string
  action?: string
  page: number
  limit: number
}) {
  await connectDB()
  const q: Record<string, unknown> = {}
  if (filter.productId) q.productId = new Types.ObjectId(filter.productId)
  if (filter.marketId) q.marketId = new Types.ObjectId(filter.marketId)
  if (filter.actor) q.actor = filter.actor.toLowerCase()
  if (
    filter.action &&
    ['create', 'update', 'publish', 'unpublish', 'delete'].includes(filter.action)
  )
    q.action = filter.action
  const [total, entries] = await Promise.all([
    PriceAudit.countDocuments(q),
    PriceAudit.find(q)
      .sort({ at: -1, _id: -1 })
      .skip((filter.page - 1) * filter.limit)
      .limit(filter.limit)
      .lean(),
  ])
  const productIds = [...new Set(entries.map((e) => String(e.productId)))]
  const marketIds = [...new Set(entries.map((e) => String(e.marketId)))]
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
  const snap = (s: any) =>
    s
      ? {
          minimumPrice: s.minimumPrice,
          maximumPrice: s.maximumPrice,
          referencePrice: s.referencePrice,
          unit: s.unit,
          notes: s.notes,
          status: s.status,
          observedAt: s.observedAt ? new Date(s.observedAt).toISOString() : null,
        }
      : null
  return {
    total,
    page: filter.page,
    limit: filter.limit,
    items: entries.map((e) => ({
      id: String(e._id),
      action: e.action,
      at: new Date(e.at).toISOString(),
      actor: e.actor,
      actorRole: e.actorRole,
      source: e.source,
      month: e.month,
      year: e.year,
      wasPublished: e.wasPublished,
      product: pMap.get(String(e.productId)) ?? null,
      market: mMap.get(String(e.marketId)) ?? null,
      before: snap(e.before),
      after: snap(e.after),
    })),
  }
}
