'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { useApi } from '@/lib/use-api'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { ArrowDown, ArrowUp, Loader2, Save, Trash2 } from 'lucide-react'
import { api, errorMessage } from '@/lib/client-api'
import { UNITS, UNIT_KEYS } from '@/lib/units'
import { monthName } from '@/lib/format'
import type { CategoryDTO, ImageDTO } from '@/lib/types'
import type { AdminProduct } from '@/lib/data/admin'
import { Button } from '@/components/ui/button'
import { Input, NativeSelect } from '@/components/ui/input'
import { Card } from '@/components/ui/misc'
import { Checkbox, Switch } from '@/components/ui/controls'
import { SmartImage } from '@/components/site/smart-image'
import {
  BilingualField,
  csvToList,
  Field,
  ImageUploader,
  linesToList,
  listToLines,
  toSlug,
} from './form-bits'

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
  categoryId: z.string().min(1, 'Choose a category'),
  altNames: loc,
  shortDescription: loc,
  description: loc,
  identificationGuide: loc,
  goodQualitySigns: loc,
  warningSigns: loc,
  buyingTips: loc,
  seasonalInformation: loc,
  variety: loc,
  seasonMonths: z.array(z.number()),
  defaultUnitKey: z.string(),
  relatedProducts: z.array(z.string()),
  isFeatured: z.boolean(),
  isPopular: z.boolean(),
  isPublished: z.boolean(),
})
type FormValues = z.infer<typeof schema>
type Option = { id: string; name: { bn: string; en: string }; categoryId: string }

const lines = (v?: { bn: string[]; en: string[] }) => ({
  bn: listToLines(v?.bn),
  en: listToLines(v?.en),
})

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <Card className="space-y-4 p-5">
      <div>
        <h2 className="text-ink font-semibold">{title}</h2>
        {description ? <p className="text-ink-muted text-sm">{description}</p> : null}
      </div>
      {children}
    </Card>
  )
}

