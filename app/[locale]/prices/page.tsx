import type { Metadata } from 'next'
import { localizePath } from '@/i18n/config'
import { getLocale, getT } from '@/i18n/server'
import { getAllProductCards, getCategories, getDefaultMarket } from '@/lib/data/public'
import { pick } from '@/lib/format'
import { pageAlternates } from '@/lib/seo'
import { PageHeader } from '@/components/site/page-header'
import { MarketBanner, PriceDisclaimer, PriceTable } from '@/components/site/price-table'
import { CATEGORY_ICONS } from '@/components/site/category-icon'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = getT(locale)
  return {
    title: t('price.pageTitle'),
    description: t('price.pageSubtitle'),
    alternates: pageAlternates(locale, '/prices'),
  }
}

export default async function PricesPage() {
  const locale = await getLocale()
  const t = getT(locale)
  const [categories, products, market] = await Promise.all([
    getCategories(),
    getAllProductCards(),
    getDefaultMarket(),
  ])
  const hasDemo = products.some((p) => p.latestPrice?.isDemo)
  const collator = new Intl.Collator(locale)

  const groups = categories
    .map((c) => ({
      category: c,
      products: products
        .filter((p) => p.category.id === c.id)
        .sort((a, b) => collator.compare(pick(a.name, locale), pick(b.name, locale))),
    }))
    .filter((g) => g.products.length)

  return (
    <>
      <PageHeader
        title={t('price.pageTitle')}
        subtitle={t('price.pageSubtitle')}
        crumbs={[
          { label: t('nav.home'), href: localizePath(locale, '/') },
          { label: t('price.pageTitle') },
        ]}
      />
      <div className="container-page grid gap-8 py-8 lg:grid-cols-[1fr_300px]">
        <div className="space-y-10">
          <nav
            aria-label={t('products.allCategories')}
            className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
          >
            {groups.map(({ category }) => {
              const Icon = CATEGORY_ICONS[category.icon]
              return (
                <a
                  key={category.id}
                  href={`#cat-${category.slug}`}
                  className="border-border hover:border-brand hover:text-brand inline-flex shrink-0 items-center gap-1.5 rounded-full border bg-white px-4 py-2 text-sm font-medium"
                >
                  <Icon className="size-4" /> {pick(category.name, locale)}
                </a>
              )
            })}
          </nav>
          {groups.map(({ category, products: list }) => (
            <section
              key={category.id}
              id={`cat-${category.slug}`}
              className="scroll-mt-24"
              aria-labelledby={`h-${category.slug}`}
            >
              <h2 id={`h-${category.slug}`} className="text-ink mb-3 text-xl font-bold">
                {pick(category.name, locale)}
              </h2>
              <PriceTable products={list} locale={locale} />
            </section>
          ))}
        </div>
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          {market ? <MarketBanner market={market} locale={locale} /> : null}
          <PriceDisclaimer locale={locale} showDemo={hasDemo} />
        </aside>
      </div>
    </>
  )
}
