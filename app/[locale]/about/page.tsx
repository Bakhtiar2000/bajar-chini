import type { Metadata } from 'next'
import { ClipboardList, Eye, ShieldAlert } from 'lucide-react'
import { localizePath } from '@/i18n/config'
import { getLocale, getT } from '@/i18n/server'
import { getDefaultMarket } from '@/lib/data/public'
import { pick } from '@/lib/format'
import { pageAlternates } from '@/lib/seo'
import { PageHeader } from '@/components/site/page-header'
import { MarketBanner } from '@/components/site/price-table'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = getT(locale)
  return {
    title: t('about.title'),
    description: t('about.intro'),
    alternates: pageAlternates(locale, '/about'),
  }
}

export default async function AboutPage() {
  const locale = await getLocale()
  const t = getT(locale)
  const market = await getDefaultMarket()
  return (
    <>
      <PageHeader
        title={t('about.title')}
        subtitle={t('common.tagline')}
        crumbs={[
          { label: t('nav.home'), href: localizePath(locale, '/') },
          { label: t('about.title') },
        ]}
      />
      <div className="container-page max-w-3xl space-y-10 py-10 text-[17px] leading-relaxed">
        <p className="text-ink text-xl">{t('about.intro')}</p>

        <section className="space-y-3">
          <h2 className="text-brand-dark flex items-center gap-2 text-2xl font-bold">
            <Eye className="size-6" aria-hidden /> {t('about.missionTitle')}
          </h2>
          <ul className="marker:text-brand list-disc space-y-2 pl-6">
            <li>{t('about.mission1')}</li>
            <li>{t('about.mission2')}</li>
            <li>{t('about.mission3')}</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-brand-dark flex items-center gap-2 text-2xl font-bold">
            <ClipboardList className="size-6" aria-hidden /> {t('about.methodTitle')}
          </h2>
          <p>{t('about.method')}</p>
          {market ? (
            <>
              <MarketBanner market={market} locale={locale} />
              {pick(market.description, locale) ? (
                <p className="text-ink-muted text-base">{pick(market.description, locale)}</p>
              ) : null}
            </>
          ) : null}
        </section>

        <section className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="flex items-center gap-2 text-xl font-bold text-amber-900">
            <ShieldAlert className="size-5" aria-hidden /> {t('about.limitsTitle')}
          </h2>
          <p className="text-amber-900">{t('about.limits')}</p>
        </section>
      </div>
    </>
  )
}
