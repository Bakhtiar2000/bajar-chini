import { pageParams, publicRoute } from '@/lib/api/handler'
import { ok } from '@/lib/api/response'
import { queryArticles } from '@/lib/data/queries'

export const GET = publicRoute(async (req) => {
  const { page, limit, skip } = pageParams(req, { page: 1, limit: 12 }, 50)
  return ok({ items: await queryArticles({ skip, limit }), page, limit })
})
