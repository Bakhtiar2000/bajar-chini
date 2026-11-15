import type { Metadata } from 'next'
import { AdminPageHeader } from '@/components/admin/shell'
import { MarketsManager } from '@/components/admin/markets-manager'

export const metadata: Metadata = { title: 'Markets' }

export default function AdminMarketsPage() {
  return (
    <>
      <AdminPageHeader
        title="Markets"
        description="Each market keeps its own independent price history. The default reference market is shown on public product cards."
      />
      <MarketsManager />
    </>
  )
}
