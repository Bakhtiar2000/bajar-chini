import type { Metadata } from 'next'
import { connection } from 'next/server'
import { requirePagePermission } from '@/lib/auth/admin'
import { AdminPageHeader } from '@/components/admin/shell'
import { UsersManager } from '@/components/admin/users-manager'

export const metadata: Metadata = { title: 'Users' }

export default async function AdminUsersPage() {
  await connection()
  const session = await requirePagePermission('users:manage')
  return (
    <>
      <AdminPageHeader
        title="Users"
        description="Give field collectors their own accounts so they can enter draft prices, while editors review and publish."
      />
      <UsersManager currentUserId={session.sub} />
    </>
  )
}
