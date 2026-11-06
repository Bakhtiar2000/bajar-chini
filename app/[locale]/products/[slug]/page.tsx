import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { CalendarRange, CircleCheck, Lightbulb, ScanSearch, TriangleAlert } from 'lucide-react'
import { localizePath, type Locale } from '@/i18n/config'
import { getLocale, getT } from '@/i18n/server'
import { getAllSlugs, toSlugParams, getProductDetail } from '@/lib/data/public'
import { monthName, pick, pickList } from '@/lib/format'
import { jsonLd, pageAlternates } from '@/lib/seo'
import { absoluteUrl } from '@/lib/utils'
import { Badge, Skeleton } from '@/components/ui/misc'
import { Breadcrumbs } from '@/components/site/page-header'
import { Gallery } from '@/components/site/gallery'
import { PriceSection } from '@/components/site/price-section'
import { ProductCard, ProductGrid } from '@/components/site/product-card'

type Props = PageProps<'/[locale]/products/[slug]'>

export async function generateStaticParams() {
  const { products } = await getAllSlugs()
  return toSlugParams(products)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const locale = await getLocale()
  const product = await getProductDetail(slug)
  if (!product) return {}
  const t = getT(locale)
  const other = locale === 'bn' ? 'en' : 'bn'
  const title = `${pick(product.name, locale)} (${product.name[other]}) — ${t('product.identifyTitle').replace('?', '')}`
  const description = pick(product.shortDescription, locale)
  return {
    title,
    description,
    alternates: pageAlternates(locale, `/products/${slug}`),
    openGraph: {
      title,
      description,
      type: 'article',
      images: product.image ? [product.image] : [],
    },
  }
}

const SECTION_IDS = {
  identify: 'identify',
  quality: 'quality',
  warning: 'warning',
  current: 'price',
  trend: 'trend',
  history: 'history',
  tips: 'tips',
  season: 'season',
}

function Paragraphs({ text }: { text: string }) {
  return (
    <div className="text-ink space-y-3 leading-relaxed">
      {text
        .split(/\n{2,}/)
        .filter(Boolean)
        .map((p, i) => (
          <p key={i}>{p}</p>
        ))}
    </div>
  )
}

