/**
 * Adds Cloudinary delivery transformations (auto format/quality + resize)
 * to a Cloudinary URL. Non-Cloudinary URLs are returned unchanged.
 */
export function cloudinaryTransform(
  url: string,
  opts: { width?: number; height?: number; crop?: 'fill' | 'limit' } = {},
) {
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url
  const parts = ['f_auto', 'q_auto']
  if (opts.width) parts.push(`w_${Math.round(opts.width)}`)
  if (opts.height) parts.push(`h_${Math.round(opts.height)}`)
  if (opts.width || opts.height) parts.push(`c_${opts.crop ?? 'limit'}`)
  return url.replace('/upload/', `/upload/${parts.join(',')}/`)
}

export function isCloudinaryUrl(url: string) {
  return url.includes('res.cloudinary.com')
}
