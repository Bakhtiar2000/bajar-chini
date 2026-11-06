import Link from 'next/link'
import { Suspense } from 'react'
import { localizePath, type Locale } from '@/i18n/config'
import { getT } from '@/i18n/server'
import { Logo } from './logo'
import { DesktopNav, MobileNav } from './nav'
import { LanguageSwitcher } from './language-switcher'
import { SearchBox } from './search-box'

export function SiteHeader({ locale }: { locale: Locale }) {
  const t = getT(locale)
  return (
    <header className="border-border/80 bg-cream/95 supports-[backdrop-filter]:bg-cream/80 sticky top-0 z-40 border-b backdrop-blur">
      <div className="container-page flex h-16 items-center gap-3">
        <Link
          href={localizePath(locale, '/')}
          className="shrink-0 rounded-lg"
          aria-label={t('common.appName')}
        >
          <Logo name={t('common.appName')} />
        </Link>
        <Suspense fallback={<div className="hidden flex-1 lg:block" />}>
          <DesktopNav />
        </Suspense>
        <div className="ml-auto hidden w-full max-w-64 md:block xl:max-w-72">
          <SearchBox variant="header" />
        </div>
        <Suspense fallback={<div className="size-10" />}>
          <LanguageSwitcher className="ml-auto hidden sm:inline-flex md:ml-0" />
          <MobileNav />
        </Suspense>
      </div>
    </header>
  )
}
