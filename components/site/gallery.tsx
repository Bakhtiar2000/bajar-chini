'use client'

import { useState } from 'react'
import type { CategoryIcon, ImageDTO } from '@/lib/types'
import { cn } from '@/lib/utils'
import { SmartImage } from './smart-image'

export function Gallery({
  images,
  alt,
  icon,
}: {
  images: ImageDTO[]
  alt: string
  icon: CategoryIcon
}) {
  const [index, setIndex] = useState(0)
  const current = images[index]
  return (
    <div className="space-y-3">
      <div className="bg-muted relative aspect-[4/3] overflow-hidden rounded-2xl shadow-sm ring-1 ring-black/5">
        <SmartImage
          src={current?.url}
          alt={alt}
          icon={icon}
          label={alt}
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>
      {images.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.url}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`${alt} ${i + 1}`}
              aria-pressed={i === index}
              className={cn(
                'relative size-16 shrink-0 overflow-hidden rounded-lg ring-2 transition sm:size-20',
                i === index ? 'ring-brand' : 'opacity-70 ring-transparent hover:opacity-100',
              )}
            >
              <SmartImage src={img.url} alt="" icon={icon} sizes="80px" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
