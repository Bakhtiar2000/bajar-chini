import { publicRoute } from '@/lib/api/handler'
import { badRequest, ok } from '@/lib/api/response'
import { getOpenData } from '@/lib/data/public'
import { toCsv } from '@/lib/csv'

const COLUMNS = [
  'product',
  'productBn',
  'productEn',
  'category',
  'market',
  'marketBn',
  'marketEn',
  'year',
  'month',
  'minimumPrice',
  'maximumPrice',
  'referencePrice',
  'currency',
  'unit',
  'observedAt',
  'sourceType',
  'isDemo',
] as const

/**
 * GET /api/open-data/prices?format=csv|json&market=<slug>&year=2026&month=11
 * All PUBLISHED monthly observations (drafts are never included).
 */
export const GET = publicRoute(async (req) => {
  const sp = req.nextUrl.searchParams
  const format = sp.get('format') ?? 'json'
  if (format !== 'csv' && format !== 'json') throw badRequest('format must be csv or json')
  const market = sp.get('market')?.trim().toLowerCase() || undefined
  if (market && !/^[a-z0-9-]{1,100}$/.test(market)) throw badRequest('invalid market slug')
  const year = sp.get('year') ? Number(sp.get('year')) : undefined
  const month = sp.get('month') ? Number(sp.get('month')) : undefined
  if (year !== undefined && !(Number.isInteger(year) && year >= 2000 && year <= 2100))
    throw badRequest('invalid year')
  if (month !== undefined && !(Number.isInteger(month) && month >= 1 && month <= 12))
    throw badRequest('invalid month')

  const rows = await getOpenData({ market, year, month })
  const headers = {
    'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    'Access-Control-Allow-Origin': '*',
  }
  const name = ['bajarchini-prices', market, year, month].filter(Boolean).join('-')

  if (format === 'csv') {
    const csv = toCsv(
      [...COLUMNS],
      rows.map((r) => COLUMNS.map((c) => r[c])),
    )
    return new Response(csv, {
      headers: {
        ...headers,
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${name}.csv"`,
      },
    })
  }
  return ok(
    {
      license:
        'Credit "Bajarchini". Observations at named reference markets; not official or live prices. isDemo=true rows are illustrative only.',
      count: rows.length,
      rows,
    },
    { headers },
  )
})
