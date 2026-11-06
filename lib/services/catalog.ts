import 'server-only'
import { Types } from 'mongoose'
import { connectDB, withTransaction } from '@/lib/db/connect'
import { Article, Category, Market, PriceRecord, Product } from '@/lib/models'
import { ApiError, notFoundError } from '@/lib/api/response'
import { invalidate } from '@/lib/revalidate'
import { TAGS } from '@/lib/cache-tags'
import { unitFromKey } from '@/lib/units'
import { normalizeSearch } from '@/lib/utils'
import type {
  ArticleInput,
  CategoryInput,
  MarketInput,
  ProductInput,
} from '@/lib/validation/schemas'

export function buildSearchText(p: {
  name?: { bn?: string; en?: string }
  alternativeNames?: { bn?: string[]; en?: string[] }
  slug?: string
}) {
  return normalizeSearch(
    [
      p.name?.bn,
      p.name?.en,
      ...(p.alternativeNames?.bn ?? []),
      ...(p.alternativeNames?.en ?? []),
      p.slug?.replace(/-/g, ' '),
    ]
      .filter(Boolean)
      .join(' | '),
  )
}

// ---------------- Categories ----------------

export async function createCategory(input: CategoryInput) {
  await connectDB()
  const doc = await Category.create(input)
  invalidate(TAGS.categories)
  return doc.toObject()
}

export async function updateCategory(id: string, input: Partial<CategoryInput>) {
  await connectDB()
  if (input.parentCategory && input.parentCategory === id) {
    throw new ApiError(400, 'BAD_REQUEST', 'A category cannot be its own parent')
  }
  const doc = await Category.findByIdAndUpdate(
    id,
    { $set: input },
    { new: true, runValidators: true },
  ).lean()
  if (!doc) throw notFoundError('Category')
  invalidate(TAGS.categories, TAGS.products)
  return doc
}

export async function deleteCategory(id: string) {
  await connectDB()
  const productCount = await Product.countDocuments({ categoryId: id })
  if (productCount > 0) {
    throw new ApiError(
      409,
      'IN_USE',
      `This category still has ${productCount} product(s). Move or delete them first, or deactivate the category.`,
    )
  }
  const res = await withTransaction(async (session) => {
    await Article.updateMany({ categoryId: id }, { $set: { categoryId: null } }, { session })
    return Category.deleteOne({ _id: id }, { session })
  })
  if (!res.deletedCount) throw notFoundError('Category')
  invalidate(TAGS.categories, TAGS.articles)
}

// ---------------- Products ----------------

async function assertProductRefs(input: Partial<ProductInput>, selfId?: string) {
  if (input.categoryId && !(await Category.exists({ _id: input.categoryId }))) {
    throw new ApiError(422, 'VALIDATION_ERROR', 'Selected category does not exist')
  }
  if (input.relatedProducts?.length) {
    const ids = input.relatedProducts.filter((r) => r !== selfId)
    const count = await Product.countDocuments({ _id: { $in: ids } })
    if (count !== new Set(ids).size) {
      throw new ApiError(422, 'VALIDATION_ERROR', 'One or more related products do not exist')
    }
    input.relatedProducts = [...new Set(ids)]
  }
}

function productPayload(input: Partial<ProductInput>) {
  const { defaultUnitKey, ...rest } = input
  const payload: Record<string, unknown> = { ...rest }
  if (defaultUnitKey) payload.defaultUnit = unitFromKey(defaultUnitKey)
  if (input.seasonMonths)
    payload.seasonMonths = [...new Set(input.seasonMonths)].sort((a, b) => a - b)
  return payload
}

export async function createProduct(input: ProductInput) {
  await connectDB()
  await assertProductRefs(input)
  const doc = await Product.create({ ...productPayload(input), searchText: buildSearchText(input) })
  invalidate(TAGS.products, TAGS.categories)
  return doc.toObject()
}

export async function updateProduct(id: string, input: Partial<ProductInput>) {
  await connectDB()
  const existing = await Product.findById(id)
  if (!existing) throw notFoundError('Product')
  await assertProductRefs(input, id)
  existing.set(productPayload(input))
  existing.searchText = buildSearchText(existing.toObject())
  await existing.save()
  invalidate(TAGS.products, TAGS.categories, TAGS.prices)
  return existing.toObject()
}

