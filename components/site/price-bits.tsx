import { CircleCheck, Clock, History, CircleDashed, FlaskConical } from 'lucide-react'
import { Badge } from '@/components/ui/misc'
import { formatPriceRange, pick, type Localized } from '@/lib/format'
import type { Freshness } from '@/lib/types'
import type { Locale } from '@/i18n/config'
import { cn } from '@/lib/utils'

type Labels = {
  current: string
  lastMonth: string
  older: string
  notObserved: string
}

export function FreshnessBadge({
  freshness,
  labels,
  className,
}: {
  freshness: Freshness | null
  labels: Labels
  className?: string
}) {
  if (!freshness)
    return (
      <Badge variant="muted" className={className}>
        <CircleDashed /> {labels.notObserved}
      </Badge>
    )
  if (freshness === 'current')
    return (
      <Badge variant="secondary" className={cn('text-brand', className)}>
        <CircleCheck /> {labels.current}
      </Badge>
    )
  if (freshness === 'last-month')
    return (
      <Badge variant="info" className={className}>
        <Clock /> {labels.lastMonth}
      </Badge>
    )
  return (
    <Badge variant="warning" className={className}>
      <History /> {labels.older}
    </Badge>
  )
}

export function DemoBadge({ label, className }: { label: string; className?: string }) {
  return (
    <Badge variant="demo" className={className} title={label}>
      <FlaskConical /> {label}
    </Badge>
  )
}

export function PriceRange({
  min,
  max,
  unit,
  locale,
  perUnitLabel,
  size = 'md',
}: {
  min: number
  max: number
  unit: Localized
  locale: Locale
  perUnitLabel: (unit: string) => string
  size?: 'sm' | 'md' | 'lg'
}) {
  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-1.5">
      <span
        className={cn(
          'tabular text-brand-dark font-bold',
          size === 'lg' ? 'text-3xl sm:text-4xl' : size === 'md' ? 'text-lg' : 'text-base',
        )}
      >
        {formatPriceRange(min, max, locale)}
      </span>
      <span className={cn('text-ink-muted', size === 'lg' ? 'text-base' : 'text-sm')}>
        / {perUnitLabel(pick(unit, locale))}
      </span>
    </span>
  )
}
