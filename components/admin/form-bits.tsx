'use client'

import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { ImagePlus, Link2, Loader2, X } from 'lucide-react'
import type { FieldError, UseFormRegisterReturn } from 'react-hook-form'
import { Input, Textarea } from '@/components/ui/input'
import { Label } from '@/components/ui/misc'
import { Button } from '@/components/ui/button'
import { SmartImage } from '@/components/site/smart-image'
import { api, errorMessage } from '@/lib/client-api'
import { cn } from '@/lib/utils'

export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
  className,
}: {
  label: string
  htmlFor?: string
  error?: FieldError | { message?: string }
  hint?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error?.message ? (
        <p className="text-destructive text-xs">{error.message}</p>
      ) : hint ? (
        <p className="text-ink-muted text-xs">{hint}</p>
      ) : null}
    </div>
  )
}

/** Side-by-side Bengali / English inputs. */
export function BilingualField({
  label,
  name,
  bn,
  en,
  errors,
  multiline,
  rows = 3,
  hint,
}: {
  label: string
  name: string
  bn: UseFormRegisterReturn
  en: UseFormRegisterReturn
  errors?: { bn?: FieldError; en?: FieldError }
  multiline?: boolean
  rows?: number
  hint?: string
}) {
  const C = multiline ? Textarea : Input
  return (
    <fieldset className="space-y-1.5">
      <legend className="mb-1.5 text-sm font-medium">{label}</legend>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor={`${name}-bn`} className="text-ink-muted text-xs">
            বাংলা
          </Label>
          <C
            id={`${name}-bn`}
            lang="bn"
            {...(multiline ? { rows } : {})}
            aria-invalid={!!errors?.bn}
            {...bn}
          />
          {errors?.bn?.message ? (
            <p className="text-destructive text-xs">{errors.bn.message}</p>
          ) : null}
        </div>
        <div className="space-y-1">
          <Label htmlFor={`${name}-en`} className="text-ink-muted text-xs">
            English
          </Label>
          <C
            id={`${name}-en`}
            lang="en"
            {...(multiline ? { rows } : {})}
            aria-invalid={!!errors?.en}
            {...en}
          />
          {errors?.en?.message ? (
            <p className="text-destructive text-xs">{errors.en.message}</p>
          ) : null}
        </div>
      </div>
      {hint ? <p className="text-ink-muted text-xs">{hint}</p> : null}
    </fieldset>
  )
}

export const linesToList = (v: string) =>
  v
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
export const listToLines = (v?: string[]) => (v ?? []).join('\n')
export const csvToList = (v: string) =>
  v
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

export function toSlug(v: string) {
  return v
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

type Uploaded = { url: string; publicId: string }

/** Uploads to Cloudinary via the authenticated admin endpoint, or accepts a pasted URL. */
export function ImageUploader({
  value,
  onChange,
  folder,
  label = 'Image',
  icon,
}: {
  value: Uploaded | null
  onChange: (v: Uploaded | null) => void
  folder: 'products' | 'categories' | 'articles'
  label?: string
  icon?: Parameters<typeof SmartImage>[0]['icon']
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [urlMode, setUrlMode] = useState(false)
  const [url, setUrl] = useState('')

  const upload = async (file: File) => {
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('folder', folder)
      const res = await api<Uploaded>('/api/admin/upload', { method: 'POST', body: form })
      onChange({ url: res.url, publicId: res.publicId })
      toast.success('Image uploaded to Cloudinary')
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      <div className="flex flex-wrap items-start gap-3">
        <div className="bg-muted relative size-28 shrink-0 overflow-hidden rounded-xl border">
          <SmartImage src={value?.url} alt="" icon={icon} sizes="112px" />
          {value ? (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="absolute top-1 right-1 rounded-full bg-white/90 p-1 shadow"
              aria-label="Remove image"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? <Loader2 className="animate-spin" /> : <ImagePlus />} Upload
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setUrlMode((v) => !v)}>
              <Link2 /> Use URL
            </Button>
          </div>
          {urlMode ? (
            <div className="flex gap-2">
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://res.cloudinary.com/…"
              />
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  if (!/^https?:\/\//.test(url)) return toast.error('Enter a valid http(s) URL')
                  onChange({ url, publicId: '' })
                  setUrl('')
                  setUrlMode(false)
                }}
              >
                Set
              </Button>
            </div>
          ) : null}
          <p className="text-ink-muted text-xs">
            JPEG, PNG, WebP or AVIF up to 8 MB. Images are optimised by Cloudinary on delivery.
          </p>
          {value?.url ? <p className="text-ink-muted truncate text-xs">{value.url}</p> : null}
        </div>
      </div>
    </div>
  )
}
