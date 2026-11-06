'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  ChartLine,
  ExternalLink,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Store,
  Tags,
} from 'lucide-react'
import { LogoMark } from '@/components/site/logo'
import { Dialog, DialogTitle, SheetContent } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { api } from '@/lib/client-api'

const NAV = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/prices', label: 'Monthly prices', icon: ChartLine },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: Tags },
  { href: '/admin/markets', label: 'Markets', icon: Store },
  { href: '/admin/articles', label: 'Articles', icon: FileText },
]

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <nav className="flex flex-col gap-1" aria-label="Admin">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              active
                ? 'bg-white/15 text-white'
                : 'text-green-100 hover:bg-white/10 hover:text-white',
            )}
          >
            <Icon className="size-4" /> {label}
          </Link>
        )
      })}
    </nav>
  )
}

export function AdminShell({
  username,
  children,
}: {
  username: string
  children: React.ReactNode
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const logout = async () => {
    await api('/api/admin/auth/logout', { method: 'POST' }).catch(() => {})
    router.replace('/admin/login')
    router.refresh()
  }

  const footer = (
    <div className="mt-auto space-y-2 border-t border-white/10 pt-4 text-sm">
      <a
        href="/"
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-2 px-3 py-1.5 text-green-100 hover:text-white"
      >
        <ExternalLink className="size-4" /> View site
      </a>
      <p className="px-3 text-xs text-green-200/70">Signed in as {username}</p>
      <button
        type="button"
        onClick={logout}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-green-100 hover:bg-white/10 hover:text-white"
      >
        <LogOut className="size-4" /> Sign out
      </button>
    </div>
  )

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="bg-brand-dark sticky top-0 hidden h-dvh flex-col gap-6 p-4 lg:flex">
        <Link href="/admin/dashboard" className="flex items-center gap-2 px-2 pt-1">
          <LogoMark className="size-8" />
          <span className="font-bold text-white">Bajarchini Admin</span>
        </Link>
        <NavLinks />
        {footer}
      </aside>

      <header className="bg-brand-dark sticky top-0 z-30 flex h-14 items-center justify-between border-b px-4 lg:hidden">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <LogoMark className="size-7" />
          <span className="font-bold text-white">Admin</span>
        </Link>
        <Dialog open={open} onOpenChange={setOpen}>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-lg p-2 text-white"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>
          <SheetContent
            side="left"
            className="bg-brand-dark text-white"
            aria-describedby={undefined}
          >
            <DialogTitle className="text-white">Bajarchini Admin</DialogTitle>
            <NavLinks onNavigate={() => setOpen(false)} />
            {footer}
          </SheetContent>
        </Dialog>
      </header>

      <main className="min-w-0 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  )
}

export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-ink text-2xl font-bold">{title}</h1>
        {description ? <p className="text-ink-muted mt-1 text-sm">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  )
}
