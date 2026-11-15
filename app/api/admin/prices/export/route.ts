import { adminRoute } from '@/lib/api/handler'
import { toCsv } from '@/lib/csv'
import { getMonthlySheet } from '@/lib/services/prices'
import { monthlyQuerySchema } from '@/lib/validation/schemas'

const EXPORT_COLUMNS = [
  'slug',
  'product_bn',
  'product_en',
  'category',
  'unit',
  'min',
  'max',
  'notes',
  'status',
  'previous_min',
  'previous_max',
] as const

/**
 * GET /api/admin/prices/export?marketId=&month=&year= — the month's entry sheet as CSV.
 * Fill in min / max / unit / notes and import it back in the bulk editor.
 */
export const GET = adminRoute(
  async (req) => {
    const { marketId, month, year } = monthlyQuerySchema.parse(
      Object.fromEntries(req.nextUrl.searchParams),
    )
    const sheet = await getMonthlySheet(marketId, month, year)
    const rows = sheet.rows.map((r) => [
      r.product.slug,
      r.product.name.bn,
      r.product.name.en,
      r.product.category?.name.en ?? '',
      r.current?.unit.key ?? r.product.defaultUnit.key,
      r.current?.minimumPrice ?? '',
      r.current?.maximumPrice ?? '',
      r.current?.notes ?? '',
      r.current?.status ?? 'NOT_ENTERED',
      r.previous?.minimumPrice ?? '',
      r.previous?.maximumPrice ?? '',
    ])
    const name = `prices-${sheet.market.slug}-${year}-${String(month).padStart(2, '0')}.csv`
    return new Response(toCsv([...EXPORT_COLUMNS], rows), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${name}"`,
        'Cache-Control': 'no-store',
      },
    })
  },
  { permission: 'prices:enter' },
)
