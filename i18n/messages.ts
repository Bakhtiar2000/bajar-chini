import bn from '@/messages/bn.json'
import en from '@/messages/en.json'
import type { Locale } from './config'

export type Messages = typeof bn

export const messages: Record<Locale, Messages> = { bn, en }
