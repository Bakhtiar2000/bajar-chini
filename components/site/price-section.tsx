'use client'

import { useMemo, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  CircleCheck,
  CircleDashed,
  Clock,
  FlaskConical,
  History,
  Info,
  MapPin,
  Minus,
} from 'lucide-react'
import type { Locale } from '@/i18n/config'
import {
  formatDate,
  formatMonthYear,
  formatMonthYearShort,
  formatNumber,
  formatPercent,
  formatPriceRange,
  pick,
} from '@/lib/format'
import type { Freshness, MarketPriceHistory, PeriodKey, PricePoint } from '@/lib/types'
import { NativeSelect } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/controls'
import { cn } from '@/lib/utils'

const LINE = '#166534'
const BAND = '#bbf7d0'
const GAP = '#e5e7eb'

function Fresh({ f }: { f: Freshness | null }) {
  const t = useTranslations('price.freshness')
  const map = {
    current: { icon: CircleCheck, label: t('current'), cls: 'bg-soft-green text-brand' },
    'last-month': {
      icon: Clock,
      label: t('lastMonth'),
      cls: 'bg-sky-50 text-sky-800 ring-1 ring-sky-200',
    },
    older: {
      icon: History,
      label: t('older'),
      cls: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200',
    },
  } as const
  const v = f
    ? map[f]
    : { icon: CircleDashed, label: t('notObserved'), cls: 'bg-muted text-ink-muted' }
  const Icon = v.icon
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
        v.cls,
      )}
    >
      <Icon className="size-3.5" /> {v.label}
    </span>
  )
}

function Demo() {
  const t = useTranslations('common')
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-amber-400 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">
      <FlaskConical className="size-3.5" /> {t('demoData')}
    </span>
  )
}

type ChartDatum = PricePoint & {
  key: string
  label: string
  band: [number, number] | null
  gap?: [number, number] | null
}

function ChartTooltip({
  active,
  payload,
  locale,
}: {
  active?: boolean
  payload?: { payload: ChartDatum }[]
  locale: Locale
}) {
  const t = useTranslations('price')
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="border-border min-w-44 rounded-xl border bg-white p-3 text-sm shadow-lg">
      <p className="text-ink mb-1.5 font-semibold">{formatMonthYear(d.month, d.year, locale)}</p>
      {d.observed && d.min !== null && d.max !== null && d.ref !== null ? (
        <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-0.5">
          <dt className="text-ink-muted">{t('minimum')}</dt>
          <dd className="tabular text-right font-medium">৳{formatNumber(d.min, locale)}</dd>
          <dt className="text-ink-muted">{t('maximum')}</dt>
          <dd className="tabular text-right font-medium">৳{formatNumber(d.max, locale)}</dd>
          <dt className="text-ink-muted flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-3 rounded" style={{ background: LINE }} />
            {t('reference')}
          </dt>
          <dd className="tabular text-brand-dark text-right font-semibold">
            ৳{formatNumber(d.ref, locale)}
          </dd>
        </dl>
      ) : (
        <p className="text-ink-muted">{t('missingMonth')}</p>
      )}
    </div>
  )
}

