import Link from 'next/link'
import { localizePath } from '@/i18n/config'
import { getLocale, getT } from '@/i18n/server'
import { Button } from '@/components/ui/button'
import { LogoMark } from '@/components/site/logo'

export default async function NotFound() {
  const locale = await getLocale()
  const t = getT(locale)
  return (
    <div className="container-page flex flex-col items-center gap-4 py-24 text-center">
      <LogoMark className="size-14" />
      <p className="text-brand-dark text-6xl font-bold">৪০৪</p>
      <h1 className="text-ink text-2xl font-bold">{t('errors.notFoundTitle')}</h1>
      <p className="text-ink-muted max-w-md">{t('errors.notFoundText')}</p>
      <Button asChild size="lg">
        <Link href={localizePath(locale, '/')}>{t('errors.goHome')}</Link>
      </Button>
    </div>
  )
}
