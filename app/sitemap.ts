import type { MetadataRoute } from 'next'
import { localizePath } from '@/i18n/config'
import { getAllSlugs } from '@/lib/data/public'
import { absoluteUrl } from '@/lib/utils'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Only published products/articles and active categories are listed.
  const { products, categories, articles } = await getAllSlugs()
  const paths = [
    { path: '/', priority: 1 },
    { path: '/products', priority: 0.9 },
    { path: '/prices', priority: 0.9 },
    { path: '/guides', priority: 0.7 },
    { path: '/about', priority: 0.4 },
    ...categories.map((s) => ({ path: `/categories/${s}`, priority: 0.8 })),
    ...products.map((s) => ({ path: `/products/${s}`, priority: 0.8 })),
    ...articles.map((s) => ({ path: `/guides/${s}`, priority: 0.6 })),
  ]
  return paths.map(({ path, priority }) => ({
    url: absoluteUrl(localizePath('bn', path)),
    priority,
    alternates: {
      languages: {
        bn: absoluteUrl(localizePath('bn', path)),
        en: absoluteUrl(localizePath('en', path)),
      },
    },
  }))
}
