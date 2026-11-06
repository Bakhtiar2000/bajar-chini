import { TIME_ZONE, type Locale } from '@/i18n/config'

export type Localized = { bn: string; en: string }
export type LocalizedList = { bn: string[]; en: string[] }

const MONTHS: Record<Locale, string[]> = {
  bn: [
    'জানুয়ারি',
    'ফেব্রুয়ারি',
    'মার্চ',
    'এপ্রিল',
    'মে',
    'জুন',
    'জুলাই',
    'আগস্ট',
    'সেপ্টেম্বর',
    'অক্টোবর',
    'নভেম্বর',
    'ডিসেম্বর',
  ],
  en: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
}

const SHORT_MONTHS_EN = MONTHS.en.map((m) => m.slice(0, 3))

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯']

/** Pick the active-language string, falling back to the other language when empty. */
export function pick(value: Localized | undefined | null, locale: Locale): string {
  if (!value) return ''
  return (locale === 'bn' ? value.bn || value.en : value.en || value.bn) ?? ''
}

export function pickList(value: LocalizedList | undefined | null, locale: Locale): string[] {
  if (!value) return []
  const primary = locale === 'bn' ? value.bn : value.en
  const fallback = locale === 'bn' ? value.en : value.bn
  return primary?.length ? primary : (fallback ?? [])
}

export function toLocaleDigits(value: string | number, locale: Locale): string {
  const str = String(value)
  if (locale !== 'bn') return str
  return str.replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)])
}

export function formatNumber(value: number, locale: Locale, maxFractionDigits = 2): string {
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: maxFractionDigits,
  }).format(value)
  return toLocaleDigits(formatted, locale)
}

export function formatPrice(value: number, locale: Locale): string {
  return `৳${formatNumber(value, locale)}`
}

export function formatPriceRange(min: number, max: number, locale: Locale): string {
  if (min === max) return formatPrice(min, locale)
  return `৳${formatNumber(min, locale)}–${formatNumber(max, locale)}`
}

export function formatPercent(value: number, locale: Locale): string {
  const sign = value > 0 ? '+' : value < 0 ? '−' : ''
  return `${sign}${formatNumber(Math.abs(value), locale, 1)}%`
}

export function monthName(month: number, locale: Locale): string {
  return MONTHS[locale][month - 1] ?? ''
}

export function formatMonthYear(month: number, year: number, locale: Locale): string {
  return `${monthName(month, locale)} ${toLocaleDigits(year, locale)}`
}

export function formatMonthYearShort(month: number, year: number, locale: Locale): string {
  if (locale === 'bn')
    return `${monthName(month, 'bn')} ’${toLocaleDigits(String(year).slice(2), 'bn')}`
  return `${SHORT_MONTHS_EN[month - 1]} ’${String(year).slice(2)}`
}

/** Calendar parts of a date as seen in Bangladesh. */
export function dhakaParts(date: Date | string): { year: number; month: number; day: number } {
  const d = typeof date === 'string' ? new Date(date) : date
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(d)
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value)
  return { year: get('year'), month: get('month'), day: get('day') }
}

export function formatDate(date: Date | string, locale: Locale): string {
  const { year, month, day } = dhakaParts(date)
  if (locale === 'bn')
    return `${toLocaleDigits(day, 'bn')} ${monthName(month, 'bn')} ${toLocaleDigits(year, 'bn')}`
  return `${day} ${monthName(month, 'en')} ${year}`
}

/** YYYY-MM-DD for <input type="date"> in Dhaka time. */
export function toDateInputValue(date: Date | string): string {
  const { year, month, day } = dhakaParts(date)
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}
