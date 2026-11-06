import 'server-only'
import { locale as rootLocale } from 'next/root-params'
import { createTranslator } from 'use-intl/core'
import { defaultLocale, isLocale, TIME_ZONE, type Locale } from './config'
import { messages } from './messages'

/** Active locale from the `[locale]` root segment. Usable in any server component. */
export async function getLocale(): Promise<Locale> {
  const value = await rootLocale()
  return isLocale(value) ? value : defaultLocale
}

/** Server-side translator powered by next-intl's core (use-intl). */
export function getT(locale: Locale) {
  return createTranslator({ locale, messages: messages[locale], timeZone: TIME_ZONE })
}

export type T = ReturnType<typeof getT>
