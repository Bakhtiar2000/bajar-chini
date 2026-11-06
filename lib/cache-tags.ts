export const TAGS = {
  categories: 'categories',
  products: 'products',
  markets: 'markets',
  prices: 'prices',
  articles: 'articles',
} as const

export type CacheTag = (typeof TAGS)[keyof typeof TAGS]
