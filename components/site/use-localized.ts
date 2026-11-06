'use client'

import { useLocale } from 'next-intl'
import { useCallback } from 'react'
import { localizePath, type Locale } from '@/i18n/config'

export function useLocalizedPath() {
  const locale = useLocale() as Locale
  return useCallback((path: string) => localizePath(locale, path), [locale])
}
