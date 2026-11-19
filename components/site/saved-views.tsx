'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { toast } from 'sonner'
import {
  ArrowDownRight,
  ArrowUpRight,
  BellOff,
  Check,
  Eye,
  ListChecks,
  Minus,
  Plus,
  Printer,
  Share2,
  Trash2,
} from 'lucide-react'
import { localizePath, type Locale } from '@/i18n/config'
import {
  formatMonthYear,
  formatNumber,
  formatPercent,
  formatPrice,
  formatPriceRange,
  pick,
} from '@/lib/format'
import {
  decodeList,
  encodeList,
  useBajarList,
  useWatchlist,
  type BajarListItem,
} from '@/lib/client/saved'
import type { ProductCardDTO } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { parseAmount } from './product-tools'

/** Loads product cards (with latest prices) for a set of slugs. */
function useCards(slugs: string[]) {
  const key = [...slugs].sort().join(',')
  const [state, setState] = useState<{ key: string; cards: ProductCardDTO[] } | null>(null)
  useEffect(() => {
    if (!key) return
    const controller = new AbortController()
    fetch(`/api/products?slugs=${encodeURIComponent(key)}`, { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((json: { data: { items: ProductCardDTO[] } }) =>
        setState({ key, cards: json.data.items }),
      )
      .catch((e: Error) => {
        if (e.name !== 'AbortError') setState({ key, cards: [] })
      })
    return () => controller.abort()
  }, [key])
  const loading = Boolean(key) && state?.key !== key
  const bySlug = useMemo(() => new Map((state?.cards ?? []).map((c) => [c.slug, c])), [state])
  return { loading, bySlug }
}

function EmptyState({ title, hint }: { title: string; hint: string }) {
  const t = useTranslations('tools.list')
  const locale = useLocale() as Locale
  return (
    <div className="border-border flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-white px-6 py-14 text-center">
      <ListChecks className="text-ink-muted size-10" />
      <p className="text-ink text-lg font-medium">{title}</p>
      <p className="text-ink-muted">{hint}</p>
      <Button asChild>
        <Link href={localizePath(locale, '/products')}>{t('browse')}</Link>
      </Button>
    </div>
  )
}

// ---------------- Bajar list ----------------

export function BajarListView() {
  const t = useTranslations('tools.list')
  const locale = useLocale() as Locale
  const params = useSearchParams()
  const list = useBajarList()
  const shared = useMemo(() => decodeList(params.get('items')), [params])
  const [dismissed, setDismissed] = useState(false)
  const showShared = shared.length > 0 && !dismissed

  const slugs = useMemo(
    () => [...new Set([...list.items, ...(showShared ? shared : [])].map((i) => i.slug))],
    [list.items, shared, showShared],
  )
  const { loading, bySlug } = useCards(slugs)

  const totals = useMemo(() => {
    let min = 0
    let max = 0
    let ref = 0
    let missing = 0
    for (const item of list.items) {
      const p = bySlug.get(item.slug)?.latestPrice
      if (!p) {
        missing++
        continue
      }
      min += p.minimumPrice * item.qty
      max += p.maximumPrice * item.qty
      ref += p.referencePrice * item.qty
    }
    return { min, max, ref, missing }
  }, [list.items, bySlug])

  const shareUrl = () => {
    const url = new URL(window.location.href)
    url.search = `?items=${encodeList(list.items)}`
    return url.toString()
  }

  const share = async () => {
    const url = shareUrl()
    try {
      if (navigator.share) {
        await navigator.share({ title: t('title'), url })
        return
      }
      await navigator.clipboard.writeText(url)
      toast.success(t('copied'))
    } catch {
      // user cancelled the share sheet / clipboard blocked
    }
  }

  return (
    <div className="space-y-6">
      {showShared ? (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-sky-200 bg-sky-50 p-4 print:hidden">
          <p className="flex-1 font-medium text-sky-900">
            {t('sharedTitle')} ({formatNumber(shared.length, locale)})
          </p>
          <Button
            onClick={() => {
              list.replace(shared)
              setDismissed(true)
            }}
          >
            {t('useShared')}
          </Button>
          <Button variant="outline" onClick={() => setDismissed(true)}>
            {t('dismiss')}
          </Button>
        </div>
      ) : null}

      {!list.items.length ? (
        <EmptyState title={t('empty')} hint={t('emptyHint')} />
      ) : (
        <>
          <ul className="border-border divide-border divide-y overflow-hidden rounded-2xl border bg-white">
            {list.items.map((item) => (
              <ListRow
                key={item.slug}
                item={item}
                card={bySlug.get(item.slug)}
                loading={loading}
                onQty={(q) => list.setQty(item.slug, q)}
                onRemove={() => list.remove(item.slug)}
              />
            ))}
          </ul>

          <div className="border-border bg-soft-green rounded-2xl border p-5 sm:p-6">
            <p className="text-ink-muted text-sm">{t('total')}</p>
            <p className="tabular text-brand-dark mt-1 text-3xl font-bold sm:text-4xl">
              {loading ? '…' : formatPrice(Math.round(totals.ref), locale)}
            </p>
            {!loading && totals.max > 0 ? (
              <p className="tabular text-ink mt-1">
                {formatPriceRange(Math.round(totals.min), Math.round(totals.max), locale)}
              </p>
            ) : null}
            <p className="text-ink-muted mt-2 text-xs">{t('totalHint')}</p>
            {!loading && totals.missing ? (
              <p className="mt-2 text-sm text-amber-800">
                {t('noPriceItems', { count: formatNumber(totals.missing, locale) })}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2 print:hidden">
            <Button onClick={share}>
              <Share2 /> {t('share')}
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer /> {t('print')}
            </Button>
            <Button variant="ghost" className="text-red-700" onClick={list.clear}>
              <Trash2 /> {t('clear')}
            </Button>
          </div>
        </>
      )}
      <p className="text-ink-muted text-xs print:hidden">{t('storageNote')}</p>
    </div>
  )
}

function ListRow({
  item,
  card,
  loading,
  onQty,
  onRemove,
}: {
  item: BajarListItem
  card: ProductCardDTO | undefined
  loading: boolean
  onQty: (qty: number) => void
  onRemove: () => void
}) {
  const t = useTranslations('tools.list')
  const tp = useTranslations('price')
  const locale = useLocale() as Locale
  const price = card?.latestPrice
  const [draft, setDraft] = useState<string | null>(null)
  const step = price?.unit.key === 'kg' ? 0.5 : 1

  return (
    <li className="flex flex-wrap items-center gap-3 p-4">
      <div className="min-w-40 flex-1">
        {card ? (
          <Link
            href={localizePath(locale, `/products/${card.slug}`)}
            className="text-ink hover:text-brand font-semibold"
          >
            {pick(card.name, locale)}
          </Link>
        ) : (
          <span className="text-ink-muted">{loading ? t('loading') : item.slug}</span>
        )}
        <p className="text-ink-muted text-sm">
          {price
            ? `${formatPriceRange(price.minimumPrice, price.maximumPrice, locale)} / ${pick(price.unit, locale)}`
            : loading
              ? ''
              : tp('noPrice')}
        </p>
      </div>
      <div className="flex items-center gap-1" aria-label={t('quantity')}>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="−"
          onClick={() => onQty(Math.max(step, item.qty - step))}
          className="print:hidden"
        >
          <Minus />
        </Button>
        <Input
          inputMode="decimal"
          aria-label={t('quantity')}
          className="tabular h-8 w-16 text-center"
          value={draft ?? formatNumber(item.qty, locale)}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => {
            const n = draft !== null ? parseAmount(draft) : null
            if (n !== null) onQty(n)
            setDraft(null)
          }}
        />
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="+"
          onClick={() => onQty(item.qty + step)}
          className="print:hidden"
        >
          <Plus />
        </Button>
        <span className="text-ink-muted w-12 text-sm">{price ? pick(price.unit, locale) : ''}</span>
      </div>
      <div className="tabular w-28 text-right font-semibold">
        {price ? formatPrice(Math.round(price.referencePrice * item.qty), locale) : '—'}
      </div>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={t('remove')}
        onClick={onRemove}
        className="print:hidden"
      >
        <Trash2 />
      </Button>
    </li>
  )
}

// ---------------- Watchlist ----------------

export function WatchlistView() {
  const t = useTranslations('tools.watch')
  const locale = useLocale() as Locale
  const watch = useWatchlist()
  const { loading, bySlug } = useCards(watch.items.map((i) => i.slug))

  if (!watch.items.length) {
    return (
      <div className="space-y-6">
        <EmptyState title={t('empty')} hint={t('emptyHint')} />
        <p className="text-ink-muted text-xs">{t('storageNote')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ul className="grid gap-4 md:grid-cols-2">
        {watch.items.map((item) => {
          const card = bySlug.get(item.slug)
          const price = card?.latestPrice
          const isNewMonth =
            price &&
            (item.seenYear !== price.year || item.seenMonth !== price.month) &&
            item.seenYear !== null
          const diff = price && item.seenRef !== null ? price.referencePrice - item.seenRef : null
          const pct = diff !== null && item.seenRef ? (diff / item.seenRef) * 100 : null
          return (
            <li
              key={item.slug}
              className={cn(
                'border-border flex flex-col gap-3 rounded-2xl border bg-white p-5',
                isNewMonth && diff ? 'ring-brand/30 ring-2' : '',
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  {card ? (
                    <Link
                      href={localizePath(locale, `/products/${card.slug}`)}
                      className="text-ink hover:text-brand text-lg font-semibold"
                    >
                      {pick(card.name, locale)}
                    </Link>
                  ) : (
                    <span className="text-ink-muted">{loading ? '…' : item.slug}</span>
                  )}
                  {price ? (
                    <p className="tabular text-brand-dark text-2xl font-bold">
                      {formatPriceRange(price.minimumPrice, price.maximumPrice, locale)}
                      <span className="text-ink-muted ml-1 text-sm font-normal">
                        / {pick(price.unit, locale)}
                      </span>
                    </p>
                  ) : null}
                  {price ? (
                    <p className="text-ink-muted text-xs">
                      {formatMonthYear(price.month, price.year, locale)}
                    </p>
                  ) : null}
                </div>
                {isNewMonth ? (
                  <span className="bg-orange text-ink shrink-0 rounded-full px-2.5 py-1 text-xs font-medium">
                    {t('newMonth', { month: formatMonthYear(price.month, price.year, locale) })}
                  </span>
                ) : null}
              </div>

              <div className="bg-muted/60 rounded-xl p-3 text-sm">
                {item.seenRef === null || item.seenYear === null || item.seenMonth === null ? (
                  <p className="text-ink-muted">{t('noPriceThen')}</p>
                ) : (
                  <>
                    <p className="text-ink-muted text-xs">
                      {t('since', {
                        month: formatMonthYear(item.seenMonth, item.seenYear, locale),
                      })}
                    </p>
                    {diff === null || diff === 0 ? (
                      <p className="text-ink flex items-center gap-1 font-medium">
                        <Minus className="size-4" /> {t('noChange')}
                      </p>
                    ) : (
                      <p
                        className={cn(
                          'flex items-center gap-1 font-semibold',
                          diff > 0 ? 'text-red-700' : 'text-brand',
                        )}
                      >
                        {diff > 0 ? (
                          <ArrowUpRight className="size-4" />
                        ) : (
                          <ArrowDownRight className="size-4" />
                        )}
                        {formatPrice(item.seenRef, locale)} →{' '}
                        {formatPrice(price!.referencePrice, locale)} (
                        {formatPercent(Math.round(pct! * 10) / 10, locale)})
                      </p>
                    )}
                  </>
                )}
              </div>

              <div className="mt-auto flex flex-wrap gap-2">
                {price && (isNewMonth || diff) ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      watch.markSeen(item.slug, {
                        seenRef: price.referencePrice,
                        seenYear: price.year,
                        seenMonth: price.month,
                      })
                    }
                  >
                    <Eye /> {t('markSeen')}
                  </Button>
                ) : (
                  <span className="text-brand inline-flex items-center gap-1 text-sm">
                    <Check className="size-4" />
                  </span>
                )}
                <Button size="sm" variant="ghost" onClick={() => watch.remove(item.slug)}>
                  <BellOff /> {t('unfollow')}
                </Button>
              </div>
            </li>
          )
        })}
      </ul>
      <p className="text-ink-muted text-xs">{t('storageNote')}</p>
    </div>
  )
}

/** Small header links with counts. */
export function SavedLinks() {
  const t = useTranslations('nav')
  const locale = useLocale() as Locale
  const list = useBajarList()
  return (
    <Link
      href={localizePath(locale, '/list')}
      className="text-ink hover:bg-soft-green hover:text-brand-dark relative ml-auto inline-flex size-10 shrink-0 items-center justify-center rounded-lg md:ml-0"
      aria-label={`${t('list')}${list.items.length ? ` (${list.items.length})` : ''}`}
      title={t('list')}
    >
      <ListChecks className="size-5" />
      {list.items.length ? (
        <span className="bg-orange text-ink absolute top-1 right-1 flex min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-4 font-bold">
          {formatNumber(list.items.length, locale)}
        </span>
      ) : null}
    </Link>
  )
}
