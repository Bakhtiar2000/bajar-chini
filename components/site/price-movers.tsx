import Link from 'next/link'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { localizePath, type Locale } from '@/i18n/config'
import { getT } from '@/i18n/server'
import { formatMonthYear, formatPercent, formatPrice, pick } from '@/lib/format'
import type { PriceMoverDTO } from '@/lib/data/queries'
import type { MarketDTO, ProductCardDTO } from '@/lib/types'
import { DemoBadge } from './price-bits'

function MoverList({
  title,
  items,
  cards,
  locale,
  tone,
}: {
  title: string
  items: PriceMoverDTO[]
  cards: Map<string, ProductCardDTO>
  locale: Locale
  tone: 'up' | 'down'
}) {
  const Icon = tone === 'up' ? ArrowUpRight : ArrowDownRight
  const color = tone === 'up' ? 'text-red-700' : 'text-brand'
  return (
    <div className="border-border rounded-2xl border bg-white">
      <h3 className={`flex items-center gap-2 px-5 pt-4 pb-2 font-semibold ${color}`}>
        <Icon className="size-5" aria-hidden /> {title}
      </h3>
      <ol className="divide-border divide-y">
        {items.map((m) => {
          const card = cards.get(m.productId)
          if (!card) return null
          return (
            <li key={m.productId}>
              <Link
                href={localizePath(locale, `/products/${card.slug}`)}
                className="hover:bg-soft-green/60 flex items-center gap-3 px-5 py-3"
              >
                <span className="min-w-0 flex-1">
                  <span className="text-ink block truncate font-medium">
                    {pick(card.name, locale)}
                  </span>
                  <span className="text-ink-muted tabular block text-xs">
                    {formatPrice(m.previous.ref, locale)} → {formatPrice(m.current.ref, locale)}
                    {card.latestPrice ? ` / ${pick(card.latestPrice.unit, locale)}` : ''}
                  </span>
                </span>
                <span className={`tabular shrink-0 text-lg font-bold ${color}`}>
                  {formatPercent(m.percent, locale)}
                </span>
              </Link>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

/** Home-page "biggest movers": top rises and falls vs. the previous month. */
export function PriceMovers({
  movers,
  cards,
  market,
  locale,
  limit = 5,
}: {
  movers: PriceMoverDTO[]
  cards: ProductCardDTO[]
  market: MarketDTO | null
  locale: Locale
  limit?: number
}) {
  const t = getT(locale)
  const byId = new Map(cards.map((c) => [c.id, c]))
  const known = movers.filter((m) => byId.has(m.productId))
  const up = known.filter((m) => m.change > 0).slice(0, limit)
  const down = known.filter((m) => m.change < 0).slice(0, limit)
  if (!up.length && !down.length) return null
  const month = known[0]?.current
  const demo = known.some((m) => m.isDemo)

  return (
    <section className="container-page pt-16" aria-labelledby="movers-heading">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="movers-heading" className="text-ink text-2xl font-bold sm:text-3xl">
            {t('tools.movers.title')}
          </h2>
          <p className="text-ink-muted mt-1">
            {t('tools.movers.subtitle', { market: market ? pick(market.name, locale) : '' })}
            {month ? ` · ${formatMonthYear(month.month, month.year, locale)}` : ''}
          </p>
        </div>
        {demo ? <DemoBadge label={t('common.demoData')} /> : null}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {up.length ? (
          <MoverList
            title={t('tools.movers.up')}
            items={up}
            cards={byId}
            locale={locale}
            tone="up"
          />
        ) : null}
        {down.length ? (
          <MoverList
            title={t('tools.movers.down')}
            items={down}
            cards={byId}
            locale={locale}
            tone="down"
          />
        ) : null}
      </div>
    </section>
  )
}
