'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useApi } from '@/lib/use-api'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { History, Loader2, MapPin, Pencil, Plus, Star, Trash2 } from 'lucide-react'
import { api, errorMessage } from '@/lib/client-api'
import type { MarketDTO } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/misc'
import { Switch } from '@/components/ui/controls'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { BilingualField, Field, toSlug } from './form-bits'

type AdminMarket = MarketDTO & { priceRecordCount: number; publishedCount: number }

const loc = z.object({ bn: z.string(), en: z.string() })
const schema = z.object({
  name: z.object({
    bn: z.string().trim().min(1, 'Required'),
    en: z.string().trim().min(1, 'Required'),
  }),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Lowercase letters, numbers and hyphens'),
  area: loc,
  city: loc,
  address: z.string(),
  description: loc,
  isActive: z.boolean(),
  isDefaultReferenceMarket: z.boolean(),
})
type FormValues = z.infer<typeof schema>

export function MarketsManager() {
  const { data: items, reload: load } = useApi<AdminMarket[]>('/api/admin/markets')
  const [editing, setEditing] = useState<AdminMarket | 'new' | null>(null)

  const patch = async (m: AdminMarket, body: Partial<FormValues>, msg: string) => {
    try {
      await api(`/api/admin/markets/${m.id}`, { method: 'PATCH', json: body })
      toast.success(msg)
      void load()
    } catch (e) {
      toast.error(errorMessage(e))
    }
  }

  const remove = async (m: AdminMarket) => {
    if (!confirm(`Delete market “${m.name.en}”?`)) return
    try {
      await api(`/api/admin/markets/${m.id}`, { method: 'DELETE' })
      toast.success('Market deleted')
      void load()
    } catch (e) {
      toast.error(errorMessage(e))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setEditing('new')}>
          <Plus /> New market
        </Button>
      </div>
      {!items ? (
        <p className="text-ink-muted flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" /> Loading…
        </p>
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {items.map((m) => (
            <li key={m.id} className="border-border space-y-3 rounded-2xl border bg-white p-4">
              <div className="flex items-start gap-3">
                <span className="bg-soft-green text-brand flex size-10 shrink-0 items-center justify-center rounded-lg">
                  <MapPin className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-ink font-semibold">
                    {m.name.bn} <span className="text-ink-muted font-normal">· {m.name.en}</span>
                  </p>
                  <p className="text-ink-muted text-sm">
                    {[m.area.en, m.city.en].filter(Boolean).join(', ')}{' '}
                    {m.address ? `· ${m.address}` : ''}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {m.isDefaultReferenceMarket ? (
                      <Badge>
                        <Star /> Default reference market
                      </Badge>
                    ) : null}
                    <Badge variant={m.isActive ? 'secondary' : 'muted'}>
                      {m.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline">
                      {m.priceRecordCount} records · {m.publishedCount} published
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 border-t pt-3">
                <label className="flex items-center gap-2 text-sm">
                  <Switch
                    checked={m.isActive}
                    disabled={m.isDefaultReferenceMarket}
                    onCheckedChange={(v) =>
                      patch(m, { isActive: v }, v ? 'Market activated' : 'Market deactivated')
                    }
                  />
                  Active
                </label>
                {!m.isDefaultReferenceMarket && m.isActive ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      patch(
                        m,
                        { isDefaultReferenceMarket: true },
                        'Default reference market changed',
                      )
                    }
                  >
                    <Star /> Make default
                  </Button>
                ) : null}
                <div className="ml-auto flex gap-1">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/admin/prices?tab=history&marketId=${m.id}`}>
                      <History /> Price records
                    </Link>
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => setEditing(m)}
                    aria-label={`Edit ${m.name.en}`}
                  >
                    <Pencil />
                  </Button>
                  {!m.isDefaultReferenceMarket ? (
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => remove(m)}
                      aria-label={`Delete ${m.name.en}`}
                    >
                      <Trash2 className="text-destructive" />
                    </Button>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {editing ? (
        <MarketDialog
          market={editing === 'new' ? null : editing}
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

function MarketDialog({
  market,
  onClose,
  onSaved,
}: {
  market: AdminMarket | null
  onClose: () => void
  onSaved: () => void
}) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: market?.name ?? { bn: '', en: '' },
      slug: market?.slug ?? '',
      area: market?.area ?? { bn: '', en: '' },
      city: market?.city ?? { bn: 'ঢাকা', en: 'Dhaka' },
      address: market?.address ?? '',
      description: market?.description ?? { bn: '', en: '' },
      isActive: market?.isActive ?? true,
      isDefaultReferenceMarket: market?.isDefaultReferenceMarket ?? false,
    },
  })

  const onSubmit = async (v: FormValues) => {
    try {
      if (market) {
        const { isDefaultReferenceMarket, ...rest } = v
        await api(`/api/admin/markets/${market.id}`, {
          method: 'PATCH',
          json: market.isDefaultReferenceMarket ? rest : { ...rest, isDefaultReferenceMarket },
        })
      } else await api('/api/admin/markets', { method: 'POST', json: v })
      toast.success(market ? 'Market updated' : 'Market created')
      onSaved()
    } catch (e) {
      toast.error(errorMessage(e))
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{market ? 'Edit market' : 'New market'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <BilingualField
            label="Name"
            name="m-name"
            bn={register('name.bn')}
            en={register('name.en', {
              onBlur: (e) => !watch('slug') && setValue('slug', toSlug(e.target.value)),
            })}
            errors={errors.name}
          />
          <Field label="Slug" htmlFor="m-slug" error={errors.slug}>
            <Input id="m-slug" {...register('slug')} />
          </Field>
          <BilingualField
            label="Area"
            name="m-area"
            bn={register('area.bn')}
            en={register('area.en')}
          />
          <BilingualField
            label="City"
            name="m-city"
            bn={register('city.bn')}
            en={register('city.en')}
          />
          <Field label="Address (optional)" htmlFor="m-address">
            <Input id="m-address" {...register('address')} />
          </Field>
          <BilingualField
            label="Description"
            name="m-desc"
            bn={register('description.bn')}
            en={register('description.en')}
            multiline
            rows={2}
          />
          <div className="flex flex-wrap gap-6">
            <Controller
              control={control}
              name="isActive"
              render={({ field }) => (
                <label className="flex items-center gap-2 text-sm">
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={market?.isDefaultReferenceMarket}
                  />{' '}
                  Active
                </label>
              )}
            />
            <Controller
              control={control}
              name="isDefaultReferenceMarket"
              render={({ field }) => (
                <label className="flex items-center gap-2 text-sm">
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={market?.isDefaultReferenceMarket}
                  />{' '}
                  Default reference market
                </label>
              )}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" /> : null} Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
