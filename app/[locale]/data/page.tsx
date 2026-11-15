import type { Metadata } from 'next'
import { Database, Download, FileJson, Scale } from 'lucide-react'
import { localizePath } from '@/i18n/config'
import { getLocale, getT } from '@/i18n/server'
import { jsonLd, pageAlternates } from '@/lib/seo'
import { absoluteUrl } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/site/page-header'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = getT(locale)
  return {
    title: t('tools.openData.title'),
    description: t('tools.openData.subtitle'),
    alternates: pageAlternates(locale, '/data'),
  }
}

const FIELDS = [
  ['product, productBn, productEn', 'product'],
  ['category', 'category'],
  ['market, marketBn, marketEn', 'market'],
  ['year, month', 'period'],
  ['minimumPrice, maximumPrice, referencePrice, currency', 'prices'],
  ['unit', 'unit'],
  ['observedAt', 'observedAt'],
  ['isDemo', 'isDemo'],
] as const

export default async function OpenDataPage() {
  const locale = await getLocale()
  const t = getT(locale)
  const endpoint = '/api/open-data/prices'

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: t('tools.openData.title'),
    description: t('tools.openData.subtitle'),
    url: absoluteUrl(localizePath(locale, '/data')),
    creator: { '@type': 'Organization', name: t('common.appName') },
    spatialCoverage: 'Bangladesh',
    distribution: [
      {
        '@type': 'DataDownload',
        encodingFormat: 'text/csv',
        contentUrl: absoluteUrl(`${endpoint}?format=csv`),
      },
      {
        '@type': 'DataDownload',
        encodingFormat: 'application/json',
        contentUrl: absoluteUrl(`${endpoint}?format=json`),
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(ld)} />
      <PageHeader
        title={t('tools.openData.title')}
        subtitle={t('tools.openData.subtitle')}
        crumbs={[
          { label: t('nav.home'), href: localizePath(locale, '/') },
          { label: t('nav.openData') },
        ]}
      >
        <div className="flex flex-wrap gap-3 pt-2">
          <Button asChild size="lg">
            <a href={`${endpoint}?format=csv`} download>
              <Download /> {t('tools.openData.csv')}
            </a>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a href={`${endpoint}?format=json`} target="_blank" rel="noopener">
              <FileJson /> {t('tools.openData.json')}
            </a>
          </Button>
        </div>
      </PageHeader>

      <div className="container-page max-w-3xl space-y-10 py-10">
        <section className="space-y-3">
          <h2 className="text-brand-dark flex items-center gap-2 text-2xl font-bold">
            <Database className="size-6" aria-hidden /> {t('tools.openData.fieldsTitle')}
          </h2>
          <dl className="border-border divide-border divide-y rounded-2xl border bg-white">
            {FIELDS.map(([cols, key]) => (
              <div key={key} className="grid gap-1 p-4 sm:grid-cols-[16rem_1fr]">
                <dt className="font-mono text-sm break-words">{cols}</dt>
                <dd className="text-ink-muted">{t(`tools.openData.fields.${key}`)}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="space-y-3">
          <h2 className="text-brand-dark text-2xl font-bold">{t('tools.openData.apiTitle')}</h2>
          <p className="text-ink-muted">{t('tools.openData.apiText')}</p>
          <pre className="bg-ink overflow-x-auto rounded-xl p-4 text-sm text-green-100">
            <code>{`GET ${endpoint}?format=json
GET ${endpoint}?format=csv&market=<slug>&year=2026&month=11`}</code>
          </pre>
        </section>

        <section className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="flex items-center gap-2 text-xl font-bold text-amber-900">
            <Scale className="size-5" aria-hidden /> {t('tools.openData.licenseTitle')}
          </h2>
          <p className="leading-relaxed text-amber-900">{t('tools.openData.licenseText')}</p>
        </section>
      </div>
    </>
  )
}
