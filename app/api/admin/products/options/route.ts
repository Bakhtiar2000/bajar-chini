import { adminRoute } from '@/lib/api/handler'
import { ok } from '@/lib/api/response'
import { adminProductOptions } from '@/lib/data/admin'

export const GET = adminRoute(async () => ok(await adminProductOptions()))
