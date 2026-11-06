import { adminRoute } from '@/lib/api/handler'
import { badRequest, created } from '@/lib/api/response'
import { UPLOAD_FOLDERS, uploadImage, type UploadFolder } from '@/lib/cloudinary'

/** POST multipart/form-data { file, folder } → Cloudinary. Returns { url, publicId, width, height }. */
export const POST = adminRoute(async (req) => {
  const form = await req.formData()
  const file = form.get('file')
  const folder = String(form.get('folder') ?? 'products') as UploadFolder
  if (!(file instanceof File)) throw badRequest('A file is required')
  if (!UPLOAD_FOLDERS.includes(folder)) throw badRequest('Invalid folder')
  return created(await uploadImage(file, folder))
})
