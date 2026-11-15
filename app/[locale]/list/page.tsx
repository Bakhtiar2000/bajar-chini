import type { Metadata } from 'next'
import { Suspense } from 'react'
import { localizePath } from '@/i18n/config'
import { getLocale, getT } from '@/i18n/server'
import { pageAlternates } from '@/lib/seo'
import { PageHeader } from '@/components/site/page-header'
import { BajarListView } from '@/components/site/saved-views'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = getT(locale)
  return {
    title: t('tools.list.title'),
    description: t('tools.list.subtitle'),
    alternates: pageAlternates(locale, '/list'),
    robots: { index: false, follow: true },
  }
}

export default async function BajarListPage() {
  const locale = await getLocale()
  const t = getT(locale)
  return (
    <>
      <PageHeader
        title={t('tools.list.title')}
        subtitle={t('tools.list.subtitle')}
        crumbs={[
          { label: t('nav.home'), href: localizePath(locale, '/') },
          { label: t('nav.list') },
        ]}
      />
      <div className="container-page max-w-3xl py-8">
        <Suspense fallback={<div className="bg-muted h-40 animate-pulse rounded-2xl" />}>
          <BajarListView />
        </Suspense>
      </div>
    </>
  )
}
