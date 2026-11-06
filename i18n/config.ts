export const locales = ['bn', 'en'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'bn'
export const LOCALE_COOKIE = 'NEXT_LOCALE'
export const TIME_ZONE = 'Asia/Dhaka'

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (locales as readonly string[]).includes(value)
}

/**
 * Bengali (default) lives at clean URLs ("/products/rui-fish"),
 * English is prefixed ("/en/products/rui-fish").
 */
export function localizePath(locale: Locale, path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`
  if (locale === defaultLocale) return clean
  return clean === '/' ? `/${locale}` : `/${locale}${clean}`
}

/** Removes a locale prefix from a browser pathname. */
export function stripLocale(pathname: string): string {
  for (const locale of locales) {
    if (pathname === `/${locale}`) return '/'
    if (pathname.startsWith(`/${locale}/`)) return pathname.slice(locale.length + 1)
  }
  return pathname || '/'
}

export function otherLocale(locale: Locale): Locale {
  return locale === 'bn' ? 'en' : 'bn'
}
