import 'server-only'
import {
  buildSearchIndex,
  productSearchDoc,
  searchIndex,
  type SearchIndex,
} from '@/lib/search/engine'
import type { SearchResultDTO } from '@/lib/types'
import { getAllProductCards, getSearchCorpus } from './public'
import type { SearchCorpusDTO } from './queries'

/*
 * Bengali / English / Banglish product search (see lib/search/engine.ts).
 * The corpus and cards are cached and invalidated with the product/category
 * tags; the index is rebuilt only when the cached corpus object changes.
 */

let memo: { corpus: SearchCorpusDTO; products: SearchIndex; categories: SearchIndex } | null = null

function indexes(corpus: SearchCorpusDTO) {
  if (memo?.corpus === corpus) return memo
  const catById = new Map(corpus.categories.map((c) => [c.id, c]))
  memo = {
    corpus,
    products: buildSearchIndex(
      corpus.products.map((p) => productSearchDoc({ ...p, category: catById.get(p.categoryId) })),
    ),
    categories: buildSearchIndex(
      corpus.categories.map((c) => ({
        id: c.id,
        terms: [
          { text: c.name.bn, weight: 1, loose: false },
          { text: c.name.en, weight: 1, loose: false },
          { text: c.slug.replace(/-/g, ' '), weight: 0.9, loose: false },
        ],
      })),
    ),
  }
  return memo
}

export async function searchCatalog(raw: string, limit = 20): Promise<SearchResultDTO> {
  const q = raw.trim().slice(0, 100)
  if (!q) return { products: [], categories: [] }
  const [corpus, cards] = await Promise.all([getSearchCorpus(), getAllProductCards()])
  const idx = indexes(corpus)

  const productHits = searchIndex(idx.products, q, limit)
  const cardById = new Map(cards.map((c) => [c.id, c]))
  // Only suggest a category when it matches at least about as well as the best product
  // ("mango" must not suggest গরুর মাংস just because মাংস romanises to "mangs").
  const productTop = productHits[0]?.score ?? 0
  const catHits = searchIndex(idx.categories, q, 3).filter((h) => h.score >= productTop * 0.8)
  const catById = new Map(corpus.categories.map((c) => [c.id, c]))

  return {
    products: productHits.map((h) => cardById.get(h.id)).filter((c) => c !== undefined),
    categories: catHits.map((h) => catById.get(h.id)).filter((c) => c !== undefined),
  }
}
