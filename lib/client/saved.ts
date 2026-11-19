'use client'

import { useCallback, useSyncExternalStore } from 'react'

/*
 * Per-browser personal lists (no accounts): the bajar list (product → quantity)
 * and the watchlist (product → price seen when it was followed). Stored in
 * localStorage and synchronised across components and tabs. Every access is
 * guarded so private windows / blocked storage simply behave as empty lists.
 */

export type BajarListItem = { slug: string; qty: number }
export type WatchItem = {
  slug: string
  /** Reference price and month at the time the product was followed (null = no price then). */
  seenRef: number | null
  seenYear: number | null
  seenMonth: number | null
  addedAt: string
}

const KEYS = { list: 'bc:bajar-list:v1', watch: 'bc:watchlist:v1' } as const
type StoreKey = keyof typeof KEYS

const listeners = new Set<() => void>()
const cache = new Map<string, { raw: string | null; value: unknown }>()

function read<T>(key: StoreKey): T[] {
  let raw: string | null = null
  try {
    raw = window.localStorage.getItem(KEYS[key])
  } catch {
    raw = null
  }
  const hit = cache.get(key)
  if (hit && hit.raw === raw) return hit.value as T[]
  let value: T[] = []
  try {
    const parsed = raw ? JSON.parse(raw) : []
    value = Array.isArray(parsed) ? parsed : []
  } catch {
    value = []
  }
  cache.set(key, { raw, value })
  return value
}

function write<T>(key: StoreKey, value: T[]) {
  try {
    window.localStorage.setItem(KEYS[key], JSON.stringify(value))
  } catch {
    // storage unavailable: keep an in-memory copy for this page view
    cache.set(key, { raw: null, value })
  }
  listeners.forEach((l) => l())
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  const onStorage = (e: StorageEvent) => {
    if (!e.key || Object.values(KEYS).includes(e.key as (typeof KEYS)[StoreKey])) cb()
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(cb)
    window.removeEventListener('storage', onStorage)
  }
}

const EMPTY: never[] = []

function useStore<T>(key: StoreKey): T[] {
  return useSyncExternalStore(
    subscribe,
    () => read<T>(key),
    () => EMPTY,
  )
}

// ---------------- Bajar list ----------------

export const MAX_QTY = 999

export function useBajarList() {
  const items = useStore<BajarListItem>('list')
  const setQty = useCallback((slug: string, qty: number) => {
    const current = read<BajarListItem>('list')
    const q = Math.max(0, Math.min(MAX_QTY, Math.round(qty * 100) / 100))
    const next = current.filter((i) => i.slug !== slug)
    if (q > 0) {
      const idx = current.findIndex((i) => i.slug === slug)
      const item = { slug, qty: q }
      if (idx >= 0) next.splice(idx, 0, item)
      else next.push(item)
    }
    write('list', next)
  }, [])
  const add = useCallback(
    (slug: string, qty = 1) => {
      const existing = read<BajarListItem>('list').find((i) => i.slug === slug)
      setQty(slug, existing ? existing.qty : qty)
    },
    [setQty],
  )
  const remove = useCallback((slug: string) => setQty(slug, 0), [setQty])
  const replace = useCallback((next: BajarListItem[]) => write('list', next), [])
  const clear = useCallback(() => write('list', []), [])
  return { items, add, setQty, remove, replace, clear }
}

/** "rui-fish:2,onion:1.5" ⇄ list items (for shareable links). */
export function encodeList(items: BajarListItem[]): string {
  return items.map((i) => `${i.slug}:${i.qty}`).join(',')
}

export function decodeList(value: string | null | undefined): BajarListItem[] {
  if (!value) return []
  const out: BajarListItem[] = []
  for (const part of value.split(',').slice(0, 100)) {
    const [slug, qtyRaw] = part.split(':')
    const qty = Number(qtyRaw)
    if (/^[a-z0-9-]{1,100}$/.test(slug ?? '') && Number.isFinite(qty) && qty > 0) {
      out.push({ slug, qty: Math.min(MAX_QTY, qty) })
    }
  }
  return out
}

// ---------------- Watchlist ----------------

export function useWatchlist() {
  const items = useStore<WatchItem>('watch')
  const toggle = useCallback((item: Omit<WatchItem, 'addedAt'>) => {
    const current = read<WatchItem>('watch')
    if (current.some((i) => i.slug === item.slug)) {
      write(
        'watch',
        current.filter((i) => i.slug !== item.slug),
      )
    } else {
      write('watch', [...current, { ...item, addedAt: new Date().toISOString() }])
    }
  }, [])
  const remove = useCallback(
    (slug: string) =>
      write(
        'watch',
        read<WatchItem>('watch').filter((i) => i.slug !== slug),
      ),
    [],
  )
  /** Mark the current price as "seen" so the change badge resets. */
  const markSeen = useCallback(
    (slug: string, seen: Pick<WatchItem, 'seenRef' | 'seenYear' | 'seenMonth'>) =>
      write(
        'watch',
        read<WatchItem>('watch').map((i) => (i.slug === slug ? { ...i, ...seen } : i)),
      ),
    [],
  )
  return { items, toggle, remove, markSeen }
}
