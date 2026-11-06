import type {
  Extreme,
  Freshness,
  MonthlyChange,
  PeriodAnalysis,
  PeriodKey,
  PricePoint,
} from '@/lib/types'

export type YearMonth = { year: number; month: number }

type RecordLike = YearMonth & {
  minimumPrice: number
  maximumPrice: number
  referencePrice?: number
  isDemo?: boolean
}

const round2 = (n: number) => Math.round(n * 100) / 100

/** Reference price = (minimum + maximum) / 2 */
export function calculateReferencePrice(minimumPrice: number, maximumPrice: number): number {
  return round2((minimumPrice + maximumPrice) / 2)
}

export function monthIndex({ year, month }: YearMonth): number {
  return year * 12 + (month - 1)
}

export function fromMonthIndex(index: number): YearMonth {
  return { year: Math.floor(index / 12), month: (index % 12) + 1 }
}

export function previousMonth(ym: YearMonth): YearMonth {
  return fromMonthIndex(monthIndex(ym) - 1)
}

/**
 * Freshness is derived from the observation month/year, never from the
 * database modification timestamp: editing notes on an old record must
 * not make it look current.
 */
export function getFreshness(observation: YearMonth, now: YearMonth): Freshness {
  const diff = monthIndex(now) - monthIndex(observation)
  if (diff <= 0) return 'current'
  if (diff === 1) return 'last-month'
  return 'older'
}

function refOf(r: RecordLike) {
  return typeof r.referencePrice === 'number'
    ? r.referencePrice
    : calculateReferencePrice(r.minimumPrice, r.maximumPrice)
}

/**
 * Compares the latest observation with the observation from the calendar month
 * directly before it, for a single product in a single market.
 * Missing months are never treated as zero and are never interpolated.
 */
export function calculateMonthlyChange(records: RecordLike[]): MonthlyChange {
  if (!records.length) return { status: 'no-data' }
  const sorted = [...records].sort((a, b) => monthIndex(b) - monthIndex(a))
  const latest = sorted[0]
  const current = { year: latest.year, month: latest.month, ref: refOf(latest) }
  const prevYm = previousMonth(latest)
  const prev = sorted.find((r) => r.year === prevYm.year && r.month === prevYm.month)
  if (!prev) return { status: 'no-previous', current }
  const previous = { year: prev.year, month: prev.month, ref: refOf(prev) }
  if (previous.ref === 0) return { status: 'zero-previous', current }
  const change = round2(current.ref - previous.ref)
  const percent = round2((change / previous.ref) * 100)
  return { status: 'ok', current, previous, change, percent }
}

/**
 * Builds one point per calendar month in the period. Months without an
 * observation are kept as explicit gaps (null values, observed: false).
 */
export function buildPeriodSeries(
  records: RecordLike[],
  period: PeriodKey,
  now: YearMonth,
): PricePoint[] {
  const byIndex = new Map<number, RecordLike>()
  for (const r of records) byIndex.set(monthIndex(r), r)

  const nowIdx = monthIndex(now)
  const latestIdx = records.length ? Math.max(...records.map(monthIndex)) : nowIdx
  const end = Math.max(nowIdx, latestIdx)
  let start: number
  if (period === '6m') start = end - 5
  else if (period === '12m') start = end - 11
  else {
    if (!records.length) return []
    start = Math.min(...records.map(monthIndex))
  }

  const points: PricePoint[] = []
  for (let i = start; i <= end; i++) {
    const ym = fromMonthIndex(i)
    const r = byIndex.get(i)
    points.push(
      r
        ? {
            ...ym,
            min: r.minimumPrice,
            max: r.maximumPrice,
            ref: refOf(r),
            observed: true,
            isDemo: Boolean(r.isDemo),
          }
        : { ...ym, min: null, max: null, ref: null, observed: false, isDemo: false },
    )
  }
  return points
}

export function periodExtremes(points: PricePoint[]): {
  highest: Extreme | null
  lowest: Extreme | null
} {
  let highest: Extreme | null = null
  let lowest: Extreme | null = null
  for (const p of points) {
    if (!p.observed || p.max === null || p.min === null) continue
    if (!highest || p.max > highest.value) highest = { value: p.max, year: p.year, month: p.month }
    if (!lowest || p.min < lowest.value) lowest = { value: p.min, year: p.year, month: p.month }
  }
  return { highest, lowest }
}

export function analyzePeriod(
  records: RecordLike[],
  period: PeriodKey,
  now: YearMonth,
): PeriodAnalysis {
  const points = buildPeriodSeries(records, period, now)
  const { highest, lowest } = periodExtremes(points)
  const observedCount = points.filter((p) => p.observed).length
  return {
    period,
    points,
    highest,
    lowest,
    observedCount,
    missingCount: points.length - observedCount,
  }
}

/** Flags a new observation whose reference price moved more than `threshold` (fraction) from the previous one. */
export function isUnusualChange(
  previousRef: number | null | undefined,
  newRef: number,
  threshold = 0.3,
): boolean {
  if (!previousRef || previousRef <= 0) return false
  return Math.abs(newRef - previousRef) / previousRef > threshold
}
