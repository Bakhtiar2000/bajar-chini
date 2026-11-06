import Link from 'next/link'
import { Info, MapPin } from 'lucide-react'
import { localizePath, type Locale } from '@/i18n/config'
import { getT } from '@/i18n/server'
import { formatDate, formatMonthYear, formatNumber, pick } from '@/lib/format'
import type { MarketDTO, ProductCardDTO } from '@/lib/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Alert } from '@/components/ui/misc'
import { DemoBadge, FreshnessBadge, PriceRange } from './price-bits'
import { freshnessLabels } from './product-card'
import { CATEGORY_ICONS } from './category-icon'

export function MarketBanner({ market, locale }: { market: MarketDTO; locale: Locale }) {
  const t = getT(locale)
  return (
    <div className="border-border flex items-start gap-3 rounded-xl border bg-white p-4">
      <span className="bg-soft-green text-brand flex size-10 shrink-0 items-center justify-center rounded-lg">
        <MapPin className="size-5" />
      </span>
      <div className="text-sm">
        <p className="text-ink-muted">{t('price.referenceMarket')}</p>
        <p className="text-ink font-semibold">
          {pick(market.name, locale)}
          {market.city.bn || market.city.en ? `, ${pick(market.city, locale)}` : ''}
        </p>
        {market.address ? <p className="text-ink-muted text-xs">{market.address}</p> : null}
      </div>
    </div>
  )
}

export function PriceDisclaimer({ locale, showDemo }: { locale: Locale; showDemo?: boolean }) {
  const t = getT(locale)
  return (
    <div className="space-y-2">
      <Alert variant="warning">
        <Info />
        <p>{t('price.disclaimer')}</p>
      </Alert>
      {showDemo ? (
        <p className="rounded-lg border border-dashed border-amber-400 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          {t('price.demoNote')}
        </p>
      ) : null}
    </div>
  )
}

/** Latest monthly prices for a list of products. Table on desktop, cards on mobile. */
export function PriceTable({ products, locale }: { products: ProductCardDTO[]; locale: Locale }) {
  const t = getT(locale)
  const labels = freshnessLabels(t)
  const href = (slug: string) => localizePath(locale, `/products/${slug}`)

  return (
    <>
      {/* Mobile: cards */}
      <ul className="space-y-3 md:hidden">
        {products.map((p) => {
          const lp = p.latestPrice
          const Icon = CATEGORY_ICONS[p.category.icon]
          return (
            <li key={p.id} className="border-border rounded-xl border bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <Link
                  href={href(p.slug)}
                  className="text-ink hover:text-brand flex min-w-0 items-center gap-2 font-semibold"
                >
                  <Icon className="text-brand size-4 shrink-0" />
                  <span className="truncate">{pick(p.name, locale)}</span>
                </Link>
                {lp ? <FreshnessBadge freshness={lp.freshness} labels={labels} /> : null}
              </div>
              {lp ? (
                <div className="mt-2 space-y-1.5">
                  <PriceRange
                    min={lp.minimumPrice}
                    max={lp.maximumPrice}
                    unit={lp.unit}
                    locale={locale}
                    perUnitLabel={(u) => u}
                  />
                  <dl className="text-ink-muted grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                    <dt>{t('price.observationMonth')}</dt>
                    <dd className="text-ink text-right">
                      {formatMonthYear(lp.month, lp.year, locale)}
                    </dd>
                    <dt>{t('price.lastObserved')}</dt>
                    <dd className="text-ink text-right">{formatDate(lp.observedAt, locale)}</dd>
                  </dl>
                  {lp.isDemo ? <DemoBadge label={t('common.demoData')} /> : null}
                </div>
              ) : (
                <p className="text-ink-muted mt-2 text-sm">{t('price.noPrice')}</p>
              )}
            </li>
          )
        })}
      </ul>

      {/* Desktop: table */}
      <div className="border-border hidden overflow-hidden rounded-2xl border bg-white md:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>{t('price.product')}</TableHead>
              <TableHead className="text-right">{t('price.minimum')}</TableHead>
              <TableHead className="text-right">{t('price.maximum')}</TableHead>
              <TableHead>{t('price.unit')}</TableHead>
              <TableHead>{t('price.observationMonth')}</TableHead>
              <TableHead>{t('price.lastObserved')}</TableHead>
              <TableHead>{t('price.status')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => {
              const lp = p.latestPrice
              const Icon = CATEGORY_ICONS[p.category.icon]
              return (
                <TableRow key={p.id}>
                  <TableCell>
                    <Link
                      href={href(p.slug)}
                      className="text-ink hover:text-brand flex items-center gap-2 font-medium"
                    >
                      <Icon className="text-brand size-4 shrink-0" />
                      {pick(p.name, locale)}
                    </Link>
                  </TableCell>
                  {lp ? (
                    <>
                      <TableCell className="tabular text-right font-semibold">
                        ৳{formatNumber(lp.minimumPrice, locale)}
                      </TableCell>
                      <TableCell className="tabular text-right font-semibold">
                        ৳{formatNumber(lp.maximumPrice, locale)}
                      </TableCell>
                      <TableCell>{pick(lp.unit, locale)}</TableCell>
                      <TableCell>{formatMonthYear(lp.month, lp.year, locale)}</TableCell>
                      <TableCell className="text-ink-muted">
                        {formatDate(lp.observedAt, locale)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          <FreshnessBadge freshness={lp.freshness} labels={labels} />
                          {lp.isDemo ? <DemoBadge label={t('common.demoData')} /> : null}
                        </div>
                      </TableCell>
                    </>
                  ) : (
                    <TableCell colSpan={6} className="text-ink-muted">
                      {t('price.noPrice')}
                    </TableCell>
                  )}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
