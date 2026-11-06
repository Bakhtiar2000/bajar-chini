import { dhakaParts } from '@/lib/format'
import type { YearMonth } from './calc'

/** Current calendar month in Bangladesh time. */
export function currentYearMonth(date: Date = new Date()): YearMonth {
  const { year, month } = dhakaParts(date)
  return { year, month }
}
