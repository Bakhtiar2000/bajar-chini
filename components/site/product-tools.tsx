'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { toast } from 'sonner'
import {
  BadgeCheck,
  Bell,
  BellRing,
  CalendarHeart,
  CircleCheck,
  ListPlus,
  ListChecks,
  Scale,
  TriangleAlert,
  RotateCcw,
} from 'lucide-react'
import { localizePath, type Locale } from '@/i18n/config'
import {
  formatMonthYear,
  formatNumber,
  formatPercent,
  formatPrice,
  formatPriceRange,
  monthName,
  pick,
} from '@/lib/format'
import { fairPriceVerdict, seasonalInsight, type FairPriceVerdict } from '@/lib/prices/calc'
import { useBajarList, useWatchlist } from '@/lib/client/saved'
import type { LatestPriceDTO, MarketPriceHistory } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

/** Histories that have a published latest price, default market first (server order). */
function priced(histories: MarketPriceHistory[]) {
  return histories.filter((h): h is MarketPriceHistory & { latest: LatestPriceDTO } =>
    Boolean(h.latest),
  )
}

// ---------------- Add to list / follow ----------------

export function ProductActions({ slug, latest }: { slug: string; latest: LatestPriceDTO | null }) {
  const t = useTranslations('tools')
  const locale = useLocale() as Locale
  const list = useBajarList()
  const watch = useWatchlist()
  const inList = list.items.some((i) => i.slug === slug)
  const following = watch.items.some((i) => i.slug === slug)

  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      {inList ? (
        <Button asChild variant="secondary">
          <Link href={localizePath(locale, '/list')}>
            <ListChecks /> {t('list.added')}
          </Link>
        </Button>
      ) : (
        <Button
          onClick={() => {
            list.add(slug)
            toast.success(t('list.addedToast'), {
              action: {
                label: t('list.title'),
                onClick: () => (window.location.href = localizePath(locale, '/list')),
              },
            })
          }}
        >
          <ListPlus /> {t('list.add')}
        </Button>
      )}
      <Button
        variant="outline"
        aria-pressed={following}
        onClick={() => {
          watch.toggle({
            slug,
            seenRef: latest?.referencePrice ?? null,
            seenYear: latest?.year ?? null,
            seenMonth: latest?.month ?? null,
          })
          if (!following) toast.success(t('watch.followToast'))
        }}
      >
        {following ? <BellRing className="text-brand" /> : <Bell />}
        {following ? t('watch.following') : t('watch.follow')}
      </Button>
    </div>
  )
}

// ---------------- Fair price checker ----------------

const VERDICT_STYLE: Record<FairPriceVerdict['verdict'], string> = {
  below: 'border-sky-200 bg-sky-50 text-sky-900',
  fair: 'border-green-200 bg-soft-green text-brand-dark',
  'slightly-high': 'border-amber-200 bg-amber-50 text-amber-900',
  high: 'border-red-200 bg-red-50 text-red-900',
}
const VERDICT_KEY = {
  below: 'below',
  fair: 'fair',
  'slightly-high': 'slightlyHigh',
  high: 'high',
} as const

/** Parses Bengali or Latin digits ("৩৫০", "350", "1,200"). */
export function parseAmount(value: string): number | null {
  const latin = value
    .replace(/[০-৯]/g, (d) => String('০১২৩৪৫৬৭৮৯'.indexOf(d)))
    .replace(/[,\s৳]/g, '')
  if (!/^\d+(\.\d+)?$/.test(latin)) return null
  const n = Number(latin)
  return Number.isFinite(n) && n > 0 ? n : null
}

