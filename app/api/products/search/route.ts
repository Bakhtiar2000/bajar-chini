import { publicRoute } from '@/lib/api/handler'
import { ok } from '@/lib/api/response'
import { querySearch } from '@/lib/data/queries'

/** GET /api/products/search?q=রুই&limit=8 — Bengali & English, names, alternative names and categories. */
export const GET = publicRoute(async (req) => {
  const sp = req.nextUrl.searchParams
  const q = (sp.get('q') ?? '').slice(0, 100)
  const limit = Math.min(40, Math.max(1, Number(sp.get('limit')) || 10))
  const result = await querySearch(q, limit)
  return ok(result, { headers: { 'Cache-Control': 'public, max-age=60' } })
})
