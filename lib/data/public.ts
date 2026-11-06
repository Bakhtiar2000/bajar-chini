import 'server-only'
import { cacheLife, cacheTag } from 'next/cache'
import { TAGS } from '@/lib/cache-tags'
import * as q from './queries'

/*
 * Cached public read models. Every function is tagged so admin mutations can
 * invalidate exactly what changed (see lib/revalidate.ts). Drafts and
 * unpublished content are filtered out in the underlying queries.
 */

export async function getDefaultMarket() {
  'use cache'
  cacheLife('hours')
  cacheTag(TAGS.markets)
  return q.queryDefaultMarket()
}

export async function getActiveMarkets() {
  'use cache'
  cacheLife('hours')
  cacheTag(TAGS.markets)
  return q.queryActiveMarkets()
}

export async function getCategories() {
  'use cache'
  cacheLife('hours')
  cacheTag(TAGS.categories, TAGS.products)
  return q.queryCategories()
}

export async function getCategoryBySlug(slug: string) {
  'use cache'
  cacheLife('hours')
  cacheTag(TAGS.categories, TAGS.products)
  return q.queryCategoryBySlug(slug)
}

export async function getFeaturedProducts(limit = 8) {
  'use cache'
  cacheLife('hours')
  cacheTag(TAGS.products, TAGS.prices, TAGS.categories, TAGS.markets)
  return q.queryProductCards({ isFeatured: true }, { limit, sort: { updatedAt: -1 } })
}

export async function getPopularPriceProducts(limit = 8) {
  'use cache'
  cacheLife('hours')
  cacheTag(TAGS.products, TAGS.prices, TAGS.categories, TAGS.markets)
  return q.queryProductCards({ isPopular: true }, { limit })
}

export async function getProductsByCategory(categoryId: string) {
  'use cache'
  cacheLife('hours')
  cacheTag(TAGS.products, TAGS.prices, TAGS.categories, TAGS.markets)
  return q.queryProductCards({ categoryId })
}

export async function getAllProductCards() {
  'use cache'
  cacheLife('hours')
  cacheTag(TAGS.products, TAGS.prices, TAGS.categories, TAGS.markets)
  return q.queryProductCards({})
}

export async function getProductDetail(slug: string) {
  'use cache'
  cacheLife('hours')
  cacheTag(TAGS.products, TAGS.prices, TAGS.categories, TAGS.markets)
  return q.queryProductDetail(slug)
}

export async function getArticles(limit?: number) {
  'use cache'
  cacheLife('hours')
  cacheTag(TAGS.articles, TAGS.categories)
  return q.queryArticles({ limit })
}

export async function getArticleBySlug(slug: string) {
  'use cache'
  cacheLife('hours')
  cacheTag(TAGS.articles, TAGS.categories)
  return q.queryArticleBySlug(slug)
}

export async function getAllSlugs() {
  'use cache'
  cacheLife('hours')
  cacheTag(TAGS.products, TAGS.categories, TAGS.articles)
  return q.queryAllSlugs()
}