export function FairPriceChecker({ histories }: { histories: MarketPriceHistory[] }) {
  const t = useTranslations('tools.fair')
  const locale = useLocale() as Locale
  const options = priced(histories)
  const [marketId, setMarketId] = useState(options[0]?.market.id ?? '')
  const [value, setValue] = useState('')
  const [checked, setChecked] = useState<number | null>(null)
  const history = options.find((h) => h.market.id === marketId) ?? options[0]

  if (!history) {
    return (
      <div className="border-border text-ink-muted rounded-2xl border border-dashed bg-white p-5">
        {t('noPrice')}
      </div>
    )
  }
  const latest = history.latest
  const result =
    checked !== null ? fairPriceVerdict(checked, latest.minimumPrice, latest.maximumPrice) : null

  return (
    <div className="border-border rounded-2xl border bg-white p-5 sm:p-6">
      <h3 className="text-ink flex items-center gap-2 text-lg font-semibold">
        <Scale className="text-brand size-5" aria-hidden /> {t('title')}
      </h3>
      <p className="text-ink-muted mt-1 text-sm">{t('subtitle')}</p>
      <form
        className="mt-4 flex flex-wrap items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          setChecked(parseAmount(value))
        }}
      >
        <label className="min-w-48 flex-1 space-y-1.5">
          <span className="text-ink text-sm font-medium">
            {t('label', { unit: pick(latest.unit, locale) })}
          </span>
          <Input
            inputMode="decimal"
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              setChecked(null)
            }}
            placeholder={t('placeholder')}
            aria-invalid={value !== '' && parseAmount(value) === null}
          />
        </label>
        {options.length > 1 ? (
          <select
            value={history.market.id}
            onChange={(e) => {
              setMarketId(e.target.value)
              setChecked(null)
            }}
            className="border-input h-10 rounded-lg border bg-white px-3 text-sm"
            aria-label={pick(history.market.name, locale)}
          >
            {options.map((h) => (
              <option key={h.market.id} value={h.market.id}>
                {pick(h.market.name, locale)}
              </option>
            ))}
          </select>
        ) : null}
        <Button type="submit" disabled={parseAmount(value) === null}>
          {t('check')}
        </Button>
      </form>

      {result && checked !== null ? (
        <div
          role="status"
          className={cn('mt-4 rounded-xl border p-4', VERDICT_STYLE[result.verdict])}
        >
          <p className="font-semibold">{t(VERDICT_KEY[result.verdict])}</p>
          <p className="mt-1 text-sm">
            {t('detail', {
              percent: formatPercent(result.percentFromReference, locale),
              ref: formatPrice(latest.referencePrice, locale),
            })}{' '}
            · {formatPriceRange(latest.minimumPrice, latest.maximumPrice, locale)} /{' '}
            {pick(latest.unit, locale)}
          </p>
        </div>
      ) : null}
      <p className="text-ink-muted mt-3 text-xs">
        {t('basedOn', {
          market: pick(history.market.name, locale),
          month: formatMonthYear(latest.month, latest.year, locale),
        })}
      </p>
    </div>
  )
}

// ---------------- Market comparison ----------------

