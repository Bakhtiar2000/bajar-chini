import { adminRoute } from '@/lib/api/handler'
import { ok, readJson } from '@/lib/api/response'
import { setPublication } from '@/lib/services/prices'
import { publishSchema } from '@/lib/validation/schemas'

/** POST /api/admin/prices/publish { marketId, month, year, action, productIds? } */
export const POST = adminRoute(async (req) => {
  const input = publishSchema.parse(await readJson(req))
  return ok(await setPublication(input))
})
