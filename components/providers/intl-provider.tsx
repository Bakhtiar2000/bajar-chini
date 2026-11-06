'use client'

import { NextIntlClientProvider } from 'next-intl'
import type { ReactNode } from 'react'
import { TIME_ZONE, type Locale } from '@/i18n/config'
import type { Messages } from '@/i18n/messages'

export function IntlProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale
  messages: Messages
  children: ReactNode
}) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone={TIME_ZONE}>
      {children}
    </NextIntlClientProvider>
  )
}
