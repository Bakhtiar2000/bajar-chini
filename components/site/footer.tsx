import Link from 'next/link'
import { Mail, MapPin, Phone } from 'lucide-react'
import { localizePath, type Locale } from '@/i18n/config'
import { getT } from '@/i18n/server'
import { getCategories } from '@/lib/data/public'
import { pick, toLocaleDigits } from '@/lib/format'
import { LogoMark } from './logo'

export async function SiteFooter({ locale }: { locale: Locale }) {
  'use cache'
  const t = getT(locale)
  const categories = await getCategories().catch(() => [])
  const year = toLocaleDigits(new Date().getFullYear(), locale)
  const nav = [
    { label: t('nav.home'), href: '/' },
    { label: t('nav.products'), href: '/products' },
    { label: t('nav.prices'), href: '/prices' },
    { label: t('nav.tips'), href: '/guides' },
    { label: t('nav.about'), href: '/about' },
  ]

  return (
    <footer className="bg-brand-dark mt-20 text-green-50">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <LogoMark className="size-10 rounded-xl ring-2 ring-white/20" />
            <div>
              <p className="text-xl font-bold text-white">{t('common.appName')}</p>
              <p className="text-sm text-green-200">{t('common.tagline')}</p>
            </div>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-green-100/90">
            {t('footer.description')}
          </p>
          <p className="text-xs text-green-200/80">{t('footer.notEcommerce')}</p>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold tracking-wide text-white uppercase">
            {t('footer.explore')}
          </h2>
          <ul className="space-y-2 text-sm">
            {nav.map((n) => (
              <li key={n.href}>
                <Link
                  href={localizePath(locale, n.href)}
                  className="text-green-100/90 hover:text-white hover:underline"
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold tracking-wide text-white uppercase">
            {t('footer.categories')}
          </h2>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-1">
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  href={localizePath(locale, `/categories/${c.slug}`)}
                  className="text-green-100/90 hover:text-white hover:underline"
                >
                  {pick(c.name, locale)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-5">
          <div>
            <h2 className="mb-3 text-sm font-semibold tracking-wide text-white uppercase">
              {t('footer.contact')}
            </h2>
            <ul className="space-y-2 text-sm text-green-100/90">
              <li className="flex items-center gap-2">
                <Mail className="size-4 shrink-0" /> {t('footer.email')}
              </li>
              <li className="flex items-center gap-2">
                <Phone className="size-4 shrink-0" /> {t('footer.phone')}
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="size-4 shrink-0" /> {t('footer.location')}
              </li>
            </ul>
          </div>
          <div className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
            <h2 className="text-orange mb-1 text-xs font-semibold">
              {t('footer.disclaimerTitle')}
            </h2>
            <p className="text-xs leading-relaxed text-green-100/80">{t('footer.disclaimer')}</p>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-green-200/80 sm:flex-row">
          <p>{t('footer.copyright', { year })}</p>
          <p>{t('common.tagline')}</p>
        </div>
      </div>
    </footer>
  )
}
