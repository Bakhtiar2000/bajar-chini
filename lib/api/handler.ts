import 'server-only'
import type { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import type { AdminSession } from '@/lib/auth/session'
import { assertObjectId, handleError } from './response'

type Ctx<P> = { params: Promise<P> }

/** Wraps a public handler with consistent error handling. */
export function publicRoute<P = object>(fn: (req: NextRequest, params: P) => Promise<Response>) {
  return async (req: NextRequest, ctx: Ctx<P>) => {
    try {
      return await fn(req, await ctx.params)
    } catch (error) {
      return handleError(error)
    }
  }
}

/** Wraps an admin handler: authenticates + authorises on the server before running. */
export function adminRoute<P = object>(
  fn: (req: NextRequest, params: P, session: AdminSession) => Promise<Response>,
) {
  return async (req: NextRequest, ctx: Ctx<P>) => {
    try {
      const session = await requireAdmin(req)
      const params = await ctx.params
      if (params && typeof params === 'object' && 'id' in params)
        assertObjectId(String((params as { id: string }).id))
      return await fn(req, params, session)
    } catch (error) {
      return handleError(error)
    }
  }
}

export function pageParams(req: NextRequest, defaults = { page: 1, limit: 20 }, maxLimit = 100) {
  const sp = req.nextUrl.searchParams
  const page = Math.max(1, Number.parseInt(sp.get('page') ?? '', 10) || defaults.page)
  const limit = Math.min(
    maxLimit,
    Math.max(1, Number.parseInt(sp.get('limit') ?? '', 10) || defaults.limit),
  )
  return { page, limit, skip: (page - 1) * limit }
}
