import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { localizePath, type Locale } from '@/i18n/config'
import { getLocale, getT } from '@/i18n/server'
import { getAllSlugs, toSlugParams, getCategoryBySlug, getProductsByCategory } from '@/lib/data/public'
import { pick, toLocaleDigits } from '@/lib/format'
import { jsonLd, pageAlternates } from '@/lib/seo'
import { absoluteUrl } from '@/lib/utils'
import { Breadcrumbs } from '@/components/site/page-header'
import { GridSkeleton, ProductBrowser } from '@/components/site/product-browser'
import { SmartImage } from '@/components/site/smart-image'
import { Skeleton } from '@/components/ui/misc'

type Props = PageProps<'/[locale]/categories/[slug]'>

export async function generateStaticParams() {
  const { categories } = await getAllSlugs()
  return toSlugParams(categories)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const locale = await getLocale()
  const category = await getCategoryBySlug(slug)
  if (!category) return {}
  const title = `${pick(category.name, locale)} (${locale === 'bn' ? category.name.en : category.name.bn})`
  return {
    title,
    description: pick(category.description, locale),
    alternates: pageAlternates(locale, `/categories/${slug}`),
    openGraph: {
      title,
      description: pick(category.description, locale),
      images: category.image ? [category.image] : [],
    },
  }
}

async function CategoryHeader({ params, locale }: { params: Props['params']; locale: Locale }) {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) notFound()
  const t = getT(locale)
  const other = locale === 'bn' ? 'en' : 'bn'

  const ld = {
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
        name: t('nav.products'),
        item: absoluteUrl(localizePath(locale, '/products')),
      },
      { '@type': 'ListItem', position: 3, name: pick(category.name, locale) },
    ],
  }

  return (
    <div className="border-border from-soft-green to-cream border-b bg-gradient-to-b">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(ld)} />
      <div className="container-page grid items-center gap-6 py-8 md:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          <Breadcrumbs
            items={[
              { label: t('nav.home'), href: localizePath(locale, '/') },
              { label: t('nav.products'), href: localizePath(locale, '/products') },
              { label: pick(category.name, locale) },
            ]}
          />
          <h1 className="text-brand-dark text-3xl font-bold tracking-tight sm:text-4xl">
            {pick(category.name, locale)}
            <span className="text-ink-muted ml-3 text-xl font-medium" lang={other}>
              {category.name[other]}
            </span>
          </h1>
          <p className="text-ink-muted max-w-2xl text-lg">{pick(category.description, locale)}</p>
          <p className="text-brand text-sm font-medium">
            {t('home.productCount', { count: toLocaleDigits(category.productCount, locale) })}
          </p>
        </div>
        <div className="relative hidden aspect-[4/3] overflow-hidden rounded-2xl shadow-md md:block">
          <SmartImage
            src={category.image}
            alt={pick(category.name, locale)}
            icon={category.icon}
            sizes="320px"
            priority
          />
        </div>
      </div>
    </div>
  )
}

async function Listing({
  params,
  searchParams,
  locale,
}: {
  params: Props['params']
  searchParams: Props['searchParams']
  locale: Locale
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams])
  const category = await getCategoryBySlug(slug)
  if (!category) return null
  const products = await getProductsByCategory(category.id)
  return (
    <ProductBrowser
      products={products}
      searchParams={sp}
      locale={locale}
      basePath={localizePath(locale, `/categories/${slug}`)}
    />
  )
}

export default async function CategoryPage(props: Props) {
  const locale = await getLocale()
  return (
    <>
      <Suspense
        fallback={
          <div className="container-page space-y-3 py-10">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-10 w-72" />
            <Skeleton className="h-5 w-full max-w-xl" />
          </div>
        }
      >
        <CategoryHeader params={props.params} locale={locale} />
      </Suspense>
      <div className="container-page py-8">
        <Suspense fallback={<GridSkeleton />}>
          <Listing params={props.params} searchParams={props.searchParams} locale={locale} />
        </Suspense>
      </div>
    </>
  )
}
