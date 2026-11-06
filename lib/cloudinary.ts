import 'server-only'
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary'
import { ApiError } from '@/lib/api/response'

export function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET,
  )
}

function configure() {
  if (!isCloudinaryConfigured()) {
    throw new ApiError(
      503,
      'CLOUDINARY_NOT_CONFIGURED',
      'Image uploads are unavailable: set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.',
    )
  }
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  })
  return cloudinary
}

export const UPLOAD_FOLDERS = ['products', 'categories', 'articles'] as const
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number]

const MAX_BYTES = 8 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

export async function uploadImage(
  file: File,
  folder: UploadFolder,
): Promise<{ url: string; publicId: string; width: number; height: number }> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new ApiError(
      415,
      'UNSUPPORTED_MEDIA_TYPE',
      'Only JPEG, PNG, WebP or AVIF images are allowed',
    )
  }
  if (file.size > MAX_BYTES)
    throw new ApiError(413, 'FILE_TOO_LARGE', 'Image must be 8 MB or smaller')

  const client = configure()
  const buffer = Buffer.from(await file.arrayBuffer())
  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = client.uploader.upload_stream(
      {
        folder: `bajarchini/${folder}`,
        resource_type: 'image',
        // Normalise originals on upload; delivery transformations are applied per request.
        transformation: [{ width: 2000, height: 2000, crop: 'limit' }],
      },
      (error, res) => (error || !res ? reject(error ?? new Error('Upload failed')) : resolve(res)),
    )
    stream.end(buffer)
  })
  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
  }
}

export async function deleteImage(publicId: string) {
  if (!publicId || !isCloudinaryConfigured()) return
  try {
    await configure().uploader.destroy(publicId)
  } catch (error) {
    console.warn('[cloudinary] failed to delete', publicId, error)
  }
}
