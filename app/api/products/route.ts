import { pageParams, publicRoute } from '@/lib/api/handler'
import { ok } from '@/lib/api/response'
import { queryCategoryBySlug, queryProductCards, queryProductCount } from '@/lib/data/queries'

/**
 * GET /api/products?category=fish&featured=1&popular=1&page=1&limit=20
 * GET /api/products?slugs=rui-fish,onion  (cards for the bajar list / watchlist, max 100)
 */
export const GET = publicRoute(async (req) => {
  const sp = req.nextUrl.searchParams
  const { page, limit, skip } = pageParams(req)
  const filter: Record<string, unknown> = {}
  const slugsParam = sp.get('slugs')
  if (slugsParam !== null) {
    const slugs = [
      ...new Set(
        slugsParam
          .split(',')
          .map((s) => s.trim().toLowerCase())
          .filter((s) => /^[a-z0-9-]{1,100}$/.test(s)),
      ),
    ].slice(0, 100)
    if (!slugs.length) return ok({ items: [], total: 0, page: 1, limit: 0 })
    const items = await queryProductCards({ slug: { $in: slugs } })
    return ok(
      { items, total: items.length, page: 1, limit: items.length },
      { headers: { 'Cache-Control': 'public, max-age=60' } },
    )
  }
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