export function PriceSection({
  histories,
  productName,
  sectionIds,
}: {
  histories: MarketPriceHistory[]
  productName: string
  sectionIds: { current: string; trend: string; history: string }
}) {
  const t = useTranslations('price')
  const locale = useLocale() as Locale
  const [marketId, setMarketId] = useState(histories[0]?.market.id ?? '')
  const [period, setPeriod] = useState<PeriodKey>('12m')

  const history = histories.find((h) => h.market.id === marketId) ?? histories[0]
  const analysis = history?.periods[period]

  const data: ChartDatum[] = useMemo(
    () =>
      (analysis?.points ?? []).map((p) => ({
        ...p,
        key: `${p.year}-${p.month}`,
        label: formatMonthYearShort(p.month, p.year, locale),
        band: p.min !== null && p.max !== null ? [p.min, p.max] : null,
      })),
    [analysis, locale],
  )

  // No published observations at all
  if (!history) {
    return (
      <>
        <section
          id={sectionIds.current}
          aria-labelledby={`${sectionIds.current}-h`}
          className="scroll-mt-24"
        >
          <h2 id={`${sectionIds.current}-h`} className="text-ink mb-4 text-2xl font-bold">
            {t('monthlyTitle')}
          </h2>
          <div className="border-border text-ink-muted flex items-start gap-3 rounded-2xl border border-dashed bg-white p-6">
            <CircleDashed className="mt-0.5 size-5 shrink-0" />
            <p>{t('noPrice')}</p>
          </div>
        </section>
        <section
          id={sectionIds.trend}
          aria-labelledby={`${sectionIds.trend}-h`}
          className="scroll-mt-24"
        >
          <h2 id={`${sectionIds.trend}-h`} className="text-ink mb-4 text-2xl font-bold">
            {t('trendTitle')}
          </h2>
          <p className="border-border text-ink-muted rounded-2xl border border-dashed bg-white p-6">
            {t('noHistory')}
          </p>
        </section>
      </>
    )
  }

  const latest = history.latest
  const market = history.market
  const marketLabel = `${pick(market.name, locale)}${market.city.bn || market.city.en ? `, ${pick(market.city, locale)}` : ''}`
  const change = history.change
  const anyDemo = history.records.some((r) => r.isDemo)
  const values = data.flatMap((d) => (d.observed ? [d.min!, d.max!] : []))
  const yMin = values.length ? Math.min(...values) : 0
  const yMax = values.length ? Math.max(...values) : 0
  // Rounded axis: 4 intervals on a "nice" step (1, 2, 2.5 or 5 × 10ⁿ).
  const rawStep = Math.max(1, ((yMax - yMin) * 1.3) / 4)
  const mag = 10 ** Math.floor(Math.log10(rawStep))
  const step = ([1, 2, 2.5, 5, 10].find((f) => f * mag >= rawStep) ?? 10) * mag
  const lo = Math.max(0, Math.floor((yMin - step * 0.3) / step) * step)
  const hi = Math.ceil((yMax + step * 0.3) / step) * step
  const ticks = Array.from({ length: Math.round((hi - lo) / step) + 1 }, (_, i) => lo + i * step)
  const missing = data.filter((d) => !d.observed)
  // Months without an observation are shaded as full-height columns (never interpolated).
  const chartData = data.map((d) => ({
    ...d,
    gap: d.observed ? null : ([lo, hi] as [number, number]),
  }))
  const tableRows = [...data].reverse()

  return (
    <>
      {/* E. Monthly observed market price */}
      <section
        id={sectionIds.current}
        aria-labelledby={`${sectionIds.current}-h`}
        className="scroll-mt-24"
      >
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <h2 id={`${sectionIds.current}-h`} className="text-ink text-2xl font-bold">
            {t('monthlyTitle')}
          </h2>
          {histories.length > 1 ? (
            <label className="flex items-center gap-2 text-sm">
              <span className="text-ink-muted">{t('market')}</span>
              <NativeSelect
                value={marketId}
                onChange={(e) => setMarketId(e.target.value)}
                className="w-auto"
              >
                {histories.map((h) => (
                  <option key={h.market.id} value={h.market.id}>
                    {pick(h.market.name, locale)}
                  </option>
                ))}
              </NativeSelect>
            </label>
          ) : null}
        </div>

        {latest ? (
          <div className="border-border overflow-hidden rounded-2xl border bg-white shadow-sm">
            <div className="grid gap-5 p-5 sm:p-6 md:grid-cols-[1fr_auto]">
              <div className="space-y-2">
                <p className="text-ink-muted text-sm font-medium">{productName}</p>
                <p className="flex flex-wrap items-baseline gap-x-2">
                  <span className="tabular text-brand-dark text-4xl font-bold sm:text-5xl">
                    {formatPriceRange(latest.minimumPrice, latest.maximumPrice, locale)}
                  </span>
                  <span className="text-ink-muted text-lg">/ {pick(latest.unit, locale)}</span>
                </p>
                <p className="text-ink-muted text-sm">
                  {t('reference')}:{' '}
                  <span className="tabular text-ink font-semibold">
                    ৳{formatNumber(latest.referencePrice, locale)}
                  </span>
                  <span className="ml-1 text-xs">({t('referenceHint')})</span>
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Fresh f={latest.freshness} />
                  {latest.isDemo ? <Demo /> : null}
                </div>
              </div>
              <dl className="grid content-start gap-3 text-sm sm:grid-cols-3 md:w-72 md:grid-cols-1">
                <div className="flex items-start gap-2">
                  <MapPin className="text-brand mt-0.5 size-4 shrink-0" />
                  <div>
                    <dt className="text-ink-muted">{t('referenceMarket')}</dt>
                    <dd className="text-ink font-medium">{marketLabel}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CalendarDays className="text-brand mt-0.5 size-4 shrink-0" />
                  <div>
                    <dt className="text-ink-muted">{t('observationMonth')}</dt>
                    <dd className="text-ink font-medium">
                      {formatMonthYear(latest.month, latest.year, locale)}
                    </dd>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="text-brand mt-0.5 size-4 shrink-0" />
                  <div>
                    <dt className="text-ink-muted">{t('lastObserved')}</dt>
                    <dd className="text-ink font-medium">
                      {formatDate(latest.observedAt, locale)}
                    </dd>
                  </div>
                </div>
              </dl>
            </div>
            <div className="flex gap-3 border-t border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-relaxed text-amber-900 sm:px-6">
              <Info className="mt-0.5 size-5 shrink-0" />
              <div className="space-y-1">
                <p>{t('disclaimer')}</p>
                {anyDemo ? <p className="font-medium">{t('demoNote')}</p> : null}
              </div>
            </div>
          </div>
        ) : (
          <p className="border-border text-ink-muted rounded-2xl border border-dashed bg-white p-6">
            {t('noPrice')}
          </p>
        )}
      </section>

      {/* F + H. Trend chart and insights */}
      <section
        id={sectionIds.trend}
        aria-labelledby={`${sectionIds.trend}-h`}
        className="scroll-mt-24"
      >
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id={`${sectionIds.trend}-h`} className="text-ink text-2xl font-bold">
              {t('trendTitle')}
            </h2>
            <p className="text-ink-muted mt-1 text-sm">{marketLabel}</p>
          </div>
          <Tabs value={period} onValueChange={(v) => setPeriod(v as PeriodKey)}>
            <TabsList aria-label={t('trendTitle')}>
              {(['6m', '12m', 'all'] as const).map((p) => (
                <TabsTrigger key={p} value={p} className="px-3 sm:px-4">
                  {t(`period.${p}`)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Insights */}
        <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="border-border col-span-2 rounded-xl border bg-white p-4">
            <p className="text-ink-muted text-xs">{t('changeFromPrevious')}</p>
            {change.status === 'ok' ? (
              <div className="mt-1 flex items-center gap-2">
                {change.change > 0 ? (
                  <ArrowUpRight className="size-6 text-red-700" aria-hidden />
                ) : change.change < 0 ? (
                  <ArrowDownRight className="text-brand size-6" aria-hidden />
                ) : (
                  <Minus className="text-ink-muted size-6" aria-hidden />
                )}
                <div>
                  <p className="tabular text-ink text-xl font-bold">
                    {change.change === 0
                      ? t('unchanged')
                      : `${change.change > 0 ? t('increased') : t('decreased')} ৳${formatNumber(Math.abs(change.change), locale)} (${formatPercent(change.percent, locale)})`}
                  </p>
                  <p className="text-ink-muted text-xs">
                    {formatMonthYear(change.current.month, change.current.year, locale)} ·{' '}
                    {t('comparedWith', {
                      previous: formatMonthYear(
                        change.previous.month,
                        change.previous.year,
                        locale,
                      ),
                    })}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-ink-muted mt-1 text-sm">
                {change.status === 'zero-previous' ? t('zeroPrevious') : t('noPrevious')}
              </p>
            )}
          </div>
          <div className="border-border rounded-xl border bg-white p-4">
            <p className="text-ink-muted text-xs">{t('highestInPeriod')}</p>
            {analysis?.highest ? (
              <>
                <p className="tabular text-ink mt-1 text-xl font-bold">
                  ৳{formatNumber(analysis.highest.value, locale)}
                </p>
                <p className="text-ink-muted text-xs">
                  {formatMonthYear(analysis.highest.month, analysis.highest.year, locale)}
                </p>
              </>
            ) : (
              <p className="text-ink-muted mt-1">—</p>
            )}
          </div>
          <div className="border-border rounded-xl border bg-white p-4">
            <p className="text-ink-muted text-xs">{t('lowestInPeriod')}</p>
            {analysis?.lowest ? (
              <>
                <p className="tabular text-ink mt-1 text-xl font-bold">
                  ৳{formatNumber(analysis.lowest.value, locale)}
                </p>
                <p className="text-ink-muted text-xs">
                  {formatMonthYear(analysis.lowest.month, analysis.lowest.year, locale)}
                </p>
              </>
            ) : (
              <p className="text-ink-muted mt-1">—</p>
            )}
          </div>
        </div>

        <div className="border-border rounded-2xl border bg-white p-3 sm:p-5">
          {analysis && analysis.observedCount > 0 ? (
            <>
              <div className="text-ink-muted mb-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-0.5 w-4 rounded" style={{ background: LINE }} />
                  {t('reference')}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-3 w-4 rounded-sm" style={{ background: BAND }} />
                  {t('chartRange')}
                </span>
                {missing.length ? (
                  <span className="flex items-center gap-1.5">
                    <span
                      className="inline-block h-3 w-4 rounded-sm border border-dashed border-gray-400"
                      style={{ background: GAP }}
                    />
                    {t('missingLegend')}
                  </span>
                ) : null}
                <span className="ml-auto">
                  {t('observedMonths', {
                    observed: formatNumber(analysis.observedCount, locale),
                    total: formatNumber(analysis.points.length, locale),
                  })}
                </span>
              </div>
              <div
                className="h-64 w-full sm:h-80"
                role="img"
                aria-label={`${t('trendTitle')} — ${productName}`}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={chartData}
                    margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
                    barCategoryGap={1}
                  >
                    <CartesianGrid stroke="#eef0ec" vertical={false} />
                    {missing.length ? (
                      <Bar
                        dataKey="gap"
                        fill={GAP}
                        fillOpacity={0.7}
                        isAnimationActive={false}
                        activeBar={false}
                      />
                    ) : null}
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                      tickLine={false}
                      axisLine={{ stroke: '#e5e7eb' }}
                      interval="preserveStartEnd"
                      minTickGap={8}
                    />
                    <YAxis
                      width={56}
                      domain={[lo, hi]}
                      ticks={ticks}
                      tickFormatter={(v: number) => `৳${formatNumber(v, locale, 0)}`}
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      content={<ChartTooltip locale={locale} />}
                      cursor={{ stroke: '#9ca3af', strokeDasharray: '3 3' }}
                    />
                    <Area
                      type="linear"
                      dataKey="band"
                      stroke="none"
                      fill={BAND}
                      fillOpacity={0.8}
                      connectNulls={false}
                      isAnimationActive={false}
                      activeDot={false}
                    />
                    <Line
                      type="linear"
                      dataKey="ref"
                      stroke={LINE}
                      strokeWidth={2}
                      connectNulls={false}
                      dot={{ r: 4, fill: LINE, stroke: '#fff', strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: LINE, stroke: '#fff', strokeWidth: 2 }}
                      isAnimationActive={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <p className="text-ink-muted p-6 text-center">{t('noHistory')}</p>
          )}
        </div>
      </section>

      {/* G. Price history table */}
      <section
        id={sectionIds.history}
        aria-labelledby={`${sectionIds.history}-h`}
        className="scroll-mt-24"
      >
        <h2 id={`${sectionIds.history}-h`} className="text-ink mb-4 text-2xl font-bold">
          {t('historyTitle')}
        </h2>
        <div className="border-border overflow-hidden rounded-2xl border bg-white">
          <div className="max-h-[28rem] overflow-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">
                {t('historyTitle')} — {marketLabel}
              </caption>
              <thead className="bg-muted text-ink-muted sticky top-0 text-xs">
                <tr>
                  <th scope="col" className="px-3 py-2.5 text-left font-semibold sm:px-4">
                    {t('month')}
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-right font-semibold sm:px-4">
                    {t('minimum')}
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-right font-semibold sm:px-4">
                    {t('maximum')}
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-right font-semibold sm:px-4">
                    {t('reference')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((r) => (
                  <tr
                    key={r.key}
                    className={cn(
                      'border-border border-t',
                      !r.observed && 'text-ink-muted bg-gray-50',
                    )}
                  >
                    <th scope="row" className="px-3 py-2.5 text-left font-medium sm:px-4">
                      <span className="flex flex-wrap items-center gap-1.5">
                        {formatMonthYear(r.month, r.year, locale)}
                        {r.isDemo ? (
                          <FlaskConical
                            className="size-3.5 text-amber-600"
                            aria-label={t('demoNote')}
                          />
                        ) : null}
                      </span>
                    </th>
                    {r.observed ? (
                      <>
                        <td className="tabular px-3 py-2.5 text-right sm:px-4">
                          ৳{formatNumber(r.min!, locale)}
                        </td>
                        <td className="tabular px-3 py-2.5 text-right sm:px-4">
                          ৳{formatNumber(r.max!, locale)}
                        </td>
                        <td className="tabular text-brand-dark px-3 py-2.5 text-right font-semibold sm:px-4">
                          ৳{formatNumber(r.ref!, locale)}
                        </td>
                      </>
                    ) : (
                      <td colSpan={3} className="px-3 py-2.5 text-right italic sm:px-4">
                        {t('notObservedRow')}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  )
}
