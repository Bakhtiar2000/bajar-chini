import Link from 'next/link'
import { SearchX } from 'lucide-react'
import type { Locale } from '@/i18n/config'
import { getT } from '@/i18n/server'
import { normalizeSearch } from '@/lib/utils'
import { toLocaleDigits, type Localized } from '@/lib/format'
import type { ProductCardDTO } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { FilterBar, type FilterState } from './filter-bar'
import { ProductCard, ProductGrid } from './product-card'

const PAGE_SIZE = 12

type SP = Record<string, string | string[] | undefined>
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? ''

export function parseFilters(sp: SP): FilterState & { page: number } {
  const sort = one(sp.sort)
  return {
    q: one(sp.q).slice(0, 100),
    sort: ['name-asc', 'name-desc', 'latest', 'price-low'].includes(sort) ? sort : 'name-asc',
    seasonal: one(sp.seasonal) === '1',
    updated: one(sp.updated) === '1',
    variety: one(sp.variety).slice(0, 100),
    page: Math.max(1, Math.min(50, Number.parseInt(one(sp.page), 10) || 1)),
  }
}

function applyFilters(products: ProductCardDTO[], f: FilterState, locale: Locale) {
  const q = normalizeSearch(f.q)
  let list = products.filter((p) => {
    if (q && !normalizeSearch(`${p.name.bn} ${p.name.en}`).includes(q)) return false
    if (f.seasonal && !p.isSeasonal) return false
    if (f.updated && p.latestPrice?.freshness !== 'current') return false
    if (f.variety && p.variety?.en !== f.variety) return false
    return true
  })
  const name = (p: ProductCardDTO) => (locale === 'bn' ? p.name.bn : p.name.en)
  const collator = new Intl.Collator(locale === 'bn' ? 'bn' : 'en')
  const obs = (p: ProductCardDTO) =>
    p.latestPrice ? p.latestPrice.year * 12 + p.latestPrice.month : -1
  list = [...list].sort((a, b) => {
    switch (f.sort) {
      case 'name-desc':
        return collator.compare(name(b), name(a))
      case 'latest':
        return obs(b) - obs(a) || collator.compare(name(a), name(b))
      case 'price-low':
        return (
          (a.latestPrice?.referencePrice ?? Infinity) - (b.latestPrice?.referencePrice ?? Infinity)
        )
      default:
        return collator.compare(name(a), name(b))
    }
  })
  return list
}

/** Server-rendered, URL-driven product listing with filters and "load more". */
export function ProductBrowser({
  products,
  searchParams,
  locale,
  basePath,
}: {
  products: ProductCardDTO[]
  searchParams: SP
  locale: Locale
  basePath: string
}) {
  const t = getT(locale)
  const filters = parseFilters(searchParams)
  const filtered = applyFilters(products, filters, locale)
  const shown = filtered.slice(0, filters.page * PAGE_SIZE)

  const varietyMap = new Map<string, Localized>()
  for (const p of products) if (p.variety?.en) varietyMap.set(p.variety.en, p.variety)
  const varieties = [...varietyMap.values()]

  const nextParams = new URLSearchParams()
  for (const [k, v] of Object.entries(searchParams)) {
    const val = one(v)
    if (val && k !== 'page') nextParams.set(k, val)
  }
  nextParams.set('page', String(filters.page + 1))

  return (
    <div className="space-y-5">
      <FilterBar initial={filters} varieties={varieties} />
      {shown.length ? (
        <>
          <p className="text-ink-muted text-sm" aria-live="polite">
            {t('products.showing', {
              shown: toLocaleDigits(shown.length, locale),
              total: toLocaleDigits(filtered.length, locale),
            })}
          </p>
          <ProductGrid>
            {shown.map((p, i) => (
              <ProductCard key={p.id} product={p} locale={locale} priority={i < 2} />
            ))}
          </ProductGrid>
          {shown.length < filtered.length ? (
            <div className="flex justify-center pt-2">
              <Button asChild variant="outline" size="lg">
                <Link href={`${basePath}?${nextParams.toString()}`} scroll={false}>
                  {t('products.loadMore')}
                </Link>
              </Button>
            </div>
          ) : null}
        </>
      ) : (
        <div className="border-border flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-white px-6 py-14 text-center">
          <SearchX className="text-ink-muted size-10" />
          <p className="text-ink-muted">
            {products.length ? t('products.noResults') : t('products.noProductsInCategory')}
          </p>
          {products.length ? (
            <Button asChild variant="outline">
              <Link href={basePath}>{t('products.clearFilters')}</Link>
            </Button>
          ) : null}
        </div>
      )}
    </div>
  )
}

export function GridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="space-y-5">
      <div className="bg-muted h-28 animate-pulse rounded-2xl" />
      <ProductGrid>
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="border-border bg-card overflow-hidden rounded-2xl border">
            <div className="bg-muted aspect-[4/3] animate-pulse" />
            <div className="space-y-2 p-4">
              <div className="bg-muted h-5 w-2/3 animate-pulse rounded" />
              <div className="bg-muted h-4 w-1/3 animate-pulse rounded" />
              <div className="bg-muted h-20 animate-pulse rounded-xl" />
            </div>
          </div>
        ))}
      </ProductGrid>
    </div>
  )
}
