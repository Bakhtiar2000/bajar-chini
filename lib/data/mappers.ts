/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  ArticleDTO,
  CategoryDTO,
  CategoryIcon,
  CategoryRef,
  ImageDTO,
  LatestPriceDTO,
  MarketDTO,
  PriceRecordDTO,
  ProductCardDTO,
} from '@/lib/types'
import type { Localized, LocalizedList } from '@/lib/format'
import { getFreshness, type YearMonth } from '@/lib/prices/calc'
import { unitFromKey, type Unit } from '@/lib/units'

type Lean = Record<string, any>

const iso = (d: unknown) => (d ? new Date(d as string).toISOString() : new Date(0).toISOString())

export const loc = (v: any): Localized => ({ bn: v?.bn ?? '', en: v?.en ?? '' })
export const locList = (v: any): LocalizedList => ({
  bn: Array.isArray(v?.bn) ? [...v.bn] : [],
  en: Array.isArray(v?.en) ? [...v.en] : [],
})
const unit = (v: any): Unit => (v?.key ? { key: v.key, bn: v.bn, en: v.en } : unitFromKey('kg'))

export function toMarketDTO(m: Lean): MarketDTO {
  return {
    id: String(m._id),
    slug: m.slug,
    name: loc(m.name),
    area: loc(m.area),
    city: loc(m.city),
    address: m.address || undefined,
    description: loc(m.description),
    isActive: Boolean(m.isActive),
    isDefaultReferenceMarket: Boolean(m.isDefaultReferenceMarket),
  }
}

export function toCategoryRef(c: Lean): CategoryRef {
  return {
    id: String(c._id),
    slug: c.slug,
    name: loc(c.name),
    icon: (c.icon as CategoryIcon) || 'other',
  }
}

export function toCategoryDTO(c: Lean, productCount = 0): CategoryDTO {
  return {
    ...toCategoryRef(c),
    description: loc(c.description),
    image: c.image || undefined,
    cloudinaryPublicId: c.cloudinaryPublicId || undefined,
    displayOrder: c.displayOrder ?? 0,
    isActive: Boolean(c.isActive),
    productCount,
  }
}

export function toPriceRecordDTO(r: Lean): PriceRecordDTO {
  return {
    id: String(r._id),
    productId: String(r.productId),
    marketId: String(r.marketId),
    month: r.month,
    year: r.year,
    minimumPrice: r.minimumPrice,
    maximumPrice: r.maximumPrice,
    referencePrice: r.referencePrice,
    unit: unit(r.unit),
    currency: 'BDT',
    sourceType: r.sourceType,
    sourceDescription: r.sourceDescription || undefined,
    notes: r.notes || undefined,
    observedAt: iso(r.observedAt),
    status: r.status,
    isDemo: Boolean(r.isDemo),
    createdAt: iso(r.createdAt),
    updatedAt: iso(r.updatedAt),
  }
}

export function toLatestPriceDTO(r: Lean, market: MarketDTO, now: YearMonth): LatestPriceDTO {
  return {
    id: String(r._id),
    minimumPrice: r.minimumPrice,
    maximumPrice: r.maximumPrice,
    referencePrice: r.referencePrice,
    unit: unit(r.unit),
    month: r.month,
    year: r.year,
    observedAt: iso(r.observedAt),
    updatedAt: iso(r.updatedAt),
    isDemo: Boolean(r.isDemo),
    freshness: getFreshness({ year: r.year, month: r.month }, now),
    market: {
      id: market.id,
      slug: market.slug,
      name: market.name,
      area: market.area,
      city: market.city,
    },
  }
}

export function toImageList(images: any): ImageDTO[] {
  if (!Array.isArray(images)) return []
  return images
    .filter((i) => i?.url)
    .map((i) => ({ url: i.url, publicId: i.publicId || undefined, alt: loc(i.alt) }))
}

export function isSeasonal(seasonMonths: unknown): boolean {
  return Array.isArray(seasonMonths) && seasonMonths.length > 0 && seasonMonths.length < 12
}

export function toProductCard(
  p: Lean,
  category: CategoryRef | undefined,
  latest: LatestPriceDTO | null,
): ProductCardDTO {
  const images = toImageList(p.images)
  return {
    id: String(p._id),
    slug: p.slug,
    name: loc(p.name),
    shortDescription: loc(p.shortDescription),
    image: images[0]?.url,
    variety: p.variety?.bn || p.variety?.en ? loc(p.variety) : undefined,
    isSeasonal: isSeasonal(p.seasonMonths),
    category: category ?? {
      id: String(p.categoryId),
      slug: '',
      name: { bn: '', en: '' },
      icon: 'other',
    },
    latestPrice: latest,
  }
}

export function toArticleDTO(a: Lean, category?: CategoryRef | null): ArticleDTO {
  return {
    id: String(a._id),
    slug: a.slug,
    title: loc(a.title),
    excerpt: loc(a.excerpt),
    content: loc(a.content),
    coverImage: a.coverImage || undefined,
    coverImagePublicId: a.coverImagePublicId || undefined,
    category: category ?? null,
    tags: Array.isArray(a.tags) ? [...a.tags] : [],
    isPublished: Boolean(a.isPublished),
    publishedAt: a.publishedAt ? iso(a.publishedAt) : undefined,
    updatedAt: iso(a.updatedAt),
  }
}
