'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Loader2, Search, X } from 'lucide-react'
import { Input, NativeSelect } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/controls'
import { pick, type Localized } from '@/lib/format'
import type { Locale } from '@/i18n/config'

export type FilterState = {
  q: string
  sort: string
  seasonal: boolean
  updated: boolean
  variety: string
}

export function FilterBar({
  initial,
  varieties,
}: {
  initial: FilterState
  varieties: Localized[]
}) {
  const t = useTranslations('products')
  const locale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()
  const [pending, startTransition] = useTransition()
  const [q, setQ] = useState(initial.q)
  const first = useRef(true)

  const apply = (next: Partial<FilterState>) => {
    const state = { ...initial, q, ...next }
    const params = new URLSearchParams()
    if (state.q.trim()) params.set('q', state.q.trim())
    if (state.sort && state.sort !== 'name-asc') params.set('sort', state.sort)
    if (state.seasonal) params.set('seasonal', '1')
    if (state.updated) params.set('updated', '1')
    if (state.variety) params.set('variety', state.variety)
    const qs = params.toString()
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }))
  }

  // Debounce the text search
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const id = setTimeout(() => apply({ q }), 350)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  const hasFilters =
    initial.q ||
    initial.seasonal ||
    initial.updated ||
    initial.variety ||
    initial.sort !== 'name-asc'

  return (
    <div
      className="border-border space-y-3 rounded-2xl border bg-white p-3 sm:p-4"
      aria-busy={pending}
    >
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Search className="text-ink-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('searchInCategory')}
            aria-label={t('searchInCategory')}
            className="pl-9"
          />
          {pending ? (
            <Loader2 className="text-ink-muted absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin" />
          ) : null}
        </div>
        {varieties.length > 1 ? (
          <NativeSelect
            aria-label={t('variety')}
            value={initial.variety}
            onChange={(e) => apply({ variety: e.target.value })}
            className="sm:w-48"
          >
            <option value="">{t('allVarieties')}</option>
            {varieties.map((v) => (
              <option key={v.en} value={v.en}>
                {pick(v, locale)}
              </option>
            ))}
          </NativeSelect>
        ) : null}
        <NativeSelect
          aria-label={t('sort')}
          value={initial.sort}
          onChange={(e) => apply({ sort: e.target.value })}
          className="sm:w-56"
        >
          <option value="name-asc">{t('sortNameAsc')}</option>
          <option value="name-desc">{t('sortNameDesc')}</option>
          <option value="latest">{t('sortLatest')}</option>
          <option value="price-low">{t('sortPriceLow')}</option>
        </NativeSelect>
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
        <label className="flex min-h-8 cursor-pointer items-center gap-2">
          <Checkbox
            checked={initial.seasonal}
            onCheckedChange={(v) => apply({ seasonal: v === true })}
          />
          {t('seasonalOnly')}
        </label>
        <label className="flex min-h-8 cursor-pointer items-center gap-2">
          <Checkbox
            checked={initial.updated}
            onCheckedChange={(v) => apply({ updated: v === true })}
          />
          {t('updatedThisMonth')}
        </label>
        {hasFilters ? (
          <button
            type="button"
            onClick={() => {
              setQ('')
              startTransition(() => router.replace(pathname, { scroll: false }))
            }}
            className="text-brand ml-auto inline-flex items-center gap-1 hover:underline"
          >
            <X className="size-3.5" /> {t('clearFilters')}
          </button>
        ) : null}
      </div>
    </div>
  )
}
