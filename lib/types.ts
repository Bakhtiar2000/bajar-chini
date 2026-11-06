import type { Localized, LocalizedList } from '@/lib/format'
import type { Unit } from '@/lib/units'

export type Freshness = 'current' | 'last-month' | 'older'
export type PriceStatus = 'DRAFT' | 'PUBLISHED'
export type SourceType = 'MANUAL_OBSERVATION' | 'OFFICIAL_SOURCE' | 'CONTRIBUTOR_SUBMISSION'
export type CategoryIcon =
  | 'fish'
  | 'chicken'
  | 'beef'
  | 'mutton'
  | 'vegetable'
  | 'leafy'
  | 'fruit'
  | 'spice'
  | 'grain'
  | 'other'

export type ImageDTO = { url: string; publicId?: string; alt?: Localized }

export type MarketDTO = {
  id: string
  slug: string
  name: Localized
  area: Localized
  city: Localized
  address?: string
  description: Localized
  isActive: boolean
  isDefaultReferenceMarket: boolean
}

export type CategoryDTO = {
  id: string
  slug: string
  name: Localized
  description: Localized
  image?: string
  cloudinaryPublicId?: string
  icon: CategoryIcon
  displayOrder: number
  isActive: boolean
  productCount: number
}

export type CategoryRef = { id: string; slug: string; name: Localized; icon: CategoryIcon }

export type LatestPriceDTO = {
  id: string
  minimumPrice: number
  maximumPrice: number
  referencePrice: number
  unit: Unit
  month: number
  year: number
  observedAt: string
  updatedAt: string
  isDemo: boolean
  freshness: Freshness
  market: Pick<MarketDTO, 'id' | 'slug' | 'name' | 'area' | 'city'>
}

export type ProductCardDTO = {
  id: string
  slug: string
  name: Localized
  shortDescription: Localized
  image?: string
  variety?: Localized
  isSeasonal: boolean
  category: CategoryRef
  latestPrice: LatestPriceDTO | null
}

export type PriceRecordDTO = {
  id: string
  productId: string
  marketId: string
  month: number
  year: number
  minimumPrice: number
  maximumPrice: number
  referencePrice: number
  unit: Unit
  currency: 'BDT'
  sourceType: SourceType
  sourceDescription?: string
  notes?: string
  observedAt: string
  status: PriceStatus
  isDemo: boolean
  createdAt: string
  updatedAt: string
}

export type PricePoint = {
  year: number
  month: number
  min: number | null
  max: number | null
  ref: number | null
  observed: boolean
  isDemo: boolean
}

export type Extreme = { value: number; year: number; month: number }

export type PeriodKey = '6m' | '12m' | 'all'

export type PeriodAnalysis = {
  period: PeriodKey
  points: PricePoint[]
  highest: Extreme | null
  lowest: Extreme | null
  observedCount: number
  missingCount: number
}

export type MonthlyChange =
  | {
      status: 'ok'
      current: { year: number; month: number; ref: number }
      previous: { year: number; month: number; ref: number }
      change: number
      percent: number
    }
  | { status: 'zero-previous'; current: { year: number; month: number; ref: number } }
  | { status: 'no-previous'; current: { year: number; month: number; ref: number } }
  | { status: 'no-data' }

export type MarketPriceHistory = {
  market: MarketDTO
  latest: LatestPriceDTO | null
  change: MonthlyChange
  periods: Record<PeriodKey, PeriodAnalysis>
  records: PriceRecordDTO[]
}

export type ProductDetailDTO = ProductCardDTO & {
  description: Localized
  alternativeNames: LocalizedList
  images: ImageDTO[]
  identificationGuide: Localized
  goodQualitySigns: LocalizedList
  warningSigns: LocalizedList
  buyingTips: LocalizedList
  seasonalInformation: Localized
  seasonMonths: number[]
  defaultUnit: Unit
  updatedAt: string
  related: ProductCardDTO[]
  priceHistories: MarketPriceHistory[]
}

export type ArticleDTO = {
  id: string
  slug: string
  title: Localized
  excerpt: Localized
  content: Localized
  coverImage?: string
  coverImagePublicId?: string
  category?: CategoryRef | null
  tags: string[]
  isPublished: boolean
  publishedAt?: string
  updatedAt: string
}

export type SearchResultDTO = {
  products: ProductCardDTO[]
  categories: CategoryRef[]
}