export function ProductForm({ product }: { product?: AdminProduct }) {
  const router = useRouter()
  const categories = useApi<CategoryDTO[]>('/api/admin/categories').data ?? []
  const optionsData = useApi<Option[]>('/api/admin/products/options').data
  const options = useMemo(() => optionsData ?? [], [optionsData])
  const [images, setImages] = useState<ImageDTO[]>(product?.images ?? [])
  const [relatedFilter, setRelatedFilter] = useState('')

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: product?.name ?? { bn: '', en: '' },
      slug: product?.slug ?? '',
      categoryId: product?.categoryId ?? '',
      altNames: {
        bn: (product?.alternativeNames.bn ?? []).join(', '),
        en: (product?.alternativeNames.en ?? []).join(', '),
      },
      shortDescription: product?.shortDescription ?? { bn: '', en: '' },
      description: product?.description ?? { bn: '', en: '' },
      identificationGuide: product?.identificationGuide ?? { bn: '', en: '' },
      goodQualitySigns: lines(product?.goodQualitySigns),
      warningSigns: lines(product?.warningSigns),
      buyingTips: lines(product?.buyingTips),
      seasonalInformation: product?.seasonalInformation ?? { bn: '', en: '' },
      variety: product?.variety ?? { bn: '', en: '' },
      seasonMonths: product?.seasonMonths ?? [],
      defaultUnitKey: product?.defaultUnitKey ?? 'kg',
      relatedProducts: product?.relatedProducts ?? [],
      isFeatured: product?.isFeatured ?? false,
      isPopular: product?.isPopular ?? false,
      isPublished: product?.isPublished ?? true,
    },
  })

  const categoryId = watch('categoryId')
  const icon = categories.find((c) => c.id === categoryId)?.icon ?? 'other'
  const related = watch('relatedProducts')
  const relatedOptions = useMemo(() => {
    const f = relatedFilter.trim().toLowerCase()
    return options
      .filter((o) => o.id !== product?.id)
      .filter((o) => !f || `${o.name.bn} ${o.name.en}`.toLowerCase().includes(f))
      .sort((a, b) => Number(b.categoryId === categoryId) - Number(a.categoryId === categoryId))
  }, [options, relatedFilter, product?.id, categoryId])

  const onSubmit = async (v: FormValues) => {
    const payload = {
      name: v.name,
      slug: v.slug,
      categoryId: v.categoryId,
      alternativeNames: { bn: csvToList(v.altNames.bn), en: csvToList(v.altNames.en) },
      shortDescription: v.shortDescription,
      description: v.description,
      identificationGuide: v.identificationGuide,
      goodQualitySigns: {
        bn: linesToList(v.goodQualitySigns.bn),
        en: linesToList(v.goodQualitySigns.en),
      },
      warningSigns: { bn: linesToList(v.warningSigns.bn), en: linesToList(v.warningSigns.en) },
      buyingTips: { bn: linesToList(v.buyingTips.bn), en: linesToList(v.buyingTips.en) },
      seasonalInformation: v.seasonalInformation,
      variety: v.variety,
      seasonMonths: v.seasonMonths,
      defaultUnitKey: v.defaultUnitKey,
      relatedProducts: v.relatedProducts,
      isFeatured: v.isFeatured,
      isPopular: v.isPopular,
      isPublished: v.isPublished,
      images: images.map((i) => ({ url: i.url, publicId: i.publicId ?? '', alt: i.alt ?? v.name })),
    }
    try {
      if (product) {
        await api(`/api/admin/products/${product.id}`, { method: 'PATCH', json: payload })
        toast.success('Product saved')
        router.refresh()
      } else {
        const res = await api<{ id: string }>('/api/admin/products', {
          method: 'POST',
          json: payload,
        })
        toast.success('Product created')
        router.replace(`/admin/products/${res.id}`)
      }
    } catch (e) {
      toast.error(errorMessage(e))
    }
  }

  const moveImage = (i: number, d: -1 | 1) =>
    setImages((prev) => {
      const next = [...prev]
      const j = i + d
      if (j < 0 || j >= next.length) return prev
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pb-24" noValidate>
      <Section title="Basics">
        <BilingualField
          label="Name"
          name="p-name"
          bn={register('name.bn')}
          en={register('name.en', {
            onBlur: (e) => !watch('slug') && setValue('slug', toSlug(e.target.value)),
          })}
          errors={errors.name}
        />
        <div className="grid gap-3 sm:grid-cols-3">
          <Field
            label="Slug (URL)"
            htmlFor="p-slug"
            error={errors.slug}
            hint="e.g. rui-fish → /products/rui-fish"
          >
            <Input id="p-slug" {...register('slug')} />
          </Field>
          <Field label="Category" htmlFor="p-cat" error={errors.categoryId}>
            <NativeSelect id="p-cat" {...register('categoryId')}>
              <option value="">Choose…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name.en} — {c.name.bn}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field
            label="Default price unit"
            htmlFor="p-unit"
            hint="Pre-selected in the monthly price editor"
          >
            <NativeSelect id="p-unit" {...register('defaultUnitKey')}>
              {UNIT_KEYS.map((k) => (
                <option key={k} value={k}>
                  {UNITS[k].en} — {UNITS[k].bn}
                </option>
              ))}
            </NativeSelect>
          </Field>
        </div>
        <BilingualField
          label="Alternative names"
          name="p-alt"
          bn={register('altNames.bn')}
          en={register('altNames.en')}
          hint="Comma-separated. Used by search."
        />
        <BilingualField
          label="Variety / type"
          name="p-variety"
          bn={register('variety.bn')}
          en={register('variety.en')}
          hint="Used for the variety filter, e.g. চাষের মাছ / Farmed fish"
        />
        <BilingualField
          label="Short description"
          name="p-short"
          bn={register('shortDescription.bn')}
          en={register('shortDescription.en')}
          multiline
          rows={2}
        />
        <BilingualField
          label="Introduction"
          name="p-desc"
          bn={register('description.bn')}
          en={register('description.en')}
          multiline
          rows={4}
        />
      </Section>

      <Section
        title="Images"
        description="The first image is the main image. Upload to Cloudinary or paste a URL."
      >
        {images.length ? (
          <ul className="flex flex-wrap gap-3">
            {images.map((img, i) => (
              <li key={img.url} className="w-32 space-y-1">
                <div className="bg-muted relative aspect-square overflow-hidden rounded-xl border">
                  <SmartImage src={img.url} alt="" icon={icon} sizes="128px" />
                  {i === 0 ? (
                    <span className="bg-brand absolute top-1 left-1 rounded px-1.5 text-[10px] text-white">
                      Main
                    </span>
                  ) : null}
                </div>
                <div className="flex justify-between">
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => moveImage(i, -1)}
                    aria-label="Move left"
                  >
                    <ArrowUp className="-rotate-90" />
                  </Button>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => setImages((p) => p.filter((_, j) => j !== i))}
                    aria-label="Remove image"
                  >
                    <Trash2 className="text-destructive" />
                  </Button>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => moveImage(i, 1)}
                    aria-label="Move right"
                  >
                    <ArrowDown className="-rotate-90" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
        <ImageUploader
          value={null}
          onChange={(v) =>
            v &&
            setImages((prev) =>
              prev.some((p) => p.url === v.url)
                ? prev
                : [...prev, { url: v.url, publicId: v.publicId }],
            )
          }
          folder="products"
          label="Add image"
          icon={icon}
        />
      </Section>

      <Section
        title="Identification & quality"
        description="Write product-specific guidance. One item per line for lists."
      >
        <BilingualField
          label="How to identify (কীভাবে চিনবেন?)"
          name="p-ident"
          bn={register('identificationGuide.bn')}
          en={register('identificationGuide.en')}
          multiline
          rows={5}
        />
        <BilingualField
          label="Good quality signs"
          name="p-good"
          bn={register('goodQualitySigns.bn')}
          en={register('goodQualitySigns.en')}
          multiline
          rows={5}
          hint="One sign per line"
        />
        <BilingualField
          label="Warning signs"
          name="p-warn"
          bn={register('warningSigns.bn')}
          en={register('warningSigns.en')}
          multiline
          rows={5}
          hint="Avoid unsupported food-safety or adulteration claims."
        />
        <BilingualField
          label="Buying tips"
          name="p-tips"
          bn={register('buyingTips.bn')}
          en={register('buyingTips.en')}
          multiline
          rows={4}
          hint="One tip per line"
        />
      </Section>

      <Section title="Season">
        <BilingualField
          label="Seasonal information"
          name="p-season"
          bn={register('seasonalInformation.bn')}
          en={register('seasonalInformation.en')}
          multiline
          rows={2}
        />
        <Controller
          control={control}
          name="seasonMonths"
          render={({ field }) => (
            <fieldset>
              <legend className="mb-2 text-sm font-medium">
                Peak months (leave empty if year-round)
              </legend>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <label key={m} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={field.value.includes(m)}
                      onCheckedChange={(v) =>
                        field.onChange(
                          v
                            ? [...field.value, m].sort((a, b) => a - b)
                            : field.value.filter((x) => x !== m),
                        )
                      }
                    />
                    {monthName(m, 'en').slice(0, 3)}
                  </label>
                ))}
              </div>
            </fieldset>
          )}
        />
      </Section>

      <Section
        title="Related products"
        description={`${related.length} selected. Products from the same category are listed first.`}
      >
        <Input
          value={relatedFilter}
          onChange={(e) => setRelatedFilter(e.target.value)}
          placeholder="Filter products…"
          aria-label="Filter related products"
        />
        <Controller
          control={control}
          name="relatedProducts"
          render={({ field }) => (
            <div className="grid max-h-64 gap-1 overflow-auto rounded-lg border p-2 sm:grid-cols-2 lg:grid-cols-3">
              {relatedOptions.map((o) => (
                <label
                  key={o.id}
                  className="hover:bg-soft-green flex items-center gap-2 rounded px-2 py-1.5 text-sm"
                >
                  <Checkbox
                    checked={field.value.includes(o.id)}
                    onCheckedChange={(v) =>
                      field.onChange(
                        v ? [...field.value, o.id] : field.value.filter((x) => x !== o.id),
                      )
                    }
                  />
                  <span className="truncate">
                    {o.name.bn} <span className="text-ink-muted">· {o.name.en}</span>
                  </span>
                </label>
              ))}
            </div>
          )}
        />
      </Section>

      <Section title="Visibility">
        <div className="flex flex-wrap gap-6">
          {(
            [
              ['isPublished', 'Published (visible on the site)'],
              ['isFeatured', 'Featured on homepage'],
              ['isPopular', 'Show in homepage price table'],
            ] as const
          ).map(([name, label]) => (
            <Controller
              key={name}
              control={control}
              name={name}
              render={({ field }) => (
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={field.value} onCheckedChange={field.onChange} /> {label}
                </label>
              )}
            />
          ))}
        </div>
      </Section>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-white/95 px-4 py-3 backdrop-blur lg:left-[240px]">
        <div className="mx-auto flex max-w-5xl items-center justify-end gap-2">
          {isDirty ? <span className="text-ink-muted mr-auto text-sm">Unsaved changes</span> : null}
          <Button type="button" variant="outline" onClick={() => router.push('/admin/products')}>
            Back
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin" /> : <Save />}{' '}
            {product ? 'Save product' : 'Create product'}
          </Button>
        </div>
      </div>
    </form>
  )
}
