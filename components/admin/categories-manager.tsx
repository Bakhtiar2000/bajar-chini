'use client'

import { useState } from 'react'
import { useApi } from '@/lib/use-api'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import { api, errorMessage } from '@/lib/client-api'
import type { CategoryDTO, CategoryIcon } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input, NativeSelect } from '@/components/ui/input'
import { Badge } from '@/components/ui/misc'
import { Switch } from '@/components/ui/controls'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { SmartImage } from '@/components/site/smart-image'
import { BilingualField, Field, ImageUploader, toSlug } from './form-bits'

const ICONS: CategoryIcon[] = [
  'fish',
  'chicken',
  'beef',
  'mutton',
  'vegetable',
  'leafy',
  'fruit',
  'spice',
  'grain',
  'other',
]

const schema = z.object({
  name: z.object({
    bn: z.string().trim().min(1, 'Required'),
    en: z.string().trim().min(1, 'Required'),
  }),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Lowercase letters, numbers and hyphens'),
  description: z.object({ bn: z.string(), en: z.string() }),
  icon: z.enum(ICONS),
  displayOrder: z.coerce.number<number>().int().min(0),
  isActive: z.boolean(),
  image: z.object({ url: z.string(), publicId: z.string() }).nullable(),
})
type FormValues = z.infer<typeof schema>

export function CategoriesManager() {
  const { data: items, reload: load } = useApi<CategoryDTO[]>('/api/admin/categories')
  const [editing, setEditing] = useState<CategoryDTO | 'new' | null>(null)

  const remove = async (c: CategoryDTO) => {
    if (!confirm(`Delete category “${c.name.en}”? This cannot be undone.`)) return
    try {
      await api(`/api/admin/categories/${c.id}`, { method: 'DELETE' })
      toast.success('Category deleted')
      void load()
    } catch (e) {
      toast.error(errorMessage(e))
    }
  }

  const toggle = async (c: CategoryDTO) => {
    try {
      await api(`/api/admin/categories/${c.id}`, {
        method: 'PATCH',
        json: { isActive: !c.isActive },
      })
      void load()
    } catch (e) {
      toast.error(errorMessage(e))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setEditing('new')}>
          <Plus /> New category
        </Button>
      </div>
      {!items ? (
        <p className="text-ink-muted flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" /> Loading…
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((c) => (
            <li key={c.id} className="border-border flex gap-3 rounded-2xl border bg-white p-3">
              <div className="bg-muted relative size-20 shrink-0 overflow-hidden rounded-xl">
                <SmartImage src={c.image} alt={c.name.en} icon={c.icon} sizes="80px" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-ink font-semibold">
                  {c.name.bn} <span className="text-ink-muted font-normal">· {c.name.en}</span>
                </p>
                <p className="text-ink-muted text-xs">
                  /{c.slug} · order {c.displayOrder} · {c.productCount} products
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <label className="flex items-center gap-2 text-xs">
                    <Switch
                      checked={c.isActive}
                      onCheckedChange={() => toggle(c)}
                      aria-label="Active"
                    />{' '}
                    {c.isActive ? 'Active' : 'Inactive'}
                  </label>
                  {!c.isActive ? <Badge variant="muted">Hidden</Badge> : null}
                  <div className="ml-auto flex gap-1">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => setEditing(c)}
                      aria-label={`Edit ${c.name.en}`}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => remove(c)}
                      aria-label={`Delete ${c.name.en}`}
                    >
                      <Trash2 className="text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {editing ? (
        <CategoryDialog
          category={editing === 'new' ? null : editing}
          nextOrder={(items?.length ?? 0) + 1}
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

function CategoryDialog({
  category,
  nextOrder,
  onClose,
  onSaved,
}: {
  category: CategoryDTO | null
  nextOrder: number
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
      name: category?.name ?? { bn: '', en: '' },
      slug: category?.slug ?? '',
      description: category?.description ?? { bn: '', en: '' },
      icon: category?.icon ?? 'other',
      displayOrder: category?.displayOrder ?? nextOrder,
      isActive: category?.isActive ?? true,
      image: category?.image
        ? { url: category.image, publicId: category.cloudinaryPublicId ?? '' }
        : null,
    },
  })

  const onSubmit = async (v: FormValues) => {
    const payload = {
      name: v.name,
      slug: v.slug,
      description: v.description,
      icon: v.icon,
      displayOrder: v.displayOrder,
      isActive: v.isActive,
      image: v.image?.url ?? '',
      cloudinaryPublicId: v.image?.publicId ?? '',
    }
    try {
      if (category)
        await api(`/api/admin/categories/${category.id}`, { method: 'PATCH', json: payload })
      else await api('/api/admin/categories', { method: 'POST', json: payload })
      toast.success(category ? 'Category updated' : 'Category created')
      onSaved()
    } catch (e) {
      toast.error(errorMessage(e))
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{category ? 'Edit category' : 'New category'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <BilingualField
            label="Name"
            name="cat-name"
            bn={register('name.bn')}
            en={register('name.en', {
              onBlur: (e) => !watch('slug') && setValue('slug', toSlug(e.target.value)),
            })}
            errors={errors.name}
          />
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Slug" htmlFor="cat-slug" error={errors.slug} className="sm:col-span-1">
              <Input id="cat-slug" {...register('slug')} placeholder="fish" />
            </Field>
            <Field label="Icon" htmlFor="cat-icon">
              <NativeSelect id="cat-icon" {...register('icon')}>
                {ICONS.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field label="Display order" htmlFor="cat-order" error={errors.displayOrder}>
              <Input id="cat-order" type="number" min={0} {...register('displayOrder')} />
            </Field>
          </div>
          <BilingualField
            label="Description"
            name="cat-desc"
            bn={register('description.bn')}
            en={register('description.en')}
            multiline
          />
          <Controller
            control={control}
            name="image"
            render={({ field }) => (
              <ImageUploader
                value={field.value}
                onChange={field.onChange}
                folder="categories"
                label="Category image"
                icon={watch('icon')}
              />
            )}
          />
          <Controller
            control={control}
            name="isActive"
            render={({ field }) => (
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={field.value} onCheckedChange={field.onChange} /> Active (visible on
                the public site)
              </label>
            )}
          />
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
