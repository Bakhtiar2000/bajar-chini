import type { Metadata } from 'next'
import { localizePath } from '@/i18n/config'
import { getLocale, getT } from '@/i18n/server'
import { pageAlternates } from '@/lib/seo'
import { PageHeader } from '@/components/site/page-header'
import { WatchlistView } from '@/components/site/saved-views'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = getT(locale)
  return {
    title: t('tools.watch.title'),
    description: t('tools.watch.subtitle'),
    alternates: pageAlternates(locale, '/watchlist'),
    robots: { index: false, follow: true },
  }
}

export default async function WatchlistPage() {
  const locale = await getLocale()
  const t = getT(locale)
  return (
    <>
      <PageHeader
        title={t('tools.watch.title')}
        subtitle={t('tools.watch.subtitle')}
        crumbs={[
          { label: t('nav.home'), href: localizePath(locale, '/') },
          { label: t('nav.watchlist') },
        ]}
      />
      <div className="container-page max-w-4xl py-8">
        <WatchlistView />
      </div>
    </>
  )
}
