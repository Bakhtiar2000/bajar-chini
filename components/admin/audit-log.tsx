'use client'

import { useState } from 'react'
import { ArrowRight, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { useApi } from '@/lib/use-api'
import { formatMonthYear } from '@/lib/format'
import type { MarketDTO } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input, NativeSelect } from '@/components/ui/input'
import { Badge } from '@/components/ui/misc'

type Snap = {
  minimumPrice: number
  maximumPrice: number
  referencePrice: number
  unit: string
  notes: string
  status: string
  observedAt: string | null
} | null

type Entry = {
  id: string
  action: 'create' | 'update' | 'publish' | 'unpublish' | 'delete'
  at: string
  actor: string
  actorRole: string
  source: string
  month: number
  year: number
  wasPublished: boolean
  product: { name: { bn: string; en: string }; slug: string } | null
  market: { name: { bn: string; en: string }; slug: string } | null
  before: Snap
  after: Snap
}
type Page = { total: number; page: number; limit: number; items: Entry[] }
type Option = { id: string; name: { bn: string; en: string } }

const ACTION_STYLE: Record<
  Entry['action'],
  'secondary' | 'info' | 'warning' | 'destructive' | 'muted'
> = {
  create: 'secondary',
  update: 'info',
  publish: 'secondary',
  unpublish: 'warning',
  delete: 'destructive',
}

function range(s: Snap) {
  if (!s) return '—'
  return s.minimumPrice === s.maximumPrice
    ? `৳${s.minimumPrice}`
    : `৳${s.minimumPrice}–${s.maximumPrice}`
}

function Diff({ before, after }: { before: Snap; after: Snap }) {
  const changes: string[] = []
  if (before && after) {
    if (before.minimumPrice !== after.minimumPrice || before.maximumPrice !== after.maximumPrice)
      changes.push('price')
    if (before.unit !== after.unit) changes.push(`unit ${before.unit} → ${after.unit}`)
    if (before.status !== after.status) changes.push(`${before.status} → ${after.status}`)
    if ((before.notes ?? '') !== (after.notes ?? '')) changes.push('notes')
    if (before.observedAt !== after.observedAt) changes.push('observation date')
  }
  return (
    <div className="text-sm">
      <span className="tabular">
        {range(before)} <ArrowRight className="inline size-3.5" /> {range(after)}
      </span>
      {changes.length ? <span className="text-ink-muted"> · {changes.join(', ')}</span> : null}
    </div>
  )
}

export function AuditLog({ markets }: { markets: MarketDTO[] }) {
  const products = useApi<Option[]>('/api/admin/products/options').data ?? []
  const [productId, setProductId] = useState('')
  const [marketId, setMarketId] = useState('')
  const [action, setAction] = useState('')
  const [actor, setActor] = useState('')
  const [page, setPage] = useState(1)
  const sp = new URLSearchParams({ page: String(page), limit: '30' })
  if (productId) sp.set('productId', productId)
  if (marketId) sp.set('marketId', marketId)
  if (action) sp.set('action', action)
  if (actor.trim()) sp.set('actor', actor.trim())
  const { data, loading } = useApi<Page>(`/api/admin/audit?${sp}`)
  const pages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1

  const reset =
    <T,>(set: (v: T) => void) =>
    (v: T) => {
      set(v)
      setPage(1)
    }

  return (
    <div className="space-y-4">
      <div className="border-border grid gap-2 rounded-2xl border bg-white p-3 sm:grid-cols-2 lg:grid-cols-4">
        <NativeSelect
          value={productId}
          onChange={(e) => reset(setProductId)(e.target.value)}
          aria-label="Product"
        >
          <option value="">All products</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name.en} — {p.name.bn}
            </option>
          ))}
        </NativeSelect>
        <NativeSelect
          value={marketId}
          onChange={(e) => reset(setMarketId)(e.target.value)}
          aria-label="Market"
        >
          <option value="">All markets</option>
          {markets.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name.en}
            </option>
          ))}
        </NativeSelect>
        <NativeSelect
          value={action}
          onChange={(e) => reset(setAction)(e.target.value)}
          aria-label="Action"
        >
          <option value="">All actions</option>
          <option value="create">Created</option>
          <option value="update">Updated / corrected</option>
          <option value="publish">Published</option>
          <option value="unpublish">Unpublished</option>
          <option value="delete">Deleted</option>
        </NativeSelect>
        <Input
          value={actor}
          onChange={(e) => reset(setActor)(e.target.value)}
          placeholder="Username"
          aria-label="Filter by username"
        />
      </div>

      {loading && !data ? (
        <div className="text-ink-muted flex items-center justify-center gap-2 rounded-2xl border bg-white p-10">
          <Loader2 className="size-5 animate-spin" /> Loading…
        </div>
      ) : data && data.items.length ? (
        <ul className="border-border divide-border divide-y rounded-2xl border bg-white">
          {data.items.map((e) => (
            <li key={e.id} className="grid gap-2 p-4 sm:grid-cols-[1fr_auto]">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={ACTION_STYLE[e.action]} className="capitalize">
                    {e.action}
                  </Badge>
                  <span className="text-ink font-medium">
                    {e.product?.name.en ?? 'Deleted product'}
                  </span>
                  <span className="text-ink-muted text-sm">
                    {e.market?.name.en} · {formatMonthYear(e.month, e.year, 'en')}
                  </span>
                  {e.wasPublished ? (
                    <Badge variant="warning" title="Changed a publicly visible record">
                      Live record
                    </Badge>
                  ) : null}
                </div>
                <Diff before={e.before} after={e.after} />
              </div>
              <div className="text-ink-muted text-xs sm:text-right">
                <p>{new Date(e.at).toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' })}</p>
                <p>
                  <span className="text-ink font-medium">{e.actor}</span>
                  {e.actorRole ? ` (${e.actorRole})` : ''}
                  {e.source ? ` · ${e.source}` : ''}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-ink-muted rounded-2xl border border-dashed bg-white p-8 text-center">
          No changes recorded yet. Every price entry, correction, publication and deletion from now
          on is logged here.
        </p>
      )}

      {data && data.total > data.limit ? (
        <div className="flex items-center justify-between">
          <p className="text-ink-muted text-sm">
            {data.total} change(s) · page {data.page} of {pages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft /> Newer
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Older <ChevronRight />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
