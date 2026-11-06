import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { localizePath, type Locale } from '@/i18n/config'
import { getLocale, getT } from '@/i18n/server'
import { getAllProductCards, getCategories } from '@/lib/data/public'
import { pick } from '@/lib/format'
import { pageAlternates } from '@/lib/seo'
import { PageHeader } from '@/components/site/page-header'
import { GridSkeleton, ProductBrowser } from '@/components/site/product-browser'
import { CATEGORY_ICONS } from '@/components/site/category-icon'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = getT(locale)
  return {
    title: t('products.title'),
    description: t('products.subtitle'),
    alternates: pageAlternates(locale, '/products'),
  }
}

async function CategoryChips({ locale }: { locale: Locale }) {
  const t = getT(locale)
  const categories = await getCategories()
  return (
    <div className="-mx-4 flex scrollbar-thin gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
      <span className="bg-primary shrink-0 rounded-full px-4 py-2 text-sm font-medium text-white">
        {t('products.allCategories')}
      </span>
      {categories.map((c) => {
        const Icon = CATEGORY_ICONS[c.icon]
        return (
          <Link
            key={c.id}
            href={localizePath(locale, `/categories/${c.slug}`)}
            className="border-border text-ink hover:border-brand hover:text-brand inline-flex shrink-0 items-center gap-1.5 rounded-full border bg-white px-4 py-2 text-sm font-medium"
          >
            <Icon className="size-4" />
            {pick(c.name, locale)}
          </Link>
        )
      })}
    </div>
  )
}

async function Listing({
  searchParams,
  locale,
}: {
  searchParams: PageProps<'/[locale]/products'>['searchParams']
  locale: Locale
}) {
  const [sp, products] = await Promise.all([searchParams, getAllProductCards()])
  return (
    <ProductBrowser
      products={products}
      searchParams={sp}
      locale={locale}
      basePath={localizePath(locale, '/products')}
    />
  )
}

export default async function ProductsPage(props: PageProps<'/[locale]/products'>) {
  const locale = await getLocale()
  const t = getT(locale)
  return (
    <>
      <PageHeader
        title={t('products.title')}
        subtitle={t('products.subtitle')}
        crumbs={[
          { label: t('nav.home'), href: localizePath(locale, '/') },
          { label: t('products.title') },
        ]}
      >
        <CategoryChips locale={locale} />
      </PageHeader>
      <div className="container-page py-8">
        <Suspense fallback={<GridSkeleton />}>
          <Listing searchParams={props.searchParams} locale={locale} />
        </Suspense>
      </div>
    </>
  )
}
