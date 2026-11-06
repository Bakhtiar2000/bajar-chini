import type bn from './messages/bn.json'

declare module 'next-intl' {
  interface AppConfig {
    Locale: 'bn' | 'en'
    Messages: typeof bn
  }
}
