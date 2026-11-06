'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { Languages } from 'lucide-react'
import { LOCALE_COOKIE, localizePath, otherLocale, stripLocale, type Locale } from '@/i18n/config'
import { cn } from '@/lib/utils'

export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations('nav')
  const locale = useLocale() as Locale
  const pathname = usePathname()
  const router = useRouter()
  const target = otherLocale(locale)

  const switchLanguage = () => {
    // Persist the preference for a year, then open the same page in the other language.
    document.cookie = `${LOCALE_COOKIE}=${target}; path=/; max-age=31536000; samesite=lax`
    const path = localizePath(target, stripLocale(pathname))
    router.push(`${path}${window.location.search}${window.location.hash}`)
  }

  return (
    <button
      type="button"
      onClick={switchLanguage}
      lang={target}
      aria-label={t('switchLanguageLabel')}
      className={cn(
        'border-border text-ink hover:border-brand hover:text-brand inline-flex h-10 items-center gap-1.5 rounded-lg border bg-white px-3 text-sm font-medium transition-colors',
        className,
      )}
    >
      <Languages className="size-4" aria-hidden />
      {t('switchLanguage')}
    </button>
  )
}
