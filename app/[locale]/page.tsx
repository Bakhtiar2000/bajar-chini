import Image from 'next/image'
import Link from 'next/link'
import { BadgeCheck, ChartLine, ScanSearch } from 'lucide-react'
import { localizePath } from '@/i18n/config'
import { getLocale, getT } from '@/i18n/server'
import {
  getArticles,
  getCategories,
  getDefaultMarket,
  getFeaturedProducts,
  getPopularPriceProducts,
} from '@/lib/data/public'
import { Button } from '@/components/ui/button'
import { SearchBox } from '@/components/site/search-box'
import { SectionHeading } from '@/components/site/section-heading'
import { CategoryCard } from '@/components/site/category-card'
import { ProductCard, ProductGrid } from '@/components/site/product-card'
import { MarketBanner, PriceDisclaimer, PriceTable } from '@/components/site/price-table'
import { ArticleCard } from '@/components/site/article-card'
import { jsonLd } from '@/lib/seo'
import { absoluteUrl } from '@/lib/utils'

const HERO_IMAGE = 'https://images.unsplash.com/photo-1488459716781-31db52582fe9'

export default async function HomePage() {
  const locale = await getLocale()
  const t = getT(locale)
  const [categories, featured, priceProducts, market, articles] = await Promise.all([
    getCategories(),
    getFeaturedProducts(8),
    getPopularPriceProducts(8),
    getDefaultMarket(),
    getArticles(4),
  ])
  const pricedProducts = priceProducts.filter((p) => p.latestPrice)
  const hasDemo = pricedProducts.some((p) => p.latestPrice?.isDemo)

  const websiteLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: t('common.appName'),
    url: absoluteUrl(localizePath(locale, '/')),
    inLanguage: locale,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${absoluteUrl(localizePath(locale, '/search'))}?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(websiteLd)} />

      {/* Hero */}
      <section className="border-border from-soft-green to-cream relative overflow-hidden border-b bg-gradient-to-b">
        <div className="container-page grid items-center gap-10 py-10 sm:py-14 lg:grid-cols-[1.1fr_1fr] lg:py-20">
          <div className="space-y-6">
            <p className="text-brand inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-medium shadow-xs ring-1 ring-green-100">
              <span className="bg-orange size-2 rounded-full" aria-hidden />
              {t('home.heroBadge')}
            </p>
            <h1 className="text-brand-dark text-[2rem] leading-[1.2] font-bold tracking-tight sm:text-5xl sm:leading-[1.15]">
              {t('home.heroTitle')}
            </h1>
            <p className="text-ink-muted max-w-xl text-lg leading-relaxed">
              {t('home.heroDescription')}
            </p>
            <div className="max-w-xl">
              <SearchBox variant="hero" />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href={localizePath(locale, '/products')}>{t('home.browseProducts')}</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href={localizePath(locale, '/prices')}>{t('home.viewPrices')}</Link>
              </Button>
            </div>
            <ul className="text-ink grid gap-2 pt-2 text-sm sm:grid-cols-3">
              {[
                { icon: ScanSearch, label: t('home.trustIdentify') },
                { icon: BadgeCheck, label: t('home.trustQuality') },
                { icon: ChartLine, label: t('home.trustPrices') },
              ].map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2">
                  <Icon className="text-brand size-5 shrink-0" aria-hidden />
                  {label}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-xl ring-1 ring-black/5 lg:aspect-[5/6]">
              <Image
                src={`${HERO_IMAGE}?w=1200&q=75&auto=format&fit=crop`}
                alt={t('home.heroImageAlt')}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
            </div>
            {market ? (
              <div className="absolute right-4 -bottom-5 left-4 sm:left-auto sm:w-80">
                <MarketBanner market={market} locale={locale} />
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container-page pt-16" aria-labelledby="cat-heading">
        <SectionHeading
          id="cat-heading"
          title={t('home.popularCategories')}
          subtitle={t('home.popularCategoriesSub')}
          href={localizePath(locale, '/products')}
          linkLabel={t('common.viewAll')}
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
          {categories.map((c) => (
            <CategoryCard key={c.id} category={c} locale={locale} />
          ))}
        </div>
      </section>

      {/* Popular products */}
      {featured.length ? (
        <section className="container-page pt-16" aria-labelledby="pop-heading">
          <SectionHeading
            id="pop-heading"
            title={t('home.popularProducts')}
            subtitle={t('home.popularProductsSub')}
            href={localizePath(locale, '/products')}
            linkLabel={t('common.viewAll')}
          />
          <ProductGrid>
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} locale={locale} />
            ))}
          </ProductGrid>
        </section>
      ) : null}

      {/* Monthly market prices */}
      <section className="mt-16 bg-white py-14" aria-labelledby="price-heading">
        <div className="container-page">
          <SectionHeading
            id="price-heading"
            title={t('home.monthlyPrices')}
            subtitle={t('home.monthlyPricesSub')}
            href={localizePath(locale, '/prices')}
            linkLabel={t('home.viewAllPrices')}
          />
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div>
              {pricedProducts.length ? (
                <PriceTable products={pricedProducts} locale={locale} />
              ) : (
                <p className="text-ink-muted rounded-xl border border-dashed p-6 text-center">
                  {t('home.noPricesYet')}
                </p>
              )}
            </div>
            <aside className="space-y-4">
              {market ? <MarketBanner market={market} locale={locale} /> : null}
              <PriceDisclaimer locale={locale} showDemo={hasDemo} />
            </aside>
          </div>
        </div>
      </section>

      {/* Guides */}
      {articles.length ? (
        <section className="container-page pt-16" aria-labelledby="guide-heading">
          <SectionHeading
            id="guide-heading"
            title={t('home.guides')}
            subtitle={t('home.guidesSub')}
            href={localizePath(locale, '/guides')}
            linkLabel={t('home.allGuides')}
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {articles.map((a) => (
              <ArticleCard key={a.id} article={a} locale={locale} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  )
}
