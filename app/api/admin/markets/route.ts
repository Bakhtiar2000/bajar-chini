import { adminRoute } from '@/lib/api/handler'
import { created, ok, readJson } from '@/lib/api/response'
import { adminListMarkets } from '@/lib/data/admin'
import { createMarket } from '@/lib/services/catalog'
import { marketCreateSchema } from '@/lib/validation/schemas'

export const GET = adminRoute(async () => ok(await adminListMarkets()))

export const POST = adminRoute(async (req) => {
  const input = marketCreateSchema.parse(await readJson(req))
  const doc = await createMarket(input)
  return created({ id: String(doc._id) })
})
