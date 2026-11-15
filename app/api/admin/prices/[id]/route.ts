import { adminRoute } from '@/lib/api/handler'
import { ok, readJson } from '@/lib/api/response'
import { deletePriceRecord, updatePriceRecord } from '@/lib/services/prices'
import { priceRecordUpdateSchema } from '@/lib/validation/schemas'

type P = { id: string }

/** PATCH /api/admin/prices/[id] — correct an existing record (audit fields and timestamps are updated). */
// Collectors may correct their own drafts; the service blocks published records and status changes.
export const PATCH = adminRoute<P>(
  async (req, { id }, session) => {
    const patch = priceRecordUpdateSchema.parse(await readJson(req))
    return ok(await updatePriceRecord(id, patch, session))
  },
  { permission: 'prices:enter' },
)

export const DELETE = adminRoute<P>(
  async (_req, { id }, session) => {
    await deletePriceRecord(id, session)
    return ok({ id, deleted: true })
  },
  { permission: 'prices:delete' },
)
