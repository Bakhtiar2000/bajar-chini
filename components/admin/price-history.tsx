'use client'

import { useState } from 'react'
import { useApi } from '@/lib/use-api'
import { toast } from 'sonner'
import { ChevronLeft, ChevronRight, FlaskConical, Loader2, Pencil, Trash2 } from 'lucide-react'
import { api, errorMessage } from '@/lib/client-api'
import { formatMonthYear, toDateInputValue } from '@/lib/format'
import { UNITS, UNIT_KEYS } from '@/lib/units'
import type { MarketDTO, PriceRecordDTO } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input, NativeSelect, Textarea } from '@/components/ui/input'
import { Badge, Label } from '@/components/ui/misc'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type Item = PriceRecordDTO & {
  product: { name: { bn: string; en: string }; slug: string } | null
  market: { name: { bn: string; en: string }; slug: string } | null
  createdBy?: string
  updatedBy?: string
}
type Page = { total: number; page: number; limit: number; items: Item[] }
type Option = { id: string; name: { bn: string; en: string } }

export function PriceHistory({
  markets,
  initialMarketId,
}: {
  markets: MarketDTO[]
  initialMarketId?: string
}) {
  const products = useApi<Option[]>('/api/admin/products/options').data ?? []
  const [productId, setProductId] = useState('')
  const [marketId, setMarketId] = useState(initialMarketId ?? '')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<Item | null>(null)
  const sp = new URLSearchParams({ page: String(page), limit: '25' })
  if (productId) sp.set('productId', productId)
  if (marketId) sp.set('marketId', marketId)
  if (status) sp.set('status', status)
  const { data, loading, reload: load } = useApi<Page>(`/api/admin/prices/history?${sp}`)

  const remove = async (item: Item) => {
    if (
      !confirm(
        `Delete the draft record for ${item.product?.name.en} (${formatMonthYear(item.month, item.year, 'en')})?`,
      )
    )
      return
    try {
      await api(`/api/admin/prices/${item.id}`, { method: 'DELETE' })
      toast.success('Draft deleted')
      void load()
    } catch (e) {
      toast.error(errorMessage(e))
    }
  }

  const pages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1

  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-3">
        <NativeSelect
          value={productId}
          onChange={(e) => {
            setProductId(e.target.value)
            setPage(1)
          }}
          aria-label="Product"
        >
          <option value="">All products</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name.bn} — {p.name.en}
            </option>
          ))}
        </NativeSelect>
        <NativeSelect
          value={marketId}
          onChange={(e) => {
            setMarketId(e.target.value)
            setPage(1)
          }}
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
          value={status}
          onChange={(e) => {
            setStatus(e.target.value)
            setPage(1)
          }}
          aria-label="Status"
        >
          <option value="">Draft &amp; published</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
        </NativeSelect>
      </div>

      <div className="border-border overflow-hidden rounded-2xl border bg-white">
        {loading && !data ? (
          <p className="text-ink-muted flex items-center justify-center gap-2 p-8">
            <Loader2 className="size-4 animate-spin" /> Loading…
          </p>
        ) : data && data.items.length ? (
          <ul className="divide-y">
            {data.items.map((r) => (
              <li
                key={r.id}
                className="grid gap-2 p-3 sm:grid-cols-[1.4fr_1fr_1fr_auto] sm:items-center sm:px-4"
              >
                <div>
                  <p className="text-ink font-medium">
                    {r.product?.name.bn}{' '}
                    <span className="text-ink-muted">· {r.product?.name.en}</span>
                  </p>
                  <p className="text-ink-muted text-xs">
                    {formatMonthYear(r.month, r.year, 'en')} · {r.market?.name.en}
                  </p>
                </div>
                <div className="tabular text-sm">
                  ৳{r.minimumPrice}–{r.maximumPrice} / {r.unit.en}
                  <span className="text-ink-muted block text-xs">
                    ref ৳{r.referencePrice} · observed {toDateInputValue(r.observedAt)}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  <Badge variant={r.status === 'PUBLISHED' ? 'default' : 'outline'}>
                    {r.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                  </Badge>
                  {r.isDemo ? (
                    <Badge variant="demo">
                      <FlaskConical /> Demo
                    </Badge>
                  ) : null}
                  <span className="text-ink-muted w-full text-xs">
                    Modified{' '}
                    {new Date(r.updatedAt).toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' })}
                    {r.updatedBy ? ` by ${r.updatedBy}` : ''}
                  </span>
                </div>
                <div className="flex gap-1 sm:justify-end">
                  <Button size="sm" variant="outline" onClick={() => setEditing(r)}>
                    <Pencil /> Correct
                  </Button>
                  {r.status === 'DRAFT' ? (
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => remove(r)}
                      aria-label="Delete draft"
                    >
                      <Trash2 className="text-destructive" />
                    </Button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-ink-muted p-8 text-center">No price records found.</p>
        )}
      </div>

      {data && data.total > data.limit ? (
        <div className="flex items-center justify-between text-sm">
          <span className="text-ink-muted">
            {data.total} records · page {data.page} of {pages}
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft /> Prev
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next <ChevronRight />
            </Button>
          </div>
        </div>
      ) : null}

      {editing ? (
        <EditRecordDialog
          item={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            void load()
          }}
        />
      ) : null}
    </div>
  )
}

function EditRecordDialog({
  item,
  onClose,
  onSaved,
}: {
  item: Item
  onClose: () => void
  onSaved: () => void
}) {
  const [min, setMin] = useState(String(item.minimumPrice))
  const [max, setMax] = useState(String(item.maximumPrice))
  const [unitKey, setUnitKey] = useState(item.unit.key)
  const [notes, setNotes] = useState(item.notes ?? '')
  const [observedAt, setObservedAt] = useState(toDateInputValue(item.observedAt))
  const [status, setStatus] = useState(item.status)
  const [saving, setSaving] = useState(false)
  const minN = Number(min)
  const maxN = Number(max)
  const invalid = min === '' || max === '' || minN < 0 || maxN < 0 || minN > maxN
  const monthStart = `${item.year}-${String(item.month).padStart(2, '0')}-01`

  const save = async () => {
    setSaving(true)
    try {
      await api(`/api/admin/prices/${item.id}`, {
        method: 'PATCH',
        json: { minimumPrice: minN, maximumPrice: maxN, unitKey, notes, observedAt, status },
      })
      toast.success('Record corrected')
      onSaved()
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Correct observation</DialogTitle>
          <DialogDescription>
            {item.product?.name.en} · {formatMonthYear(item.month, item.year, 'en')} ·{' '}
            {item.market?.name.en}. The month stays the same; only this record changes.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="er-min">Minimum ৳</Label>
            <Input
              id="er-min"
              type="number"
              min={0}
              step="any"
              value={min}
              onChange={(e) => setMin(e.target.value)}
              aria-invalid={invalid}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="er-max">Maximum ৳</Label>
            <Input
              id="er-max"
              type="number"
              min={0}
              step="any"
              value={max}
              onChange={(e) => setMax(e.target.value)}
              aria-invalid={invalid}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="er-unit">Unit</Label>
            <NativeSelect id="er-unit" value={unitKey} onChange={(e) => setUnitKey(e.target.value)}>
              {UNIT_KEYS.map((k) => (
                <option key={k} value={k}>
                  {UNITS[k].en}
                </option>
              ))}
            </NativeSelect>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="er-date">Observation date</Label>
            <Input
              id="er-date"
              type="date"
              value={observedAt}
              min={monthStart}
              onChange={(e) => setObservedAt(e.target.value)}
            />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="er-status">Status</Label>
            <NativeSelect
              id="er-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
            >
              <option value="DRAFT">Draft (hidden from public)</option>
              <option value="PUBLISHED">Published</option>
            </NativeSelect>
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="er-notes">Notes</Label>
            <Textarea
              id="er-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>
        {invalid ? (
          <p className="text-destructive text-sm">
            Enter valid, non-negative prices with minimum ≤ maximum.
          </p>
        ) : null}
        {item.isDemo ? (
          <p className="text-xs text-amber-800">
            Correcting the prices marks this record as a verified (non-demo) observation.
          </p>
        ) : null}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={invalid || saving}>
            {saving ? <Loader2 className="animate-spin" /> : null} Save correction
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
