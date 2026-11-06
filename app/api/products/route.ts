import { pageParams, publicRoute } from '@/lib/api/handler'
import { ok } from '@/lib/api/response'
import { queryCategoryBySlug, queryProductCards, queryProductCount } from '@/lib/data/queries'

/** GET /api/products?category=fish&featured=1&popular=1&page=1&limit=20 */
export const GET = publicRoute(async (req) => {
  const sp = req.nextUrl.searchParams
  const { page, limit, skip } = pageParams(req)
  const filter: Record<string, unknown> = {}
  const categorySlug = sp.get('category')
  if (categorySlug) {
    const category = await queryCategoryBySlug(categorySlug)
    if (!category) return ok({ items: [], total: 0, page, limit })
    filter.categoryId = category.id
  }
  if (sp.get('featured') === '1') filter.isFeatured = true
  if (sp.get('popular') === '1') filter.isPopular = true
  const [items, total] = await Promise.all([
    queryProductCards(filter, { skip, limit }),
    queryProductCount(filter),
  ])
  return ok({ items, total, page, limit })
})
