import type { Metadata } from 'next'
import { localizePath } from '@/i18n/config'
import { getLocale, getT } from '@/i18n/server'
import { getArticles } from '@/lib/data/public'
import { pageAlternates } from '@/lib/seo'
import { PageHeader } from '@/components/site/page-header'
import { ArticleCard } from '@/components/site/article-card'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = getT(locale)
  return {
    title: t('guides.title'),
    description: t('guides.subtitle'),
    alternates: pageAlternates(locale, '/guides'),
  }
}

export default async function GuidesPage() {
  const locale = await getLocale()
  const t = getT(locale)
  const articles = await getArticles()
  return (
    <>
      <PageHeader
        title={t('guides.title')}
        subtitle={t('guides.subtitle')}
        crumbs={[
          { label: t('nav.home'), href: localizePath(locale, '/') },
          { label: t('guides.title') },
        ]}
      />
      <div className="container-page py-8">
        {articles.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => (
              <ArticleCard key={a.id} article={a} locale={locale} />
            ))}
          </div>
        ) : (
          <p className="text-ink-muted rounded-2xl border border-dashed p-10 text-center">
            {t('guides.empty')}
          </p>
        )}
      </div>
    </>
  )
}
