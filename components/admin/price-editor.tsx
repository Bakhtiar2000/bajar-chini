'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  CircleAlert,
  CircleCheck,
  CircleDashed,
  CopyPlus,
  Eye,
  EyeOff,
  FlaskConical,
  Loader2,
  PencilLine,
  RefreshCw,
  Save,
  Search,
  Send,
  TriangleAlert,
} from 'lucide-react'
import { api, errorMessage } from '@/lib/client-api'
import { calculateReferencePrice, isUnusualChange } from '@/lib/prices/calc'
import { UNITS, UNIT_KEYS } from '@/lib/units'
import { formatMonthYear, toDateInputValue } from '@/lib/format'
import type { CategoryRef, MarketDTO, PriceRecordDTO } from '@/lib/types'
import type { MonthlyRow } from '@/lib/services/prices'
import { Button } from '@/components/ui/button'
import { Input, NativeSelect } from '@/components/ui/input'
import { Badge, Label } from '@/components/ui/misc'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

type Sheet = {
  market: MarketDTO
  month: number
  year: number
  previousPeriod: { year: number; month: number }
  rows: MonthlyRow[]
  summary: {
    totalProducts: number
    entered: number
    draft: number
    published: number
    missing: number
  }
  categories: CategoryRef[]
}

type Draft = { min: string; max: string; unitKey: string; notes: string }
type RowState = 'not-entered' | 'unchanged' | 'updated' | 'invalid'

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)

function initialDraft(row: MonthlyRow): Draft {
  // A missing observation stays empty — the previous month's value is never copied automatically.
  return row.current
    ? {
        min: String(row.current.minimumPrice),
        max: String(row.current.maximumPrice),
        unitKey: row.current.unit.key,
        notes: row.current.notes ?? '',
      }
    : { min: '', max: '', unitKey: row.product.defaultUnit.key, notes: '' }
}

