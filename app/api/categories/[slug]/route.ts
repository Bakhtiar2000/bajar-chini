import { publicRoute } from '@/lib/api/handler'
import { notFoundError, ok } from '@/lib/api/response'
import { getCategoryBySlug, getProductsByCategory } from '@/lib/data/public'

export const GET = publicRoute<{ slug: string }>(async (_req, { slug }) => {
  const category = await getCategoryBySlug(slug)
  if (!category) throw notFoundError('Category')
  const products = await getProductsByCategory(category.id)
  return ok({ ...category, products })
})