function CheckList({ items, tone }: { items: string[]; tone: 'good' | 'warn' | 'tip' }) {
  const Icon = tone === 'good' ? CircleCheck : tone === 'warn' ? TriangleAlert : Lightbulb
  const color = tone === 'good' ? 'text-brand' : tone === 'warn' ? 'text-amber-600' : 'text-orange'
  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {items.map((item, i) => (
        <li key={i} className="border-border flex gap-3 rounded-xl border bg-white p-4">
          <Icon className={`mt-0.5 size-5 shrink-0 ${color}`} aria-hidden />
          <span className="text-ink leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  )
}

async function ProductContent({ params, locale }: { params: Props['params']; locale: Locale }) {
  const { slug } = await params
  const product = await getProductDetail(slug)
  if (!product) notFound()

  const t = getT(locale)
  const other = locale === 'bn' ? 'en' : 'bn'
  const name = pick(product.name, locale)
  const altNames = pickList(product.alternativeNames, locale)
  const otherAlt = product.alternativeNames[other]
  const good = pickList(product.goodQualitySigns, locale)
  const warn = pickList(product.warningSigns, locale)
  const tips = pickList(product.buyingTips, locale)
  const ident = pick(product.identificationGuide, locale)
  const season = pick(product.seasonalInformation, locale)
  const categoryHref = localizePath(locale, `/categories/${product.category.slug}`)

  const toc = [
    { id: SECTION_IDS.identify, label: t('product.identifyTitle') },
    { id: SECTION_IDS.quality, label: t('product.goodQualityTitle') },
    { id: SECTION_IDS.warning, label: t('product.warningTitle') },
    { id: SECTION_IDS.current, label: t('price.monthlyTitle') },
    { id: SECTION_IDS.trend, label: t('price.trendTitle') },
    { id: SECTION_IDS.tips, label: t('product.buyingTipsTitle') },
    { id: SECTION_IDS.season, label: t('product.seasonalTitle') },
  ]

  const ld = [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name,
      alternateName: [product.name[other], ...altNames, ...otherAlt],
      description: pick(product.description, locale) || pick(product.shortDescription, locale),
      category: pick(product.category.name, locale),
      image: product.images.map((i) => i.url),
      url: absoluteUrl(localizePath(locale, `/products/${product.slug}`)),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: t('nav.home'),
          item: absoluteUrl(localizePath(locale, '/')),
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: pick(product.category.name, locale),
          item: absoluteUrl(categoryHref),
        },
        { '@type': 'ListItem', position: 3, name },
      ],
    },
  ]

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(ld)} />

      {/* A. Overview */}
      <div className="border-border from-soft-green to-cream border-b bg-gradient-to-b">
        <div className="container-page grid gap-8 py-8 lg:grid-cols-2 lg:py-10">
          <div className="lg:order-2">
            <Gallery images={product.images} alt={name} icon={product.category.icon} />
          </div>
          <div className="space-y-4 lg:order-1">
            <Breadcrumbs
              items={[
                { label: t('nav.home'), href: localizePath(locale, '/') },
                { label: pick(product.category.name, locale), href: categoryHref },
                { label: name },
              ]}
            />
            <div className="flex flex-wrap gap-2">
              <Link href={categoryHref}>
                <Badge variant="outline" className="hover:border-brand py-1">
                  {t('product.category')}: {pick(product.category.name, locale)}
                </Badge>
              </Link>
              {product.variety ? (
                <Badge variant="secondary" className="py-1">
                  {pick(product.variety, locale)}
                </Badge>
              ) : null}
              {product.isSeasonal ? (
                <Badge className="bg-orange text-ink py-1">{t('common.seasonal')}</Badge>
              ) : null}
            </div>
            <div>
              <h1 className="text-brand-dark text-3xl font-bold tracking-tight sm:text-4xl">
                {name}
              </h1>
              <p className="text-ink-muted mt-1 text-xl" lang={other}>
                {product.name[other]}
              </p>
            </div>
            {altNames.length || otherAlt.length ? (
              <p className="text-ink-muted text-sm">
                <span className="text-ink font-medium">{t('product.alternativeNames')}:</span>{' '}
                {[...altNames, ...otherAlt.filter((n) => !altNames.includes(n))].join(', ')}
              </p>
            ) : null}
            <p className="text-ink text-lg leading-relaxed">
              {pick(product.shortDescription, locale)}
            </p>
            {pick(product.description, locale) ? (
              <Paragraphs text={pick(product.description, locale)} />
            ) : null}

            <nav
              aria-label={t('product.onThisPage')}
              className="border-border rounded-xl border bg-white/80 p-4"
            >
              <p className="text-ink-muted mb-2 text-xs font-semibold tracking-wide uppercase">
                {t('product.onThisPage')}
              </p>
              <ul className="flex flex-wrap gap-2">
                {toc.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="bg-soft-green text-brand-dark inline-block rounded-full px-3 py-1 text-sm hover:bg-green-100"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>

      <div className="container-page space-y-14 py-10">
        {/* B. Identification */}
        <section id={SECTION_IDS.identify} aria-labelledby="identify-h" className="scroll-mt-24">
          <h2 id="identify-h" className="text-ink mb-4 flex items-center gap-2 text-2xl font-bold">
            <ScanSearch className="text-brand size-6" aria-hidden />
            {t('product.identifyTitle')}
          </h2>
          <div className="border-border rounded-2xl border bg-white p-5 sm:p-6">
            {ident ? (
              <Paragraphs text={ident} />
            ) : (
              <p className="text-ink-muted">{t('product.notAvailable')}</p>
            )}
          </div>
        </section>

        {/* C. Good quality */}
        <section id={SECTION_IDS.quality} aria-labelledby="quality-h" className="scroll-mt-24">
          <h2 id="quality-h" className="text-ink mb-4 flex items-center gap-2 text-2xl font-bold">
            <CircleCheck className="text-brand size-6" aria-hidden />
            {t('product.goodQualityTitle')}
          </h2>
          {good.length ? (
            <CheckList items={good} tone="good" />
          ) : (
            <p className="text-ink-muted">{t('product.notAvailable')}</p>
          )}
        </section>

        {/* D. Warning signs */}
        <section id={SECTION_IDS.warning} aria-labelledby="warning-h" className="scroll-mt-24">
          <h2 id="warning-h" className="text-ink mb-4 flex items-center gap-2 text-2xl font-bold">
            <TriangleAlert className="size-6 text-amber-600" aria-hidden />
            {t('product.warningTitle')}
          </h2>
          {warn.length ? (
            <CheckList items={warn} tone="warn" />
          ) : (
            <p className="text-ink-muted">{t('product.notAvailable')}</p>
          )}
          <p className="text-ink-muted mt-3 text-sm">{t('product.warningNote')}</p>
        </section>

        {/* E–H. Prices */}
        <PriceSection
          histories={product.priceHistories}
          productName={name}
          sectionIds={{
            current: SECTION_IDS.current,
            trend: SECTION_IDS.trend,
            history: SECTION_IDS.history,
          }}
        />

        {/* I. Buying tips */}
        <section id={SECTION_IDS.tips} aria-labelledby="tips-h" className="scroll-mt-24">
          <h2 id="tips-h" className="text-ink mb-4 flex items-center gap-2 text-2xl font-bold">
            <Lightbulb className="text-orange size-6" aria-hidden />
            {t('product.buyingTipsTitle')}
          </h2>
          {tips.length ? (
            <CheckList items={tips} tone="tip" />
          ) : (
            <p className="text-ink-muted">{t('product.notAvailable')}</p>
          )}
        </section>

        {/* J. Seasonal information */}
        <section id={SECTION_IDS.season} aria-labelledby="season-h" className="scroll-mt-24">
          <h2 id="season-h" className="text-ink mb-4 flex items-center gap-2 text-2xl font-bold">
            <CalendarRange className="text-brand size-6" aria-hidden />
            {t('product.seasonalTitle')}
          </h2>
          <div className="border-border space-y-4 rounded-2xl border bg-white p-5 sm:p-6">
            {season ? <p className="text-ink leading-relaxed">{season}</p> : null}
            {product.seasonMonths.length && product.seasonMonths.length < 12 ? (
              <div>
                <p className="text-ink-muted mb-2 text-sm font-medium">{t('product.peakMonths')}</p>
                <ol className="grid grid-cols-4 gap-1.5 sm:grid-cols-6 lg:grid-cols-12">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
                    const on = product.seasonMonths.includes(m)
                    return (
                      <li
                        key={m}
                        className={`rounded-lg px-1 py-2 text-center text-xs font-medium ${
                          on ? 'bg-brand text-white' : 'bg-muted text-ink-muted'
                        }`}
                      >
                        {monthName(m, locale)}
                        <span className="sr-only">{on ? ' ✓' : ''}</span>
                      </li>
                    )
                  })}
                </ol>
              </div>
            ) : (
              <p className="text-ink-muted text-sm">{t('common.yearRound')}</p>
            )}
          </div>
        </section>

        {/* K. Related */}
        {product.related.length ? (
          <section aria-labelledby="related-h">
            <h2 id="related-h" className="text-ink mb-4 text-2xl font-bold">
              {t('product.relatedTitle')}
            </h2>
            <ProductGrid>
              {product.related.map((p) => (
                <ProductCard key={p.id} product={p} locale={locale} />
              ))}
            </ProductGrid>
          </section>
        ) : null}
      </div>
    </article>
  )
}

function ProductSkeleton() {
  return (
    <div className="container-page grid gap-8 py-10 lg:grid-cols-2">
      <div className="space-y-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-24 w-full" />
      </div>
      <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
    </div>
  )
}

export default async function ProductPage(props: Props) {
  const locale = await getLocale()
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductContent params={props.params} locale={locale} />
    </Suspense>
  )
}
