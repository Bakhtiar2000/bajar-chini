import Link from 'next/link'
import { ArrowRight, CalendarDays, MapPin } from 'lucide-react'
import { localizePath, type Locale } from '@/i18n/config'
import { getT } from '@/i18n/server'
import { formatDate, pick } from '@/lib/format'
import type { ProductCardDTO } from '@/lib/types'
import { Badge } from '@/components/ui/misc'
import { SmartImage } from './smart-image'
import { DemoBadge, FreshnessBadge, PriceRange } from './price-bits'

export function freshnessLabels(t: ReturnType<typeof getT>) {
  return {
    current: t('price.freshness.current'),
    lastMonth: t('price.freshness.lastMonth'),
    older: t('price.freshness.older'),
    notObserved: t('price.freshness.notObserved'),
  }
}

export function ProductCard({
  product,
  locale,
  priority,
}: {
  product: ProductCardDTO
  locale: Locale
  priority?: boolean
}) {
  const t = getT(locale)
  const other = locale === 'bn' ? 'en' : 'bn'
  const href = localizePath(locale, `/products/${product.slug}`)
  const price = product.latestPrice

  return (
    <article className="group border-border bg-card relative flex flex-col overflow-hidden rounded-2xl border shadow-sm transition-shadow hover:shadow-md">
      <div className="bg-muted relative aspect-[4/3] overflow-hidden">
        <SmartImage
          src={product.image}
          alt={pick(product.name, locale)}
          icon={product.category.icon}
          label={pick(product.name, locale)}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          priority={priority}
          imgClassName="transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <Badge variant="outline" className="bg-white/95 backdrop-blur-sm">
            {pick(product.category.name, locale)}
          </Badge>
          {product.isSeasonal ? (
            <Badge className="bg-orange text-ink">{t('common.seasonal')}</Badge>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="text-ink text-lg leading-snug font-semibold">
            <Link href={href} className="after:absolute after:inset-0 focus-visible:outline-none">
              {pick(product.name, locale)}
            </Link>
          </h3>
          <p className="text-ink-muted text-sm" lang={other}>
            {product.name[other]}
          </p>
        </div>

        {price ? (
          <div className="bg-soft-green/70 mt-auto space-y-2 rounded-xl p-3">
            <PriceRange
              min={price.minimumPrice}
              max={price.maximumPrice}
              unit={price.unit}
              locale={locale}
              perUnitLabel={(u) => u}
            />
            <div className="text-ink-muted space-y-1 text-xs">
              <p className="flex items-start gap-1.5">
                <MapPin className="mt-0.5 size-3.5 shrink-0" />
                <span className="line-clamp-1">{pick(price.market.name, locale)}</span>
              </p>
              <p className="flex items-center gap-1.5">
                <CalendarDays className="size-3.5 shrink-0" />
                {formatDate(price.observedAt, locale)}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <FreshnessBadge freshness={price.freshness} labels={freshnessLabels(t)} />
              {price.isDemo ? <DemoBadge label={t('common.demoData')} /> : null}
            </div>
          </div>
        ) : (
          <div className="border-border text-ink-muted mt-auto rounded-xl border border-dashed p-3 text-sm">
            {t('price.noPrice')}
          </div>
        )}

        <span className="text-brand inline-flex items-center gap-1 text-sm font-medium">
          {t('common.viewDetails')}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </article>
  )
}

export function ProductGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {children}
    </div>
  )
}
