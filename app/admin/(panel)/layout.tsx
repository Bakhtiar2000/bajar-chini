import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { getAdminSession } from '@/lib/auth/admin'
import { AdminShell } from '@/components/admin/shell'

/** Server-side gate: every admin page re-verifies the signed session cookie. */
async function Guard({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')
  return <AdminShell username={session.username}>{children}</AdminShell>
}

export default function PanelLayout({ children }: LayoutProps<'/admin'>) {
  return (
    <Suspense
      fallback={
        <div className="text-ink-muted flex min-h-dvh items-center justify-center">
          <Loader2 className="size-6 animate-spin" />
        </div>
      }
    >
      <Guard>{children}</Guard>
    </Suspense>
  )
}
