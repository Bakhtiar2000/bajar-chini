'use client'

import Image, { type ImageLoaderProps } from 'next/image'
import { useState } from 'react'
import { cloudinaryTransform, isCloudinaryUrl } from '@/lib/image-url'
import { cn } from '@/lib/utils'
import type { CategoryIcon } from '@/lib/types'
import { CATEGORY_ICONS, CATEGORY_TINTS } from './category-icon'

const cloudinaryLoader = ({ src, width, quality }: ImageLoaderProps) =>
  cloudinaryTransform(src, { width }).replace('q_auto', quality ? `q_${quality}` : 'q_auto')

type Props = {
  src?: string | null
  alt: string
  icon?: CategoryIcon
  label?: string
  sizes?: string
  priority?: boolean
  className?: string
  imgClassName?: string
}

/**
 * Fills its (relatively positioned) parent. Uses Cloudinary transformations
 * for Cloudinary URLs, Next.js optimisation for others, and falls back to an
 * illustrated tile when there is no image or the image fails to load.
 */
export function SmartImage({
  src,
  alt,
  icon = 'other',
  label,
  sizes = '100vw',
  priority,
  className,
  imgClassName,
}: Props) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    const Icon = CATEGORY_ICONS[icon]
    const tint = CATEGORY_TINTS[icon]
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          'absolute inset-0 flex flex-col items-center justify-center gap-2 overflow-hidden',
          className,
        )}
        style={{ backgroundColor: tint.bg, color: tint.fg }}
      >
        <svg
          aria-hidden
          className="absolute inset-0 h-full w-full opacity-[0.07]"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern id={`dots-${icon}`} width="18" height="18" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.6" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#dots-${icon})`} />
        </svg>
        <Icon className="relative size-1/4 max-h-16 min-h-8 max-w-16 min-w-8" strokeWidth={1.5} />
        {label ? (
          <span className="relative line-clamp-1 px-3 text-center text-sm font-semibold">
            {label}
          </span>
        ) : null}
      </div>
    )
  }

  const cloudinary = isCloudinaryUrl(src)
  // Hosts outside next.config images.remotePatterns are rendered without the optimiser.
  const knownHost =
    cloudinary || src.startsWith('https://images.unsplash.com/') || src.startsWith('/')

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={!knownHost}
      loader={cloudinary ? cloudinaryLoader : undefined}
      onError={() => setFailed(true)}
      className={cn('object-cover', imgClassName)}
    />
  )
}
