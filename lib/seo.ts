import type { Metadata } from 'next'
import { localizePath, type Locale } from '@/i18n/config'
import { absoluteUrl } from './utils'

/** Canonical + hreflang alternates for a locale-independent path like "/products/rui-fish". */
export function pageAlternates(locale: Locale, path: string): Metadata['alternates'] {
  return {
    canonical: absoluteUrl(localizePath(locale, path)),
    languages: {
      bn: absoluteUrl(localizePath('bn', path)),
      en: absoluteUrl(localizePath('en', path)),
      'x-default': absoluteUrl(localizePath('bn', path)),
    },
  }
}

export function jsonLd(data: unknown) {
  // Escape "<" so content can never close the script tag.
  return { __html: JSON.stringify(data).replace(/</g, '\\u003c') }
}
