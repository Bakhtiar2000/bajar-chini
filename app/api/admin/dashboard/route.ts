import { adminRoute } from '@/lib/api/handler'
import { ok } from '@/lib/api/response'
import { getDashboardStats } from '@/lib/services/dashboard'

export const GET = adminRoute(async () => ok(await getDashboardStats()))
