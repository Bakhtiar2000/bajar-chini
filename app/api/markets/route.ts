import { publicRoute } from '@/lib/api/handler'
import { ok } from '@/lib/api/response'
import { getActiveMarkets } from '@/lib/data/public'

export const GET = publicRoute(async () => ok(await getActiveMarkets()))
