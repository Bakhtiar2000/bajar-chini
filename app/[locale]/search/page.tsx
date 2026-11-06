import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { SearchX } from 'lucide-react'
import { localizePath, type Locale } from '@/i18n/config'
import { getLocale, getT } from '@/i18n/server'
import { querySearch } from '@/lib/data/queries'
import { pick } from '@/lib/format'
import { SearchBox } from '@/components/site/search-box'
import { ProductCard, ProductGrid } from '@/components/site/product-card'
import { GridSkeleton } from '@/components/site/product-browser'
import { CATEGORY_ICONS } from '@/components/site/category-icon'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = getT(locale)
  return { title: t('search.title'), robots: { index: false, follow: true } }
}

const POPULAR = {
  bn: ['রুই মাছ', 'ইলিশ', 'ব্রয়লার', 'গরুর মাংস', 'পালং শাক', 'আলু'],
  en: ['Rui fish', 'Hilsa', 'Broiler', 'Beef', 'Spinach', 'Potato'],
}

async function Results({
  searchParams,
  locale,
}: {
  searchParams: PageProps<'/[locale]/search'>['searchParams']
  locale: Locale
}) {
  const sp = await searchParams
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q)?.trim().slice(0, 100) ?? ''
  const t = getT(locale)
  const searchHref = (term: string) =>
    `${localizePath(locale, '/search')}?q=${encodeURIComponent(term)}`

  if (!q) {
    return (
      <div className="space-y-3">
        <p className="text-ink-muted">{t('search.typeToSearch')}</p>
        <p className="text-ink text-sm font-medium">{t('search.popularSearches')}</p>
        <div className="flex flex-wrap gap-2">
          {POPULAR[locale].map((term) => (
            <Link
              key={term}
              href={searchHref(term)}
              className="border-border hover:border-brand hover:text-brand rounded-full border bg-white px-4 py-2 text-sm"
            >
              {term}
            </Link>
          ))}
        </div>
      </div>
    )
  }

  const results = await querySearch(q, 40)
  if (!results.products.length && !results.categories.length) {
    return (
      <div className="border-border flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-white px-6 py-14 text-center">
        <SearchX className="text-ink-muted size-10" />
        <p className="text-ink text-lg font-medium">{t('search.noResults', { query: q })}</p>
        <p className="text-ink-muted">{t('search.noResultsHint')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h2 className="text-ink text-xl font-semibold">{t('search.resultsFor', { query: q })}</h2>
      {results.categories.length ? (
        <section aria-labelledby="sr-cats">
          <h3
            id="sr-cats"
            className="text-ink-muted mb-3 text-sm font-semibold tracking-wide uppercase"
          >
            {t('search.categories')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {results.categories.map((c) => {
              const Icon = CATEGORY_ICONS[c.icon]
              return (
                <Link
                  key={c.id}
                  href={localizePath(locale, `/categories/${c.slug}`)}
                  className="border-border hover:border-brand hover:text-brand inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 font-medium"
                >
                  <Icon className="size-4" /> {pick(c.name, locale)}
                </Link>
              )
            })}
          </div>
        </section>
      ) : null}
      {results.products.length ? (
        <section aria-labelledby="sr-prods">
          <h3
            id="sr-prods"
            className="text-ink-muted mb-3 text-sm font-semibold tracking-wide uppercase"
          >
            {t('search.products')}
          </h3>
          <ProductGrid>
            {results.products.map((p) => (
              <ProductCard key={p.id} product={p} locale={locale} />
            ))}
          </ProductGrid>
        </section>
      ) : null}
    </div>
  )
}

async function SearchInput({
  searchParams,
}: {
  searchParams: PageProps<'/[locale]/search'>['searchParams']
}) {
  const sp = await searchParams
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q) ?? ''
  return <SearchBox key={q} variant="hero" defaultValue={q} />
}

export default async function SearchPage(props: PageProps<'/[locale]/search'>) {
  const locale = await getLocale()
  const t = getT(locale)
  return (
    <>
      <div className="border-border from-soft-green to-cream border-b bg-gradient-to-b">
        <div className="container-page max-w-3xl space-y-4 py-10">
          <h1 className="text-brand-dark text-3xl font-bold">{t('search.title')}</h1>
          <Suspense fallback={<div className="h-14 rounded-xl bg-white shadow-lg" />}>
            <SearchInput searchParams={props.searchParams} />
          </Suspense>
        </div>
      </div>
      <div className="container-page py-8">
        <Suspense fallback={<GridSkeleton count={4} />}>
          <Results searchParams={props.searchParams} locale={locale} />
        </Suspense>
      </div>
    </>
  )
}