export function MarketComparison({ histories }: { histories: MarketPriceHistory[] }) {
  const t = useTranslations('tools.compare')
  const locale = useLocale() as Locale
  const rows = priced(histories)
  if (rows.length < 2) return null
  const lowest = Math.min(...rows.map((r) => r.latest.referencePrice))

  return (
    <div className="border-border overflow-hidden rounded-2xl border bg-white">
      <div className="p-5 pb-3 sm:px-6">
        <h3 className="text-ink text-lg font-semibold">{t('title')}</h3>
        <p className="text-ink-muted text-sm">{t('subtitle')}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-ink-muted text-left text-xs">
            <tr>
              <th className="px-5 py-2 font-medium sm:px-6">{t('market')}</th>
              <th className="px-3 py-2 font-medium">{t('range')}</th>
              <th className="px-3 py-2 text-right font-medium">{t('reference')}</th>
              <th className="px-5 py-2 font-medium sm:px-6">{t('month')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((h) => {
              const isLowest = h.latest.referencePrice === lowest
              return (
                <tr key={h.market.id} className="border-border border-t">
                  <td className="text-ink px-5 py-3 font-medium sm:px-6">
                    {pick(h.market.name, locale)}
                    {h.market.area.bn || h.market.area.en ? (
                      <span className="text-ink-muted block text-xs font-normal">
                        {pick(h.market.area, locale)}
                      </span>
                    ) : null}
                  </td>
                  <td className="tabular px-3 py-3 whitespace-nowrap">
                    {formatPriceRange(h.latest.minimumPrice, h.latest.maximumPrice, locale)}{' '}
                    <span className="text-ink-muted">/ {pick(h.latest.unit, locale)}</span>
                  </td>
                  <td className="tabular px-3 py-3 text-right font-semibold whitespace-nowrap">
                    {formatPrice(h.latest.referencePrice, locale)}
                    {isLowest ? (
                      <span className="bg-soft-green text-brand ml-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium">
                        <BadgeCheck className="size-3" /> {t('lowest')}
                      </span>
                    ) : null}
                  </td>
                  <td className="text-ink-muted px-5 py-3 whitespace-nowrap sm:px-6">
                    {formatMonthYear(h.latest.month, h.latest.year, locale)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ---------------- Best time to buy ----------------

export function BestTimeToBuy({ histories }: { histories: MarketPriceHistory[] }) {
  const t = useTranslations('tools.season')
  const locale = useLocale() as Locale
  const history = histories[0]
  const records = useMemo(() => history?.records ?? [], [history])
  const insight = useMemo(() => seasonalInsight(records), [records])
  if (!history) return null

  const observed = insight.months.filter((m) => m.average !== null)
  const max = Math.max(1, ...observed.map((m) => m.average!))
  const min = Math.min(...observed.map((m) => m.average!))
  const names = (ms: number[]) => ms.map((m) => monthName(m, locale)).join(', ')

  return (
    <div className="space-y-4">
      <h3 className="text-ink flex items-center gap-2 text-lg font-semibold">
        <CalendarHeart className="text-brand size-5" aria-hidden /> {t('bestTime')}
      </h3>
      {insight.cheapestMonths.length ? (
        <>
          <dl className="grid gap-3 sm:grid-cols-2">
            <div className="bg-soft-green rounded-xl p-4">
              <dt className="text-ink-muted text-xs">{t('cheapest')}</dt>
              <dd className="text-brand-dark text-lg font-semibold">
                {names(insight.cheapestMonths)}
              </dd>
            </div>
            <div className="rounded-xl bg-amber-50 p-4">
              <dt className="text-ink-muted text-xs">{t('dearest')}</dt>
              <dd className="text-lg font-semibold text-amber-900">
                {names(insight.dearestMonths)}
              </dd>
            </div>
          </dl>
          <div>
            <p className="text-ink-muted mb-2 text-xs">{t('average')}</p>
            <ol className="grid h-28 grid-cols-12 items-end gap-1" aria-label={t('average')}>
              {insight.months.map((m) => {
                const h = m.average === null ? 0 : 20 + ((m.average - min) / (max - min || 1)) * 80
                const cheap = insight.cheapestMonths.includes(m.month)
                const dear = insight.dearestMonths.includes(m.month)
                return (
                  <li key={m.month} className="flex h-full flex-col items-center justify-end gap-1">
                    {m.average === null ? (
                      <span
                        className="w-full rounded-t border border-dashed border-gray-300 bg-gray-100"
                        style={{ height: '12%' }}
                        title={`${monthName(m.month, locale)}: —`}
                      />
                    ) : (
                      <span
                        className={cn(
                          'w-full rounded-t',
                          cheap ? 'bg-brand' : dear ? 'bg-amber-500' : 'bg-green-200',
                        )}
                        style={{ height: `${h}%` }}
                        title={`${monthName(m.month, locale)}: ${formatPrice(m.average, locale)}`}
                      />
                    )}
                    <span className="text-ink-muted text-[10px] leading-none">
                      {monthName(m.month, locale).slice(0, locale === 'bn' ? 3 : 3)}
                    </span>
                    <span className="sr-only">
                      {m.average === null ? '—' : formatPrice(m.average, locale)}
                    </span>
                  </li>
                )
              })}
            </ol>
          </div>
          <p className="text-ink-muted text-sm">
            {insight.swingPercent !== null
              ? t('swing', { percent: `${formatNumber(insight.swingPercent, locale, 0)}%` })
              : null}{' '}
            {t('basedOn', {
              count: formatNumber(records.length, locale),
              market: pick(history.market.name, locale),
            })}
          </p>
        </>
      ) : insight.steady ? (
        <p className="text-ink-muted text-sm">
          {t('steady')}{' '}
          {t('basedOn', {
            count: formatNumber(records.length, locale),
            market: pick(history.market.name, locale),
          })}
        </p>
      ) : (
        <p className="text-ink-muted text-sm">{t('notEnough')}</p>
      )}
    </div>
  )
}

// ---------------- Interactive quality checklist ----------------

function CheckItem({
  text,
  on,
  onClick,
  tone,
}: {
  text: string
  on: boolean
  onClick: () => void
  tone: 'good' | 'warn'
}) {
  return (
    <li>
      <button
        type="button"
        role="checkbox"
        aria-checked={on}
        onClick={onClick}
        className={cn(
          'flex w-full gap-3 rounded-xl border bg-white p-4 text-left transition-colors',
          on
            ? tone === 'good'
              ? 'border-brand bg-soft-green'
              : 'border-amber-400 bg-amber-50'
            : 'border-border hover:border-brand/50',
        )}
      >
        {tone === 'good' ? (
          <CircleCheck
            className={cn('mt-0.5 size-5 shrink-0', on ? 'text-brand' : 'text-gray-300')}
            aria-hidden
          />
        ) : (
          <TriangleAlert
            className={cn('mt-0.5 size-5 shrink-0', on ? 'text-amber-600' : 'text-gray-300')}
            aria-hidden
          />
        )}
        <span className="text-ink leading-relaxed">{text}</span>
      </button>
    </li>
  )
}

export function QualityChecklist({
  good,
  warn,
  goodTitle,
  warnTitle,
  notAvailable,
  warnNote,
  ids,
}: {
  good: string[]
  warn: string[]
  goodTitle: string
  warnTitle: string
  notAvailable: string
  warnNote: string
  ids: { quality: string; warning: string }
}) {
  const t = useTranslations('tools.checklist')
  const locale = useLocale() as Locale
  const [goodOn, setGoodOn] = useState<Set<number>>(new Set())
  const [warnOn, setWarnOn] = useState<Set<number>>(new Set())
  const touched = goodOn.size + warnOn.size > 0

  const toggle = (set: Set<number>, i: number) => {
    const next = new Set(set)
    if (next.has(i)) next.delete(i)
    else next.add(i)
    return next
  }

  return (
    <>
      <section id={ids.quality} aria-labelledby="quality-h" className="scroll-mt-24">
        <h2 id="quality-h" className="text-ink mb-1 flex items-center gap-2 text-2xl font-bold">
          <CircleCheck className="text-brand size-6" aria-hidden />
          {goodTitle}
        </h2>
        {good.length || warn.length ? (
          <p className="text-ink-muted mb-4 text-sm print:hidden">{t('hint')}</p>
        ) : null}
        {good.length ? (
          <ul className="grid gap-3 md:grid-cols-2">
            {good.map((item, i) => (
              <CheckItem
                key={i}
                text={item}
                tone="good"
                on={goodOn.has(i)}
                onClick={() => setGoodOn((s) => toggle(s, i))}
              />
            ))}
          </ul>
        ) : (
          <p className="text-ink-muted">{notAvailable}</p>
        )}
      </section>

      <section id={ids.warning} aria-labelledby="warning-h" className="scroll-mt-24">
        <h2 id="warning-h" className="text-ink mb-4 flex items-center gap-2 text-2xl font-bold">
          <TriangleAlert className="size-6 text-amber-600" aria-hidden />
          {warnTitle}
        </h2>
        {warn.length ? (
          <ul className="grid gap-3 md:grid-cols-2">
            {warn.map((item, i) => (
              <CheckItem
                key={i}
                text={item}
                tone="warn"
                on={warnOn.has(i)}
                onClick={() => setWarnOn((s) => toggle(s, i))}
              />
            ))}
          </ul>
        ) : (
          <p className="text-ink-muted">{notAvailable}</p>
        )}
        <p className="text-ink-muted mt-3 text-sm">{warnNote}</p>

        {touched ? (
          <div
            role="status"
            className={cn(
              'sticky bottom-3 z-10 mt-4 flex flex-wrap items-center gap-3 rounded-xl border p-4 shadow-lg',
              warnOn.size ? 'border-amber-300 bg-amber-50' : 'bg-soft-green border-green-200',
            )}
          >
            <div className="flex-1 text-sm">
              <p className="text-ink font-semibold">
                {warnOn.size
                  ? t('verdictWarn')
                  : goodOn.size >= Math.ceil(good.length / 2)
                    ? t('verdictGood')
                    : t('progress', {
                        done: formatNumber(goodOn.size, locale),
                        total: formatNumber(good.length, locale),
                      })}
              </p>
              <p className="text-ink-muted">
                {t('progress', {
                  done: formatNumber(goodOn.size, locale),
                  total: formatNumber(good.length, locale),
                })}
                {warnOn.size
                  ? ` · ${t('warnProgress', { count: formatNumber(warnOn.size, locale) })}`
                  : ''}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setGoodOn(new Set())
                setWarnOn(new Set())
              }}
            >
              <RotateCcw /> {t('reset')}
            </Button>
          </div>
        ) : null}
      </section>
    </>
  )
}
