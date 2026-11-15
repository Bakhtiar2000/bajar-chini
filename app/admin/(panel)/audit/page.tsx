import type { Metadata } from 'next'
import { connection } from 'next/server'
import { requirePagePermission } from '@/lib/auth/admin'
import { adminListMarkets } from '@/lib/data/admin'
import { AdminPageHeader } from '@/components/admin/shell'
import { AuditLog } from '@/components/admin/audit-log'

export const metadata: Metadata = { title: 'Audit log' }

export default async function AdminAuditPage() {
  await connection()
  await requirePagePermission('audit:view')
  const markets = await adminListMarkets()
  return (
    <>
      <AdminPageHeader
        title="Audit log"
        description="Every change to monthly prices — who changed what, when, and the values before and after. Entries are never edited or removed."
      />
      <AuditLog markets={markets} />
    </>
  )
}