function parsePrice(v: string): number | null {
  if (v.trim() === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : NaN
}

function evaluate(
  row: MonthlyRow,
  d: Draft,
): { state: RowState; error?: string; warning?: string; ref?: number } {
  const min = parsePrice(d.min)
  const max = parsePrice(d.max)
  if (min === null && max === null) {
    return row.current
      ? {
          state: 'invalid',
          error: 'Saved record cannot be cleared here — use History to correct it',
        }
      : { state: 'not-entered' }
  }
  if (min === null || max === null)
    return { state: 'invalid', error: 'Enter both minimum and maximum' }
  if (Number.isNaN(min) || Number.isNaN(max))
    return { state: 'invalid', error: 'Prices must be numbers' }
  if (min < 0 || max < 0) return { state: 'invalid', error: 'Prices cannot be negative' }
  if (min > max) return { state: 'invalid', error: 'Minimum exceeds maximum' }
  const ref = calculateReferencePrice(min, max)
  const warning =
    row.previous && isUnusualChange(row.previous.referencePrice, ref)
      ? `Changed ${Math.round(((ref - row.previous.referencePrice) / row.previous.referencePrice) * 100)}% vs previous month`
      : undefined
  const c = row.current
  const unchanged =
    c &&
    c.minimumPrice === min &&
    c.maximumPrice === max &&
    c.unit.key === d.unitKey &&
    (c.notes ?? '') === d.notes
  return { state: unchanged ? 'unchanged' : 'updated', warning, ref }
}

const STATE_BADGE: Record<
  RowState,
  {
    label: string
    variant: 'secondary' | 'muted' | 'warning' | 'destructive' | 'info'
    icon: typeof CircleCheck
  }
> = {
  'not-entered': { label: 'Not entered', variant: 'muted', icon: CircleDashed },
  unchanged: { label: 'Unchanged', variant: 'secondary', icon: CircleCheck },
  updated: { label: 'Updated', variant: 'info', icon: PencilLine },
  invalid: { label: 'Invalid', variant: 'destructive', icon: CircleAlert },
}

function StatusBadges({ row, ev }: { row: MonthlyRow; ev: ReturnType<typeof evaluate> }) {
  const s = STATE_BADGE[ev.state]
  const Icon = s.icon
  return (
    <div className="flex flex-wrap items-center gap-1">
      <Badge variant={s.variant} title={ev.error}>
        <Icon /> {s.label}
      </Badge>
      {row.current ? (
        <Badge variant={row.current.status === 'PUBLISHED' ? 'default' : 'outline'}>
          {row.current.status === 'PUBLISHED' ? 'Published' : 'Draft'}
        </Badge>
      ) : null}
      {row.current?.isDemo ? (
        <Badge variant="demo">
          <FlaskConical /> Demo
        </Badge>
      ) : null}
      {ev.warning ? (
        <Badge variant="warning" title={ev.warning}>
          <TriangleAlert /> {ev.warning.replace('Changed ', '').replace(' vs previous month', '')}
        </Badge>
      ) : null}
    </div>
  )
}

function prevLabel(p: PriceRecordDTO | null) {
  if (!p) return '—'
  return `${p.minimumPrice}–${p.maximumPrice} / ${p.unit.en}${p.status === 'DRAFT' ? ' (draft)' : ''}`
}

export function PriceEditor({
  markets,
  now,
}: {
  markets: MarketDTO[]
  now: { year: number; month: number }
}) {
  const defaultMarket = markets.find((m) => m.isDefaultReferenceMarket) ?? markets[0]
  const [marketId, setMarketId] = useState(defaultMarket?.id ?? '')
  const [month, setMonth] = useState(now.month)
  const [year, setYear] = useState(now.year)
  const [observedAt, setObservedAt] = useState(toDateInputValue(new Date()))
  const [sheet, setSheet] = useState<Sheet | null>(null)
  const [drafts, setDrafts] = useState<Record<string, Draft>>({})
  const [saving, setSaving] = useState(false)
  const [q, setQ] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [stateFilter, setStateFilter] = useState<'all' | RowState | 'warnings'>('all')
  const [reviewOpen, setReviewOpen] = useState(false)
  const [publishOpen, setPublishOpen] = useState<null | 'publish' | 'unpublish'>(null)
  const tableRef = useRef<HTMLDivElement>(null)

  const years = useMemo(() => Array.from({ length: 6 }, (_, i) => now.year - 5 + i), [now.year])
  const isFutureMonth = year * 12 + month > now.year * 12 + now.month

  // Loading is derived: the sheet key changes, the fetch callback records what it loaded.
  const [reloadToken, setReloadToken] = useState(0)
  const sheetKey = `${marketId}|${month}|${year}|${reloadToken}`
  const [loadedKey, setLoadedKey] = useState('')
  const loading = Boolean(marketId) && loadedKey !== sheetKey

  useEffect(() => {
    if (!marketId) return
    let cancelled = false
    const key = `${marketId}|${month}|${year}|${reloadToken}`
    api<Sheet>(`/api/admin/prices/monthly?marketId=${marketId}&month=${month}&year=${year}`)
      .then((data) => {
        if (cancelled) return
        setSheet(data)
        setDrafts(Object.fromEntries(data.rows.map((r) => [r.product.id, initialDraft(r)])))
        setLoadedKey(key)
      })
      .catch((error) => {
        if (cancelled) return
        toast.error(errorMessage(error))
        setLoadedKey(key)
      })
    return () => {
      cancelled = true
    }
  }, [marketId, month, year, reloadToken])

  const load = useCallback(() => setReloadToken((t) => t + 1), [])

  /** Changing the period also resets the observation date to a valid day in that month. */
  const changePeriod = (m: number, y: number) => {
    setMonth(m)
    setYear(y)
    const isCurrent = y === now.year && m === now.month
    setObservedAt(
      isCurrent ? toDateInputValue(new Date()) : `${y}-${String(m).padStart(2, '0')}-01`,
    )
  }

  const evaluated = useMemo(() => {
    if (!sheet) return []
    return sheet.rows.map((row) => {
      const d = drafts[row.product.id] ?? initialDraft(row)
      return { row, draft: d, ev: evaluate(row, d) }
    })
  }, [sheet, drafts])

  const visible = useMemo(() => {
    const needle = q.trim().normalize('NFC').toLowerCase()
    return evaluated.filter(({ row, ev }) => {
      if (categoryId && row.product.category?.id !== categoryId) return false
      if (
        needle &&
        !`${row.product.name.bn} ${row.product.name.en}`
          .normalize('NFC')
          .toLowerCase()
          .includes(needle)
      )
        return false
      if (stateFilter === 'warnings') return Boolean(ev.warning)
      if (stateFilter !== 'all' && ev.state !== stateFilter) return false
      return true
    })
  }, [evaluated, q, categoryId, stateFilter])

  const dirty = evaluated.filter((e) => e.ev.state === 'updated')
  const invalid = evaluated.filter((e) => e.ev.state === 'invalid')
  const counts = useMemo(() => {
    const c = { 'not-entered': 0, unchanged: 0, updated: 0, invalid: 0, warnings: 0 }
    for (const e of evaluated) {
      c[e.ev.state]++
      if (e.ev.warning) c.warnings++
    }
    return c
  }, [evaluated])

  // Warn before leaving with unsaved edits
  useEffect(() => {
    if (!dirty.length) return
    const handler = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty.length])

  const update = (productId: string, patch: Partial<Draft>) =>
    setDrafts((prev) => ({ ...prev, [productId]: { ...prev[productId], ...patch } }))

  /** Keyboard grid navigation: Enter / ↓ moves down a row, ↑ moves up, in the same column. */
  const onGridKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const { row, col } = (e.currentTarget as HTMLInputElement).dataset
    if (!row || !col) return
    let delta = 0
    if (e.key === 'Enter' || e.key === 'ArrowDown') delta = 1
    else if (e.key === 'ArrowUp') delta = -1
    else return
    e.preventDefault()
    const next = tableRef.current?.querySelector<HTMLInputElement>(
      `input[data-row="${Number(row) + delta}"][data-col="${col}"]`,
    )
    next?.focus()
    next?.select()
  }

  const save = async () => {
    if (!sheet || !dirty.length) return
    setSaving(true)
    try {
      const result = await api<{
        saved: number
        inserted: number
        updated: number
        errors: { productId?: string; message: string }[]
        touchedPublished: boolean
      }>('/api/admin/prices/bulk', {
        method: 'POST',
        json: {
          marketId,
          month,
          year,
          observedAt,
          entries: dirty.map(({ row, draft }) => ({
            productId: row.product.id,
            minimumPrice: Number(draft.min),
            maximumPrice: Number(draft.max),
            unitKey: draft.unitKey,
            notes: draft.notes || undefined,
          })),
        },
      })
      toast.success(
        `Saved ${result.saved} observation(s)${result.touchedPublished ? ' — published corrections are live' : ' as draft'}`,
      )
      if (result.errors.length)
        toast.error(`${result.errors.length} row(s) rejected: ${result.errors[0].message}`)
      setReviewOpen(false)
      load()
    } catch (error) {
      toast.error(errorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  const publish = async (action: 'publish' | 'unpublish') => {
    try {
      const res = await api<{ modified: number }>('/api/admin/prices/publish', {
        method: 'POST',
        json: { marketId, month, year, action },
      })
      toast.success(
        `${action === 'publish' ? 'Published' : 'Unpublished'} ${res.modified} record(s). Public pages refreshed.`,
      )
      setPublishOpen(null)
      load()
    } catch (error) {
      toast.error(errorMessage(error))
    }
  }

  const periodLabel = formatMonthYear(month, year, 'en')
  const prevPeriodLabel = sheet
    ? formatMonthYear(sheet.previousPeriod.month, sheet.previousPeriod.year, 'en')
    : ''

  if (!markets.length) {
    return (
      <p className="text-ink-muted rounded-xl border border-dashed bg-white p-6">
        Create a market first (Admin → Markets).
      </p>
    )
  }

  const priceInput = (
    rowIndex: number,
    col: 'min' | 'max',
    productId: string,
    value: string,
    invalidRow: boolean,
    label: string,
    gridPrefix = '',
  ) => (
    <Input
      type="number"
      inputMode="decimal"
      min={0}
      step="any"
      value={value}
      data-row={rowIndex}
      data-col={`${gridPrefix}${col}`}
      onKeyDown={onGridKey}
      onChange={(e) => update(productId, { [col]: e.target.value })}
      aria-label={label}
      aria-invalid={invalidRow}
      className="tabular h-9 text-right"
      placeholder="—"
    />
  )

  return (
    <div className="space-y-4">
      {/* Period selection */}
      <div className="border-border grid gap-3 rounded-2xl border bg-white p-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1.2fr_auto]">
        <div className="space-y-1.5">
          <Label htmlFor="pe-market">Market</Label>
          <NativeSelect
            id="pe-market"
            value={marketId}
            onChange={(e) => setMarketId(e.target.value)}
          >
            {markets.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name.en} — {m.name.bn}
                {m.isDefaultReferenceMarket ? ' (default)' : ''}
                {!m.isActive ? ' [inactive]' : ''}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pe-month">Month</Label>
          <NativeSelect
            id="pe-month"
            value={month}
            onChange={(e) => changePeriod(Number(e.target.value), year)}
          >
            {MONTHS.map((m) => (
              <option key={m} value={m}>
                {formatMonthYear(m, year, 'en').split(' ')[0]}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pe-year">Year</Label>
          <NativeSelect
            id="pe-year"
            value={year}
            onChange={(e) => changePeriod(month, Number(e.target.value))}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pe-date">Observation date</Label>
          <Input
            id="pe-date"
            type="date"
            value={observedAt}
            min={`${year}-${String(month).padStart(2, '0')}-01`}
            max={toDateInputValue(new Date())}
            onChange={(e) => setObservedAt(e.target.value)}
          />
        </div>
        <div className="flex items-end">
          <Button
            variant="outline"
            onClick={() => void load()}
            disabled={loading}
            className="w-full"
          >
            <RefreshCw className={cn(loading && 'animate-spin')} /> Reload
          </Button>
        </div>
      </div>

      {isFutureMonth ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          {periodLabel} is in the future. Observations can only be saved once they have actually
          been made.
        </p>
      ) : null}

      {sheet ? (
        <>
          {/* Summary + publication */}
          <div className="border-border flex flex-wrap items-center gap-2 rounded-2xl border bg-white p-3 text-sm">
            <span className="text-ink font-semibold">{periodLabel}</span>
            <Badge variant="muted">{sheet.summary.totalProducts} products</Badge>
            <Badge variant="secondary">{sheet.summary.published} published</Badge>
            <Badge variant="outline">{sheet.summary.draft} draft</Badge>
            <Badge variant="muted">{sheet.summary.missing} not entered</Badge>
            <div className="ml-auto flex flex-wrap gap-2">
              {sheet.summary.published > 0 ? (
                <Button size="sm" variant="ghost" onClick={() => setPublishOpen('unpublish')}>
                  <EyeOff /> Unpublish month
                </Button>
              ) : null}
              <Button
                size="sm"
                variant="secondary"
                disabled={!sheet.summary.draft || dirty.length > 0}
                onClick={() => setPublishOpen('publish')}
                title={dirty.length ? 'Save your changes first' : undefined}
              >
                <Send /> Publish {sheet.summary.draft} draft(s)
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-52 flex-1">
              <Search className="text-ink-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search products (বাংলা / English)"
                className="pl-9"
                aria-label="Search products"
              />
            </div>
            <NativeSelect
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-auto"
              aria-label="Filter by category"
            >
              <option value="">All categories</option>
              {sheet.categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name.en} — {c.name.bn}
                </option>
              ))}
            </NativeSelect>
            <NativeSelect
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value as typeof stateFilter)}
              className="w-auto"
              aria-label="Filter by status"
            >
              <option value="all">All statuses ({evaluated.length})</option>
              <option value="updated">Updated ({counts.updated})</option>
              <option value="unchanged">Unchanged ({counts.unchanged})</option>
              <option value="not-entered">Not entered ({counts['not-entered']})</option>
              <option value="invalid">Invalid ({counts.invalid})</option>
              <option value="warnings">Unusual change ({counts.warnings})</option>
            </NativeSelect>
          </div>

          <div ref={tableRef}>
            {/* Desktop: inline-editing table */}
            <div className="border-border hidden overflow-hidden rounded-2xl border bg-white md:block">
              <div className="max-h-[65vh] overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted text-ink-muted sticky top-0 z-10 text-xs">
                    <tr>
                      <th className="px-3 py-2.5 text-left font-semibold">Product</th>
                      <th className="px-3 py-2.5 text-left font-semibold whitespace-nowrap">
                        Previous ({prevPeriodLabel})
                      </th>
                      <th className="w-28 px-2 py-2.5 text-right font-semibold">New min ৳</th>
                      <th className="w-28 px-2 py-2.5 text-right font-semibold">New max ৳</th>
                      <th className="w-32 px-2 py-2.5 text-left font-semibold">Unit</th>
                      <th className="px-2 py-2.5 text-left font-semibold">Notes</th>
                      <th className="px-3 py-2.5 text-left font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map(({ row, draft, ev }, i) => (
                      <tr
                        key={row.product.id}
                        className={cn(
                          'border-border border-t align-top',
                          ev.state === 'updated' && 'bg-sky-50/60',
                          ev.state === 'invalid' && 'bg-red-50/60',
                        )}
                      >
                        <td className="px-3 py-2">
                          <p className="text-ink font-medium">{row.product.name.bn}</p>
                          <p className="text-ink-muted text-xs">
                            {row.product.name.en}
                            {row.product.category ? ` · ${row.product.category.name.en}` : ''}
                          </p>
                        </td>
                        <td className="text-ink-muted px-3 py-2 whitespace-nowrap">
                          <span className="tabular">{prevLabel(row.previous)}</span>
                          {row.previous && !row.current && !draft.min && !draft.max ? (
                            <button
                              type="button"
                              className="text-brand hover:bg-soft-green ml-1.5 inline-flex rounded p-0.5"
                              title="Copy previous month's values into this row (you must still review and save)"
                              aria-label={`Copy previous values for ${row.product.name.en}`}
                              onClick={() =>
                                update(row.product.id, {
                                  min: String(row.previous!.minimumPrice),
                                  max: String(row.previous!.maximumPrice),
                                  unitKey: row.previous!.unit.key,
                                })
                              }
                            >
                              <CopyPlus className="size-3.5" />
                            </button>
                          ) : null}
                        </td>
                        <td className="px-2 py-2">
                          {priceInput(
                            i,
                            'min',
                            row.product.id,
                            draft.min,
                            ev.state === 'invalid',
                            `Minimum price for ${row.product.name.en}`,
                          )}
                        </td>
                        <td className="px-2 py-2">
                          {priceInput(
                            i,
                            'max',
                            row.product.id,
                            draft.max,
                            ev.state === 'invalid',
                            `Maximum price for ${row.product.name.en}`,
                          )}
                        </td>
                        <td className="px-2 py-2">
                          <NativeSelect
                            value={draft.unitKey}
                            onChange={(e) => update(row.product.id, { unitKey: e.target.value })}
                            className="h-9"
                            aria-label={`Unit for ${row.product.name.en}`}
                          >
                            {UNIT_KEYS.map((k) => (
                              <option key={k} value={k}>
                                {UNITS[k].en}
                              </option>
                            ))}
                          </NativeSelect>
                        </td>
                        <td className="px-2 py-2">
                          <Input
                            value={draft.notes}
                            data-row={i}
                            data-col="notes"
                            onKeyDown={onGridKey}
                            onChange={(e) => update(row.product.id, { notes: e.target.value })}
                            className="h-9 min-w-32"
                            placeholder="Optional"
                            aria-label={`Notes for ${row.product.name.en}`}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <StatusBadges row={row} ev={ev} />
                          {ev.error ? (
                            <p className="text-destructive mt-1 text-xs">{ev.error}</p>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!visible.length ? (
                  <p className="text-ink-muted p-6 text-center">No products match these filters.</p>
                ) : null}
              </div>
            </div>

            {/* Mobile: one card per product */}
            <ul className="space-y-3 md:hidden">
              {visible.map(({ row, draft, ev }, i) => (
                <li
                  key={row.product.id}
                  className={cn(
                    'border-border rounded-xl border bg-white p-3',
                    ev.state === 'updated' && 'border-sky-300',
                    ev.state === 'invalid' && 'border-red-300',
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-ink font-medium">{row.product.name.bn}</p>
                      <p className="text-ink-muted text-xs">{row.product.name.en}</p>
                    </div>
                    <StatusBadges row={row} ev={ev} />
                  </div>
                  <p className="text-ink-muted mt-1 text-xs">
                    Previous: <span className="tabular">{prevLabel(row.previous)}</span>
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <label className="text-ink-muted space-y-1 text-xs">
                      Min ৳
                      {priceInput(
                        i,
                        'min',
                        row.product.id,
                        draft.min,
                        ev.state === 'invalid',
                        `Minimum price for ${row.product.name.en}`,
                        'm-',
                      )}
                    </label>
                    <label className="text-ink-muted space-y-1 text-xs">
                      Max ৳
                      {priceInput(
                        i,
                        'max',
                        row.product.id,
                        draft.max,
                        ev.state === 'invalid',
                        `Maximum price for ${row.product.name.en}`,
                        'm-',
                      )}
                    </label>
                    <NativeSelect
                      value={draft.unitKey}
                      onChange={(e) => update(row.product.id, { unitKey: e.target.value })}
                      className="h-9"
                      aria-label="Unit"
                    >
                      {UNIT_KEYS.map((k) => (
                        <option key={k} value={k}>
                          {UNITS[k].en}
                        </option>
                      ))}
                    </NativeSelect>
                    <Input
                      value={draft.notes}
                      onChange={(e) => update(row.product.id, { notes: e.target.value })}
                      className="h-9"
                      placeholder="Notes"
                      aria-label="Notes"
                    />
                  </div>
                  {ev.error ? <p className="text-destructive mt-1 text-xs">{ev.error}</p> : null}
                </li>
              ))}
            </ul>
          </div>

          {/* Sticky action bar */}
          <div className="border-border sticky bottom-0 z-20 -mx-4 flex flex-wrap items-center gap-3 border-t bg-white/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border">
            <p className="text-ink-muted text-sm">
              <strong className="text-ink">{dirty.length}</strong> change(s) ready
              {invalid.length ? (
                <span className="text-destructive">
                  {' '}
                  · {invalid.length} invalid row(s) will be skipped
                </span>
              ) : null}
            </p>
            <div className="ml-auto flex gap-2">
              <Button
                variant="ghost"
                disabled={!dirty.length && !invalid.length}
                onClick={() =>
                  sheet &&
                  setDrafts(
                    Object.fromEntries(sheet.rows.map((r) => [r.product.id, initialDraft(r)])),
                  )
                }
              >
                Discard
              </Button>
              <Button disabled={!dirty.length || isFutureMonth} onClick={() => setReviewOpen(true)}>
                <Eye /> Review &amp; save
              </Button>
            </div>
          </div>
        </>
      ) : loading ? (
        <div className="text-ink-muted flex items-center justify-center gap-2 rounded-2xl border bg-white p-10">
          <Loader2 className="size-5 animate-spin" /> Loading products…
        </div>
      ) : null}

      {/* Review dialog */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review {dirty.length} change(s)</DialogTitle>
            <DialogDescription>
              {sheet?.market.name.en} · {periodLabel} · observed on {observedAt}. New records are
              saved as <strong>drafts</strong>; corrections to already-published records go live
              immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[50vh] overflow-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted text-ink-muted sticky top-0 text-xs">
                <tr>
                  <th className="px-3 py-2 text-left">Product</th>
                  <th className="px-3 py-2 text-left">Before</th>
                  <th className="px-3 py-2 text-left">After</th>
                  <th className="px-3 py-2 text-right">Ref.</th>
                </tr>
              </thead>
              <tbody>
                {dirty.map(({ row, draft, ev }) => (
                  <tr key={row.product.id} className="border-t">
                    <td className="px-3 py-2">
                      {row.product.name.bn}
                      {ev.warning ? (
                        <span className="ml-1 inline-flex items-center gap-0.5 text-xs text-amber-700">
                          <TriangleAlert className="size-3" /> {ev.warning}
                        </span>
                      ) : null}
                    </td>
                    <td className="tabular text-ink-muted px-3 py-2">
                      {row.current
                        ? prevLabel(row.current)
                        : `new (prev: ${prevLabel(row.previous)})`}
                    </td>
                    <td className="tabular px-3 py-2 font-medium">
                      {draft.min}–{draft.max} / {UNITS[draft.unitKey as keyof typeof UNITS]?.en}
                    </td>
                    <td className="tabular px-3 py-2 text-right">{ev.ref}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {counts.warnings ? (
            <p className="flex items-center gap-2 text-sm text-amber-800">
              <TriangleAlert className="size-4" /> Some prices changed by more than 30% compared
              with the previous month. Double-check them.
            </p>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewOpen(false)}>
              Back to editing
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? <Loader2 className="animate-spin" /> : <Save />} Save {dirty.length}{' '}
              observation(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Publish dialog */}
      <Dialog open={publishOpen !== null} onOpenChange={(o) => !o && setPublishOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {publishOpen === 'publish' ? `Publish ${periodLabel}?` : `Unpublish ${periodLabel}?`}
            </DialogTitle>
            <DialogDescription>
              {publishOpen === 'publish'
                ? `${sheet?.summary.draft ?? 0} draft observation(s) for ${sheet?.market.name.en} will become publicly visible and public pages will refresh.`
                : `All published observations for ${periodLabel} at ${sheet?.market.name.en} will be hidden from the public site (kept as drafts).`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPublishOpen(null)}>
              Cancel
            </Button>
            <Button
              variant={publishOpen === 'unpublish' ? 'destructive' : 'default'}
              onClick={() => publishOpen && publish(publishOpen)}
            >
              {publishOpen === 'publish' ? 'Publish' : 'Unpublish'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
