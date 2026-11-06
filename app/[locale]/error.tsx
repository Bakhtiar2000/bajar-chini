'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations('errors')
  useEffect(() => {
    console.error(error)
  }, [error])
  return (
    <div className="container-page flex flex-col items-center gap-4 py-24 text-center">
      <TriangleAlert className="size-12 text-amber-600" />
      <h1 className="text-ink text-2xl font-bold">{t('errorTitle')}</h1>
      <p className="text-ink-muted max-w-md">{t('errorText')}</p>
      <Button onClick={reset}>{t('tryAgain')}</Button>
    </div>
  )
}
