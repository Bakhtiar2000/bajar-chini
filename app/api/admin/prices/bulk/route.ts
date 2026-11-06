import { adminRoute } from '@/lib/api/handler'
import { ok, readJson } from '@/lib/api/response'
import { bulkSavePrices } from '@/lib/services/prices'
import { bulkSaveSchema } from '@/lib/validation/schemas'

/**
 * POST /api/admin/prices/bulk — upserts one month's observations for one market.
 * Valid rows are saved; invalid rows are reported back. Other months are never touched.
 */
export const POST = adminRoute(async (req, _params, session) => {
  const input = bulkSaveSchema.parse(await readJson(req))
  const result = await bulkSavePrices(input, session.username)
  return ok(result, { status: result.errors.length && !result.saved ? 422 : 200 })
})
