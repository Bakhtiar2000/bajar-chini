'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useApi } from '@/lib/use-api'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { ExternalLink, Loader2, Pencil, Plus, Save, Trash2 } from 'lucide-react'
import { api, errorMessage } from '@/lib/client-api'
import type { ArticleDTO, CategoryDTO } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input, NativeSelect } from '@/components/ui/input'
import { Badge, Card } from '@/components/ui/misc'
import { Switch } from '@/components/ui/controls'
import { SmartImage } from '@/components/site/smart-image'
import { BilingualField, csvToList, Field, ImageUploader, toSlug } from './form-bits'

export function ArticlesList() {
  const { data: items, reload: load } = useApi<ArticleDTO[]>('/api/admin/articles')

  const toggle = async (a: ArticleDTO) => {
    try {
      await api(`/api/admin/articles/${a.id}`, {
        method: 'PATCH',
        json: { isPublished: !a.isPublished },
      })
      void load()
    } catch (e) {
      toast.error(errorMessage(e))
    }
  }
  const remove = async (a: ArticleDTO) => {
    if (!confirm(`Delete “${a.title.en}”?`)) return
    try {
      await api(`/api/admin/articles/${a.id}`, { method: 'DELETE' })
      toast.success('Article deleted')
      void load()
    } catch (e) {
      toast.error(errorMessage(e))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button asChild>
          <Link href="/admin/articles/new">
            <Plus /> New article
          </Link>
        </Button>
      </div>
      {!items ? (
        <p className="text-ink-muted flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" /> Loading…
        </p>
      ) : items.length ? (
        <ul className="border-border divide-y rounded-2xl border bg-white">
          {items.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center gap-3 p-3 sm:px-4">
              <div className="bg-muted relative h-14 w-20 shrink-0 overflow-hidden rounded-lg">
                <SmartImage src={a.coverImage} alt="" icon={a.category?.icon} sizes="80px" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-ink truncate font-medium">{a.title.bn}</p>
                <p className="text-ink-muted truncate text-sm">{a.title.en}</p>
                {a.category ? (
                  <Badge variant="outline" className="mt-1">
                    {a.category.name.en}
                  </Badge>
                ) : null}
              </div>
              <label className="flex items-center gap-2 text-xs">
                <Switch
                  checked={a.isPublished}
                  onCheckedChange={() => toggle(a)}
                  aria-label="Published"
                />{' '}
                {a.isPublished ? 'Published' : 'Draft'}
              </label>
              <div className="flex gap-1">
                {a.isPublished ? (
                  <Button size="icon-sm" variant="ghost" asChild>
                    <a
                      href={`/guides/${a.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="View on site"
                    >
                      <ExternalLink />
                    </a>
                  </Button>
                ) : null}
                <Button size="icon-sm" variant="ghost" asChild>
                  <Link href={`/admin/articles/${a.id}`} aria-label="Edit">
                    <Pencil />
                  </Link>
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => remove(a)}
                  aria-label="Delete"
                >
                  <Trash2 className="text-destructive" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-ink-muted rounded-xl border border-dashed bg-white p-8 text-center">
          No articles yet.
        </p>
      )}
    </div>
  )
}

const loc = z.object({ bn: z.string(), en: z.string() })
const schema = z.object({
  title: z.object({
    bn: z.string().trim().min(1, 'Required'),
    en: z.string().trim().min(1, 'Required'),
  }),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Lowercase letters, numbers and hyphens'),
  excerpt: loc,
  content: loc,
  categoryId: z.string(),
  tags: z.string(),
  isPublished: z.boolean(),
  cover: z.object({ url: z.string(), publicId: z.string() }).nullable(),
})
type FormValues = z.infer<typeof schema>

type AdminArticle = ArticleDTO & { categoryId: string | null }

export function ArticleForm({ article }: { article?: AdminArticle }) {
  const router = useRouter()
  const categories = useApi<CategoryDTO[]>('/api/admin/categories').data ?? []

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: article?.title ?? { bn: '', en: '' },
      slug: article?.slug ?? '',
      excerpt: article?.excerpt ?? { bn: '', en: '' },
      content: article?.content ?? { bn: '', en: '' },
      categoryId: article?.categoryId ?? '',
      tags: article?.tags.join(', ') ?? '',
      isPublished: article?.isPublished ?? false,
      cover: article?.coverImage
        ? { url: article.coverImage, publicId: article.coverImagePublicId ?? '' }
        : null,
    },
  })

  const onSubmit = async (v: FormValues) => {
    const payload = {
      title: v.title,
      slug: v.slug,
      excerpt: v.excerpt,
      content: v.content,
      categoryId: v.categoryId || null,
      tags: csvToList(v.tags),
      isPublished: v.isPublished,
      coverImage: v.cover?.url ?? '',
      coverImagePublicId: v.cover?.publicId ?? '',
    }
    try {
      if (article) {
        await api(`/api/admin/articles/${article.id}`, { method: 'PATCH', json: payload })
        toast.success('Article saved')
        router.refresh()
      } else {
        const res = await api<{ id: string }>('/api/admin/articles', {
          method: 'POST',
          json: payload,
        })
        toast.success('Article created')
        router.replace(`/admin/articles/${res.id}`)
      }
    } catch (e) {
      toast.error(errorMessage(e))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <Card className="space-y-4 p-5">
        <BilingualField
          label="Title"
          name="a-title"
          bn={register('title.bn')}
          en={register('title.en', {
            onBlur: (e) => !watch('slug') && setValue('slug', toSlug(e.target.value)),
          })}
          errors={errors.title}
        />
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Slug" htmlFor="a-slug" error={errors.slug}>
            <Input id="a-slug" {...register('slug')} />
          </Field>
          <Field label="Category (optional)" htmlFor="a-cat">
            <NativeSelect id="a-cat" {...register('categoryId')}>
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name.en} — {c.name.bn}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Tags" htmlFor="a-tags" hint="Comma-separated">
            <Input id="a-tags" {...register('tags')} />
          </Field>
        </div>
        <BilingualField
          label="Excerpt"
          name="a-excerpt"
          bn={register('excerpt.bn')}
          en={register('excerpt.en')}
          multiline
          rows={2}
        />
        <BilingualField
          label="Content"
          name="a-content"
          bn={register('content.bn')}
          en={register('content.en')}
          multiline
          rows={16}
          hint='Use a blank line between paragraphs, "## " for headings, "- " for bullet points and **bold**.'
        />
        <Controller
          control={control}
          name="cover"
          render={({ field }) => (
            <ImageUploader
              value={field.value}
              onChange={field.onChange}
              folder="articles"
              label="Cover image"
            />
          )}
        />
        <Controller
          control={control}
          name="isPublished"
          render={({ field }) => (
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={field.value} onCheckedChange={field.onChange} /> Published
            </label>
          )}
        />
      </Card>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.push('/admin/articles')}>
          Back
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="animate-spin" /> : <Save />} Save article
        </Button>
      </div>
    </form>
  )
}
