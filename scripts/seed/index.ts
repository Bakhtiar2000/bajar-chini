/**
 * Bajarchini seed script.
 *
 *   npm run seed              – reset catalogue + DEMO price history (refuses if real price data exists)
 *   npm run seed -- --force   – reset even if real (non-demo) price records exist
 *   npm run seed:clear-demo   – delete only DEMO price records, keeping everything else
 *
 * ALL seeded prices are illustrative DEMO DATA (isDemo: true) and are labelled
 * as such in the UI. Replace them with genuine observations from /admin/prices.
 */
import { config } from 'dotenv'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { Category } from '../../lib/models/Category'
import { Product } from '../../lib/models/Product'
import { Market } from '../../lib/models/Market'
import { PriceRecord } from '../../lib/models/PriceRecord'
import { Article } from '../../lib/models/Article'
import { AdminUser } from '../../lib/models/AdminUser'
import { normalizeSearch } from '../../lib/utils'
import { UNITS } from '../../lib/units'
import { CATEGORIES } from './categories'
import { PRODUCTS, type SeedProduct } from './products'
import { CHECKLISTS, type Pair } from './checklists'
import { ARTICLES } from './articles'

config({ path: '.env.local' })
config()

const DEMO_NOTE = 'DEMO DATA — illustrative seed value, not a real market observation.'

const args = new Set(process.argv.slice(2))

function list(pairs: Pair[] = []) {
  return { bn: pairs.map((p) => p[0]), en: pairs.map((p) => p[1]) }
}

/** Deterministic pseudo-random in [-1, 1] so re-seeding gives the same demo data. */
function noise(seed: string) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619)
  return ((h >>> 0) % 2000) / 1000 - 1
}

const SEASONAL: Record<NonNullable<SeedProduct['profile']>, Record<number, number>> = {
  // calendar month -> multiplier
  veg: {
    12: 0.85,
    1: 0.78,
    2: 0.82,
    3: 0.92,
    4: 1.0,
    5: 1.05,
    6: 1.12,
    7: 1.18,
    8: 1.22,
    9: 1.2,
    10: 1.1,
    11: 1.0,
  },
  fish: {
    12: 0.98,
    1: 1.0,
    2: 1.03,
    3: 1.05,
    4: 1.06,
    5: 1.04,
    6: 1.0,
    7: 0.97,
    8: 0.95,
    9: 0.94,
    10: 0.97,
    11: 1.0,
  },
  meat: {
    12: 0.96,
    1: 0.96,
    2: 0.98,
    3: 1.04,
    4: 0.99,
    5: 1.06,
    6: 1.02,
    7: 0.98,
    8: 0.98,
    9: 0.99,
    10: 1.0,
    11: 1.0,
  },
  stable: {
    12: 0.97,
    1: 0.97,
    2: 0.98,
    3: 0.99,
    4: 0.99,
    5: 1.0,
    6: 1.0,
    7: 1.0,
    8: 1.0,
    9: 1.0,
    10: 1.0,
    11: 1.0,
  },
  onion: {
    12: 0.9,
    1: 0.8,
    2: 0.75,
    3: 0.68,
    4: 0.65,
    5: 0.7,
    6: 0.78,
    7: 0.85,
    8: 0.95,
    9: 1.15,
    10: 1.25,
    11: 1.0,
  },
}

function roundPrice(v: number) {
  const step = v < 50 ? 1 : v < 200 ? 5 : 10
  return Math.max(step, Math.round(v / step) * step)
}

/** The 12 demo months: Dec 2025 … Nov 2026, relative to the current month. */
function demoMonths() {
  const now = new Date()
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Dhaka',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(now)
  const year = Number(parts.find((p) => p.type === 'year')!.value)
  const month = Number(parts.find((p) => p.type === 'month')!.value)
  const day = Number(parts.find((p) => p.type === 'day')!.value)
  const end = year * 12 + month - 1
  return {
    today: day,
    months: Array.from({ length: 12 }, (_, i) => {
      const idx = end - 11 + i
      return { index: i, year: Math.floor(idx / 12), month: (idx % 12) + 1, isCurrent: i === 11 }
    }),
  }
}