export async function deleteProduct(id: string) {
  await connectDB()
  const priceCount = await PriceRecord.countDocuments({ productId: id })
  if (priceCount > 0) {
    throw new ApiError(
      409,
      'IN_USE',
      `This product has ${priceCount} historical price record(s). To preserve price history, unpublish it instead of deleting.`,
    )
  }
  const res = await withTransaction(async (session) => {
    await Product.updateMany(
      { relatedProducts: id },
      { $pull: { relatedProducts: new Types.ObjectId(id) } },
      { session },
    )
    return Product.deleteOne({ _id: id }, { session })
  })
  if (!res.deletedCount) throw notFoundError('Product')
  invalidate(TAGS.products, TAGS.categories)
}

// ---------------- Markets ----------------

export async function createMarket(input: MarketInput) {
  await connectDB()
  const doc = await withTransaction(async (session) => {
    if (input.isDefaultReferenceMarket) {
      await Market.updateMany(
        { isDefaultReferenceMarket: true },
        { $set: { isDefaultReferenceMarket: false } },
        { session },
      )
    }
    const [created] = await Market.create([input], { session })
    return created
  })
  invalidate(TAGS.markets, TAGS.prices)
  return doc.toObject()
}

export async function updateMarket(id: string, input: Partial<MarketInput>) {
  await connectDB()
  const existing = await Market.findById(id).lean()
  if (!existing) throw notFoundError('Market')
  if (existing.isDefaultReferenceMarket && input.isActive === false) {
    throw new ApiError(
      409,
      'CONFLICT',
      'The default reference market cannot be deactivated. Choose another default first.',
    )
  }
  if (existing.isDefaultReferenceMarket && input.isDefaultReferenceMarket === false) {
    throw new ApiError(
      409,
      'CONFLICT',
      'Set another market as default instead of unsetting this one.',
    )
  }
  if (input.isDefaultReferenceMarket && input.isActive === false) {
    throw new ApiError(
      409,
      'CONFLICT',
      'An inactive market cannot be the default reference market.',
    )
  }
  const doc = await withTransaction(async (session) => {
    if (input.isDefaultReferenceMarket) {
      await Market.updateMany(
        { _id: { $ne: id }, isDefaultReferenceMarket: true },
        { $set: { isDefaultReferenceMarket: false } },
        { session },
      )
    }
    return Market.findByIdAndUpdate(
      id,
      { $set: input },
      { new: true, runValidators: true, session },
    ).lean()
  })
  invalidate(TAGS.markets, TAGS.prices)
  return doc
}

export async function deleteMarket(id: string) {
  await connectDB()
  const market = await Market.findById(id).lean()
  if (!market) throw notFoundError('Market')
  if (market.isDefaultReferenceMarket) {
    throw new ApiError(409, 'CONFLICT', 'The default reference market cannot be deleted.')
  }
  const priceCount = await PriceRecord.countDocuments({ marketId: id })
  if (priceCount > 0) {
    throw new ApiError(
      409,
      'IN_USE',
      `This market has ${priceCount} price record(s). Deactivate it instead to preserve its history.`,
    )
  }
  await Market.deleteOne({ _id: id })
  invalidate(TAGS.markets)
}

// ---------------- Articles ----------------

async function assertArticleRefs(input: Partial<ArticleInput>) {
  if (input.categoryId && !(await Category.exists({ _id: input.categoryId }))) {
    throw new ApiError(422, 'VALIDATION_ERROR', 'Selected category does not exist')
  }
}

export async function createArticle(input: ArticleInput) {
  await connectDB()
  await assertArticleRefs(input)
  const doc = await Article.create({ ...input, publishedAt: input.isPublished ? new Date() : null })
  invalidate(TAGS.articles)
  return doc.toObject()
}

export async function updateArticle(id: string, input: Partial<ArticleInput>) {
  await connectDB()
  await assertArticleRefs(input)
  const existing = await Article.findById(id)
  if (!existing) throw notFoundError('Article')
  existing.set(input)
  if (input.isPublished && !existing.publishedAt) existing.publishedAt = new Date()
  await existing.save()
  invalidate(TAGS.articles)
  return existing.toObject()
}

export async function deleteArticle(id: string) {
  await connectDB()
  const res = await Article.deleteOne({ _id: id })
  if (!res.deletedCount) throw notFoundError('Article')
  invalidate(TAGS.articles)
}
