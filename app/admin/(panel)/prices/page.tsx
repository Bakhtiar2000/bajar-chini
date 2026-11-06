import type { Metadata } from 'next'
import { connection } from 'next/server'
import { adminListMarkets } from '@/lib/data/admin'
import { currentYearMonth } from '@/lib/prices/now'
import { AdminPageHeader } from '@/components/admin/shell'
import { PricesTabs } from '@/components/admin/prices-tabs'

export const metadata: Metadata = { title: 'Monthly prices' }

export default async function AdminPricesPage({ searchParams }: PageProps<'/admin/prices'>) {
  await connection()
  const [markets, sp] = await Promise.all([adminListMarkets(), searchParams])
  const tab = sp.tab === 'history' ? 'history' : 'entry'
  const marketId = typeof sp.marketId === 'string' ? sp.marketId : undefined
  return (
    <>
      <AdminPageHeader
        title="Monthly prices"
        description="Record the minimum and maximum price observed at the market for each product. Missing products stay missing — nothing is copied forward automatically."
      />
      <PricesTabs
        markets={markets}
        now={currentYearMonth()}
        initialTab={tab}
        initialMarketId={marketId}
      />
    </>
  )
}
