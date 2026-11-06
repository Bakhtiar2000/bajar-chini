'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useApi } from '@/lib/use-api'
import { toast } from 'sonner'
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
import { api, errorMessage } from '@/lib/client-api'
import type { CategoryDTO, CategoryRef } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input, NativeSelect } from '@/components/ui/input'
import { Badge } from '@/components/ui/misc'
import { Switch } from '@/components/ui/controls'
import { SmartImage } from '@/components/site/smart-image'

type Item = {
  id: string
  slug: string
  name: { bn: string; en: string }
  image?: string
  category: CategoryRef | null
  isPublished: boolean
  isFeatured: boolean
  isPopular: boolean
  updatedAt: string
}
type Page = { total: number; page: number; limit: number; items: Item[] }

export function ProductsList() {
  const categories = useApi<CategoryDTO[]>('/api/admin/categories').data ?? []
  const [q, setQ] = useState('')
  const [debounced, setDebounced] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [page, setPage] = useState(1)
  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(q)
      setPage(1)
    }, 300)
    return () => clearTimeout(t)
  }, [q])

  const sp = new URLSearchParams({ page: String(page), limit: '20' })
  if (debounced) sp.set('q', debounced)
  if (categoryId) sp.set('categoryId', categoryId)
  const { data, loading, reload: load } = useApi<Page>(`/api/admin/products?${sp}`)

  const togglePublished = async (p: Item) => {
    try {
      await api(`/api/admin/products/${p.id}`, {
        method: 'PATCH',
        json: { isPublished: !p.isPublished },
      })
      toast.success(p.isPublished ? 'Product unpublished' : 'Product published')
      void load()
    } catch (e) {
      toast.error(errorMessage(e))
    }
  }

  const remove = async (p: Item) => {
    if (!confirm(`Delete “${p.name.en}”? This cannot be undone.`)) return
    try {
      await api(`/api/admin/products/${p.id}`, { method: 'DELETE' })
      toast.success('Product deleted')
      void load()
    } catch (e) {
      toast.error(errorMessage(e))
    }
  }

  const pages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-52 flex-1">
          <Search className="text-ink-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search (বাংলা / English)"
            className="pl-9"
            aria-label="Search products"
          />
        </div>
        <NativeSelect
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value)
            setPage(1)
          }}
          className="w-auto"
          aria-label="Category"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name.en} — {c.name.bn}
            </option>
          ))}
        </NativeSelect>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus /> New product
          </Link>
        </Button>
      </div>

      <div className="border-border overflow-hidden rounded-2xl border bg-white">
        {!data && loading ? (
          <p className="text-ink-muted flex items-center justify-center gap-2 p-8">
            <Loader2 className="size-4 animate-spin" /> Loading…
          </p>
        ) : data?.items.length ? (
          <ul className="divide-y">
            {data.items.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-3 p-3 sm:px-4">
                <div className="bg-muted relative size-14 shrink-0 overflow-hidden rounded-lg">
                  <SmartImage src={p.image} alt="" icon={p.category?.icon} sizes="56px" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-ink truncate font-medium">
                    {p.name.bn} <span className="text-ink-muted">· {p.name.en}</span>
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {p.category ? <Badge variant="outline">{p.category.name.en}</Badge> : null}
                    {p.isFeatured ? <Badge variant="secondary">Featured</Badge> : null}
                    {p.isPopular ? <Badge variant="secondary">Popular price</Badge> : null}
                  </div>
                </div>
                <label className="flex items-center gap-2 text-xs">
                  <Switch
                    checked={p.isPublished}
                    onCheckedChange={() => togglePublished(p)}
                    aria-label="Published"
                  />
                  {p.isPublished ? 'Published' : 'Unpublished'}
                </label>
                <div className="flex gap-1">
                  {p.isPublished ? (
                    <Button size="icon-sm" variant="ghost" asChild>
                      <a
                        href={`/products/${p.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="View on site"
                      >
                        <ExternalLink />
                      </a>
                    </Button>
                  ) : null}
                  <Button size="icon-sm" variant="ghost" asChild>
                    <Link href={`/admin/products/${p.id}`} aria-label={`Edit ${p.name.en}`}>
                      <Pencil />
                    </Link>
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => remove(p)}
                    aria-label={`Delete ${p.name.en}`}
                  >
                    <Trash2 className="text-destructive" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-ink-muted p-8 text-center">No products found.</p>
        )}
      </div>

      {data && data.total > data.limit ? (
        <div className="flex items-center justify-between text-sm">
          <span className="text-ink-muted">
            {data.total} products · page {data.page} of {pages}
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
    </div>
  )
}
