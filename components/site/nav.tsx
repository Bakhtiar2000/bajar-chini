'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Menu } from 'lucide-react'
import { localizePath, stripLocale, type Locale } from '@/i18n/config'
import { Dialog, DialogTitle, DialogTrigger, SheetContent } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { LanguageSwitcher } from './language-switcher'
import { SearchBox } from './search-box'
import { Logo } from './logo'

const LINKS = [
  { key: 'home', path: '/' },
  { key: 'products', path: '/products' },
  { key: 'prices', path: '/prices' },
  { key: 'tips', path: '/guides' },
  { key: 'about', path: '/about' },
] as const

function isActive(current: string, path: string) {
  if (path === '/') return current === '/'
  if (path === '/products')
    return current.startsWith('/products') || current.startsWith('/categories')
  return current.startsWith(path)
}

export function DesktopNav() {
  const t = useTranslations('nav')
  const locale = useLocale() as Locale
  const current = stripLocale(usePathname())
  return (
    <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
      {LINKS.map((l) => {
        const active = isActive(current, l.path)
        return (
          <Link
            key={l.key}
            href={localizePath(locale, l.path)}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'rounded-lg px-3 py-2 text-[15px] font-medium transition-colors',
              active
                ? 'bg-soft-green text-brand-dark'
                : 'text-ink hover:bg-soft-green hover:text-brand-dark',
            )}
          >
            {t(l.key)}
          </Link>
        )
      })}
    </nav>
  )
}

export function MobileNav() {
  const t = useTranslations()
  const locale = useLocale() as Locale
  const current = stripLocale(usePathname())
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="border-border text-ink inline-flex size-10 items-center justify-center rounded-lg border bg-white lg:hidden"
          aria-label={t('nav.openMenu')}
        >
          <Menu className="size-5" />
        </button>
      </DialogTrigger>
      <SheetContent side="right" closeLabel={t('common.close')} aria-describedby={undefined}>
        <DialogTitle className="sr-only">{t('nav.menu')}</DialogTitle>
        <Logo name={t('common.appName')} />
        <SearchBox variant="page" onNavigate={() => setOpen(false)} />
        <nav aria-label="Mobile" className="flex flex-col gap-1">
          {LINKS.map((l) => {
            const active = isActive(current, l.path)
            return (
              <Link
                key={l.key}
                href={localizePath(locale, l.path)}
                onClick={() => setOpen(false)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'rounded-lg px-3 py-3 text-base font-medium',
                  active ? 'bg-soft-green text-brand-dark' : 'text-ink hover:bg-soft-green',
                )}
              >
                {t(`nav.${l.key}`)}
              </Link>
            )
          })}
        </nav>
        <div className="mt-auto">
          <LanguageSwitcher className="w-full justify-center" />
        </div>
      </SheetContent>
    </Dialog>
  )
}
