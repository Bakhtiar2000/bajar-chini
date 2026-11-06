import { adminRoute } from '@/lib/api/handler'
import { ok } from '@/lib/api/response'
import { getMonthlySheet } from '@/lib/services/prices'
import { monthlyQuerySchema } from '@/lib/validation/schemas'

/** GET /api/admin/prices/monthly?marketId=&month=&year= — active products with this and the previous month's records. */
export const GET = adminRoute(async (req) => {
  const { marketId, month, year } = monthlyQuerySchema.parse(
    Object.fromEntries(req.nextUrl.searchParams),
  )
  return ok(await getMonthlySheet(marketId, month, year))
})
