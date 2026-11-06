'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { Loader2, Search, X } from 'lucide-react'
import { pick, type Localized } from '@/lib/format'
import { localizePath, type Locale } from '@/i18n/config'
import { cn } from '@/lib/utils'
import { CATEGORY_ICONS } from './category-icon'
import type { CategoryIcon } from '@/lib/types'

type Suggestion =
  | { kind: 'category'; slug: string; name: Localized; icon: CategoryIcon }
  | { kind: 'product'; slug: string; name: Localized; category: Localized; icon: CategoryIcon }

type ApiResult = {
  data: {
    products: { slug: string; name: Localized; category: { name: Localized; icon: CategoryIcon } }[]
    categories: { slug: string; name: Localized; icon: CategoryIcon }[]
  }
}

export function SearchBox({
  variant = 'header',
  defaultValue = '',
  autoFocus,
  onNavigate,
}: {
  variant?: 'header' | 'hero' | 'page'
  defaultValue?: string
  autoFocus?: boolean
  onNavigate?: () => void
}) {
  const t = useTranslations('search')
  const locale = useLocale() as Locale
  const router = useRouter()
  const listId = useId()
  const [query, setQuery] = useState(defaultValue)
  // Results remember which query produced them, so `loading` can be derived.
  const [result, setResult] = useState<{ q: string; items: Suggestion[] }>({ q: '', items: [] })
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Debounced autocomplete
  useEffect(() => {
    const q = query.trim()
    if (q.length < 1) return
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(q)}&limit=6`, {
          signal: controller.signal,
        })
        if (!res.ok) throw new Error('search failed')
        const json = (await res.json()) as ApiResult
        setResult({
          q,
          items: [
            ...json.data.categories.slice(0, 3).map((c) => ({ kind: 'category' as const, ...c })),
            ...json.data.products.map((p) => ({
              kind: 'product' as const,
              slug: p.slug,
              name: p.name,
              category: p.category.name,
              icon: p.category.icon,
            })),
          ],
        })
        setActive(-1)
      } catch (e) {
        if ((e as Error).name !== 'AbortError') setResult({ q, items: [] })
      }
    }, 250)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const trimmed = query.trim()
  const items = trimmed ? result.items : []
  const loading = Boolean(trimmed) && result.q !== trimmed

  const hrefFor = (s: Suggestion) =>
    localizePath(locale, s.kind === 'category' ? `/categories/${s.slug}` : `/products/${s.slug}`)

  const go = (href: string) => {
    setOpen(false)
    onNavigate?.()
    router.push(href)
  }

  const submit = () => {
    const q = query.trim()
    if (active >= 0 && items[active]) return go(hrefFor(items[active]))
    if (q) go(`${localizePath(locale, '/search')}?q=${encodeURIComponent(q)}`)
  }

  const showPanel = open && query.trim().length > 0
  const other = locale === 'bn' ? 'en' : 'bn'

  return (
    <div ref={wrapperRef} className="relative w-full">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
        className={cn(
          'border-input focus-within:border-ring focus-within:ring-ring/20 flex items-center gap-2 rounded-xl border bg-white shadow-xs focus-within:ring-[3px]',
          variant === 'hero' ? 'h-14 pr-2 pl-4 shadow-lg' : 'h-10 pr-1 pl-3',
        )}
      >
        <Search
          className={cn('text-ink-muted shrink-0', variant === 'hero' ? 'size-5' : 'size-4')}
          aria-hidden
        />
        <input
          type="search"
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setOpen(true)
              setActive((a) => Math.min(a + 1, items.length - 1))
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setActive((a) => Math.max(a - 1, -1))
            } else if (e.key === 'Escape') {
              setOpen(false)
            }
          }}
          placeholder={variant === 'header' ? t('shortPlaceholder') : t('placeholder')}
          aria-label={t('title')}
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          className={cn(
            'placeholder:text-ink-muted min-w-0 flex-1 bg-transparent outline-none [&::-webkit-search-cancel-button]:hidden',
            variant === 'hero' ? 'text-base sm:text-lg' : 'text-base md:text-sm',
          )}
        />
        {loading ? (
          <Loader2
            className="text-ink-muted size-4 shrink-0 animate-spin"
            aria-label={t('searching')}
          />
        ) : null}
        {query && !loading ? (
          <button
            type="button"
            onClick={() => {
              setQuery('')
            }}
            className="text-ink-muted hover:text-ink rounded-md p-1"
            aria-label="Clear"
          >
            <X className="size-4" />
          </button>
        ) : null}
        {variant === 'hero' ? (
          <button
            type="submit"
            className="bg-primary hover:bg-brand-dark h-10 shrink-0 rounded-lg px-4 font-medium text-white transition-colors sm:px-6"
          >
            {t('submit')}
          </button>
        ) : null}
      </form>

      {showPanel ? (
        <div className="border-border absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-xl border bg-white text-left shadow-xl">
          {items.length ? (
            <ul id={listId} role="listbox" className="max-h-[60vh] overflow-y-auto py-1">
              {items.map((s, i) => {
                const Icon = CATEGORY_ICONS[s.icon]
                return (
                  <li
                    key={`${s.kind}-${s.slug}`}
                    id={`${listId}-${i}`}
                    role="option"
                    aria-selected={i === active}
                  >
                    <button
                      type="button"
                      onMouseEnter={() => setActive(i)}
                      onClick={() => go(hrefFor(s))}
                      className={cn(
                        'flex w-full items-center gap-3 px-3 py-2 text-left',
                        i === active && 'bg-soft-green',
                      )}
                    >
                      <span className="bg-soft-green text-brand flex size-8 shrink-0 items-center justify-center rounded-lg">
                        <Icon className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="text-ink block truncate font-medium">
                          {pick(s.name, locale)}
                        </span>
                        <span className="text-ink-muted block truncate text-xs">
                          {s.kind === 'category'
                            ? `${t('categories')} · ${s.name[other]}`
                            : `${s.name[other]} · ${pick(s.category, locale)}`}
                        </span>
                      </span>
                    </button>
                  </li>
                )
              })}
              <li className="border-t">
                <button
                  type="button"
                  onClick={() =>
                    go(`${localizePath(locale, '/search')}?q=${encodeURIComponent(query.trim())}`)
                  }
                  className="text-brand hover:bg-soft-green w-full px-3 py-2.5 text-left text-sm font-medium"
                >
                  {t('seeAll')} →
                </button>
              </li>
            </ul>
          ) : (
            <p className="text-ink-muted px-4 py-3 text-sm">
              {loading ? t('searching') : t('noResults', { query: query.trim() })}
            </p>
          )}
        </div>
      ) : null}
    </div>
  )
}