async function main() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is not set (see .env.example)')
  await mongoose.connect(uri)
  console.log('Connected to MongoDB')

  if (args.has('--clear-demo')) {
    const res = await PriceRecord.deleteMany({ isDemo: true })
    console.log(`Deleted ${res.deletedCount} DEMO price records. Real observations were kept.`)
    await mongoose.disconnect()
    return
  }

  const realCount = await PriceRecord.countDocuments({ isDemo: { $ne: true } })
  if (realCount > 0 && !args.has('--force')) {
    console.error(
      `Refusing to reseed: ${realCount} real (non-demo) price records exist. Run with --force to wipe everything.`,
    )
    await mongoose.disconnect()
    process.exit(1)
  }

  await Promise.all([
    Category.deleteMany({}),
    Product.deleteMany({}),
    Market.deleteMany({}),
    PriceRecord.deleteMany({}),
    Article.deleteMany({}),
  ])
  await Promise.all([
    Category.syncIndexes(),
    Product.syncIndexes(),
    Market.syncIndexes(),
    PriceRecord.syncIndexes(),
    Article.syncIndexes(),
    AdminUser.syncIndexes(),
  ])

  // Categories
  const catDocs = await Category.insertMany(
    CATEGORIES.map((c, i) => ({
      name: c.name,
      slug: c.slug,
      description: c.description,
      image: c.image,
      icon: c.icon,
      displayOrder: i + 1,
      isActive: true,
    })),
  )
  const catBySlug = new Map<string, (typeof catDocs)[number]>(
    catDocs.map((c) => [c.slug as string, c]),
  )
  console.log(`✓ ${catDocs.length} categories`)

  // Default reference market
  const market = await Market.create({
    name: { bn: 'দক্ষিণখান স্থানীয় বাজার', en: 'Dakshinkhan Local Bazar' },
    slug: 'dakshinkhan-local-bazar',
    area: { bn: 'দক্ষিণখান', en: 'Dakshinkhan' },
    city: { bn: 'ঢাকা', en: 'Dhaka' },
    address: 'Dakshinkhan, Dhaka-1230',
    description: {
      bn: 'বাজারচিনির প্রাথমিক রেফারেন্স বাজার। প্রতি মাসে এখানে সরেজমিনে দাম পর্যবেক্ষণ করা হয়। এটি সমগ্র বাংলাদেশের দামের প্রতিনিধিত্ব করে না।',
      en: "Bajarchini's initial reference market, where prices are observed in person every month. It does not represent prices across all of Bangladesh.",
    },
    isActive: true,
    isDefaultReferenceMarket: true,
  })
  console.log('✓ reference market: দক্ষিণখান স্থানীয় বাজার, ঢাকা')

  // Products
  const productDocs = await Product.insertMany(
    PRODUCTS.map((p) => {
      const checklist = CHECKLISTS[p.checklist]
      const name = { bn: p.name[0], en: p.name[1] }
      const alternativeNames = p.alt ?? { bn: [], en: [] }
      return {
        name,
        slug: p.slug,
        alternativeNames,
        categoryId: catBySlug.get(p.category)!._id,
        shortDescription: { bn: p.short[0], en: p.short[1] },
        description: { bn: p.desc[0], en: p.desc[1] },
        images: p.image ? [{ url: p.image, publicId: '', alt: name }] : [],
        identificationGuide: { bn: p.ident[0], en: p.ident[1] },
        goodQualitySigns: list([...(p.good ?? []), ...checklist.good]),
        warningSigns: list([...(p.warn ?? []), ...checklist.warn]),
        buyingTips: list(p.tips),
        seasonalInformation: { bn: p.season[0], en: p.season[1] },
        seasonMonths: p.months ?? [],
        variety: p.variety ? { bn: p.variety[0], en: p.variety[1] } : { bn: '', en: '' },
        defaultUnit: { ...UNITS[p.unit] },
        isFeatured: Boolean(p.featured),
        isPopular: Boolean(p.popular),
        isPublished: true,
        searchText: normalizeSearch(
          [
            name.bn,
            name.en,
            ...alternativeNames.bn,
            ...alternativeNames.en,
            p.slug.replace(/-/g, ' '),
          ].join(' | '),
        ),
      }
    }),
  )
  const prodBySlug = new Map(productDocs.map((p) => [p.slug, p]))

  // Related products: same category neighbours
  for (const p of productDocs) {
    const siblings = productDocs.filter(
      (o) => String(o.categoryId) === String(p.categoryId) && o.slug !== p.slug,
    )
    p.relatedProducts = siblings.slice(0, 4).map((s) => s._id)
  }
  await Promise.all(productDocs.map((p) => p.save()))
  console.log(`✓ ${productDocs.length} products`)

  // DEMO price history
  const { months, today } = demoMonths()
  const records: Record<string, unknown>[] = []
  for (const p of PRODUCTS) {
    if (!p.price) continue
    const profile = SEASONAL[p.profile ?? 'stable']
    const [baseMin, baseMax] = p.price
    const current = months[11]
    for (const m of months) {
      if (p.gaps?.includes(m.index)) continue
      if (p.lastIndex !== undefined && m.index > p.lastIndex) continue
      if (p.onlyMonths && !p.onlyMonths.includes(m.month)) continue
      const trend = 1 - 0.004 * (11 - m.index)
      const factor =
        (profile[m.month] / profile[current.month]) *
        trend *
        (1 + noise(`${p.slug}-${m.index}`) * 0.03)
      let min = roundPrice(baseMin * factor)
      let max = roundPrice(baseMax * factor)
      if (m.isCurrent) {
        min = baseMin
        max = baseMax
      }
      if (max < min) max = min
      const day = m.isCurrent
        ? Math.min(5, today)
        : 3 + Math.round((noise(`${p.slug}-d${m.index}`) + 1) * 2)
      const observedAt = new Date(
        `${m.year}-${String(m.month).padStart(2, '0')}-${String(day).padStart(2, '0')}T12:00:00+06:00`,
      )
      const isDraft = m.isCurrent && p.draftLatest
      records.push({
        productId: prodBySlug.get(p.slug)!._id,
        marketId: market._id,
        month: m.month,
        year: m.year,
        minimumPrice: min,
        maximumPrice: max,
        referencePrice: Math.round(((min + max) / 2) * 100) / 100,
        unit: { ...UNITS[p.unit] },
        currency: 'BDT',
        sourceType: 'MANUAL_OBSERVATION',
        sourceDescription: DEMO_NOTE,
        notes: '',
        observedAt,
        status: isDraft ? 'DRAFT' : 'PUBLISHED',
        publishedAt: isDraft ? null : observedAt,
        isDemo: true,
        createdBy: 'seed',
        updatedBy: 'seed',
      })
    }
  }
  await PriceRecord.insertMany(records)
  const drafts = records.filter((r) => r.status === 'DRAFT').length
  console.log(
    `✓ ${records.length} DEMO price records (${drafts} drafts) — all flagged isDemo: true`,
  )

  // Articles
  await Article.insertMany(
    ARTICLES.map((a, i) => ({
      title: a.title,
      slug: a.slug,
      excerpt: a.excerpt,
      content: a.content,
      coverImage: a.coverImage,
      categoryId: catBySlug.get(a.category)?._id ?? null,
      tags: a.tags,
      isPublished: true,
      publishedAt: new Date(Date.now() - i * 86400000),
    })),
  )
  console.log(`✓ ${ARTICLES.length} articles`)

  // Admin user (password stored only as a bcrypt hash)
  const username = process.env.ADMIN_USERNAME?.trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD
  if (username && password) {
    await AdminUser.updateOne(
      { username },
      { $set: { username, passwordHash: await bcrypt.hash(password, 12), role: 'admin' } },
      { upsert: true },
    )
    console.log(`✓ admin user "${username}"`)
  } else {
    console.log('! ADMIN_USERNAME / ADMIN_PASSWORD not set — no admin user created')
  }

  await mongoose.disconnect()
  console.log('Done.')
}

main().catch(async (err) => {
  console.error(err)
  await mongoose.disconnect().catch(() => {})
  process.exit(1)
})
