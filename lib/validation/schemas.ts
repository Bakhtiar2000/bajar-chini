import { z } from 'zod'
import { UNIT_KEYS } from '@/lib/units'

const objectId = z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid id')
const slug = z
  .string()
  .trim()
  .min(2, 'Slug is too short')
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and hyphens only')

const text = (max = 5000) => z.string().trim().max(max)

export const localizedRequired = z.object({
  bn: z.string().trim().min(1, 'Bengali text is required').max(200),
  en: z.string().trim().min(1, 'English text is required').max(200),
})
export const localizedOptional = (max = 5000) =>
  z.object({ bn: text(max).default(''), en: text(max).default('') }).default({ bn: '', en: '' })
export const localizedListSchema = z
  .object({
    bn: z.array(z.string().trim().min(1).max(500)).max(30).default([]),
    en: z.array(z.string().trim().min(1).max(500)).max(30).default([]),
  })
  .default({ bn: [], en: [] })

const imageUrl = z.union([
  z.literal(''),
  z.url({ protocol: /^https?$/, error: 'Must be a valid http(s) URL' }),
])

export const imageSchema = z.object({
  url: z.url({ protocol: /^https?$/ }),
  publicId: z.string().max(300).default(''),
  alt: localizedOptional(300),
})

// ---------- Category ----------
export const categoryCreateSchema = z.object({
  name: localizedRequired,
  slug,
  description: localizedOptional(2000),
  image: imageUrl.default(''),
  cloudinaryPublicId: z.string().max(300).default(''),
  icon: z
    .enum([
      'fish',
      'chicken',
      'beef',
      'mutton',
      'vegetable',
      'leafy',
      'fruit',
      'spice',
      'grain',
      'other',
    ])
    .default('other'),
  parentCategory: objectId.nullable().default(null),
  displayOrder: z.coerce.number().int().min(0).max(10000).default(0),
  isActive: z.boolean().default(true),
})
export const categoryUpdateSchema = categoryCreateSchema.partial()

// ---------- Product ----------
export const productCreateSchema = z.object({
  name: localizedRequired,
  slug,
  alternativeNames: localizedListSchema,
  categoryId: objectId,
  shortDescription: localizedOptional(500),
  description: localizedOptional(5000),
  images: z.array(imageSchema).max(12).default([]),
  identificationGuide: localizedOptional(5000),
  goodQualitySigns: localizedListSchema,
  warningSigns: localizedListSchema,
  buyingTips: localizedListSchema,
  seasonalInformation: localizedOptional(2000),
  seasonMonths: z.array(z.number().int().min(1).max(12)).max(12).default([]),
  variety: localizedOptional(100),
  defaultUnitKey: z.enum(UNIT_KEYS as [string, ...string[]]).default('kg'),
  relatedProducts: z.array(objectId).max(12).default([]),
  isFeatured: z.boolean().default(false),
  isPopular: z.boolean().default(false),
  isPublished: z.boolean().default(true),
})
export const productUpdateSchema = productCreateSchema.partial()

// ---------- Market ----------
export const marketCreateSchema = z.object({
  name: localizedRequired,
  slug,
  area: localizedOptional(200),
  city: localizedOptional(200),
  address: text(500).default(''),
  description: localizedOptional(2000),
  isActive: z.boolean().default(true),
  isDefaultReferenceMarket: z.boolean().default(false),
})
export const marketUpdateSchema = marketCreateSchema.partial()

// ---------- Article ----------
export const articleCreateSchema = z.object({
  title: localizedRequired,
  slug,
  excerpt: localizedOptional(600),
  content: localizedOptional(30000),
  coverImage: imageUrl.default(''),
  coverImagePublicId: z.string().max(300).default(''),
  categoryId: objectId.nullable().default(null),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  isPublished: z.boolean().default(false),
})
export const articleUpdateSchema = articleCreateSchema.partial()

// ---------- Prices ----------
const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
const price = z
  .number({ error: 'Price must be a number' })
  .min(0, 'Price cannot be negative')
  .max(10_000_000)

export const monthlyQuerySchema = z.object({
  marketId: objectId,
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(2100),
})

export const bulkEntrySchema = z
  .object({
    productId: objectId,
    minimumPrice: price,
    maximumPrice: price,
    unitKey: z.enum(UNIT_KEYS as [string, ...string[]]),
    notes: text(1000).optional(),
    observedAt: dateString.optional(),
  })
  .refine((e) => e.minimumPrice <= e.maximumPrice, {
    message: 'Minimum price cannot exceed maximum price',
    path: ['minimumPrice'],
  })

export const bulkSaveSchema = z.object({
  marketId: objectId,
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
  observedAt: dateString,
  sourceType: z
    .enum(['MANUAL_OBSERVATION', 'OFFICIAL_SOURCE', 'CONTRIBUTOR_SUBMISSION'])
    .default('MANUAL_OBSERVATION'),
  sourceDescription: text(500).optional(),
  // Validated per entry on the server so valid rows still save when others are invalid.
  entries: z.array(z.unknown()).min(1, 'Nothing to save').max(1000),
})

export const priceRecordUpdateSchema = z
  .object({
    minimumPrice: price.optional(),
    maximumPrice: price.optional(),
    unitKey: z.enum(UNIT_KEYS as [string, ...string[]]).optional(),
    notes: text(1000).optional(),
    observedAt: dateString.optional(),
    sourceType: z
      .enum(['MANUAL_OBSERVATION', 'OFFICIAL_SOURCE', 'CONTRIBUTOR_SUBMISSION'])
      .optional(),
    sourceDescription: text(500).optional(),
    status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, 'No changes supplied')

export const publishSchema = z.object({
  marketId: objectId,
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
  action: z.enum(['publish', 'unpublish']).default('publish'),
  productIds: z.array(objectId).optional(),
})

export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Username is required').max(100),
  password: z.string().min(1, 'Password is required').max(200),
})

export type CategoryInput = z.infer<typeof categoryCreateSchema>
export type ProductInput = z.infer<typeof productCreateSchema>
export type MarketInput = z.infer<typeof marketCreateSchema>
export type ArticleInput = z.infer<typeof articleCreateSchema>
export type BulkEntryInput = z.infer<typeof bulkEntrySchema>
