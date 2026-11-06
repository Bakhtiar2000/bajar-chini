import type { Metadata, Viewport } from 'next'
import { notFound } from 'next/navigation'
import { Toaster } from 'sonner'
import '../globals.css'
import { isLocale, locales, type Locale } from '@/i18n/config'
import { getT } from '@/i18n/server'
import { messages } from '@/i18n/messages'
import { IntlProvider } from '@/components/providers/intl-provider'
import { SiteHeader } from '@/components/site/header'
import { SiteFooter } from '@/components/site/footer'
import { absoluteUrl } from '@/lib/utils'
import { pageAlternates } from '@/lib/seo'
import { hind, inter } from '@/lib/fonts'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export const viewport: Viewport = {
  themeColor: '#166534',
  width: 'device-width',
  initialScale: 1,
}

export async function generateMetadata({ params }: LayoutProps<'/[locale]'>): Promise<Metadata> {
  const { locale: raw } = await params
  const locale: Locale = isLocale(raw) ? raw : 'bn'
  const t = getT(locale)
  const title = `${t('common.appName')} — ${t('common.tagline')}`
  return {
    metadataBase: new URL(absoluteUrl('/')),
    title: { default: title, template: `%s | ${t('common.appName')}` },
    description: t('home.heroDescription'),
    applicationName: t('common.appName'),
    alternates: pageAlternates(locale, '/'),
    openGraph: {
      type: 'website',
      siteName: t('common.appName'),
      locale: locale === 'bn' ? 'bn_BD' : 'en_US',
      title,
      description: t('home.heroDescription'),
    },
    twitter: { card: 'summary_large_image', title, description: t('home.heroDescription') },
  }
}

export default async function LocaleLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const locale = raw
  const t = getT(locale)

  return (
    <html lang={locale} className={`${hind.variable} ${inter.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <IntlProvider locale={locale} messages={messages[locale]}>
          <a
            href="#main"
            className="sr-only z-50 rounded-lg bg-white px-4 py-2 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
          >
            {t('common.skipToContent')}
          </a>
          <SiteHeader locale={locale} />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter locale={locale} />
          <Toaster position="top-center" richColors />
        </IntlProvider>
      </body>
    </html>
  )
}
