import { publicRoute } from '@/lib/api/handler'
import { notFoundError, ok } from '@/lib/api/response'
import { getArticleBySlug } from '@/lib/data/public'

export const GET = publicRoute<{ slug: string }>(async (_req, { slug }) => {
  const article = await getArticleBySlug(slug)
  if (!article) throw notFoundError('Article')
  return ok(article)
})
