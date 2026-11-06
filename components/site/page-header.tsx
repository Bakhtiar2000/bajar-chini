import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export type Crumb = { label: string; href?: string }

export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cn('text-ink-muted text-sm', className)}>
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((c, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 ? <ChevronRight className="size-3.5" aria-hidden /> : null}
            {c.href ? (
              <Link href={c.href} className="hover:text-brand hover:underline">
                {c.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-ink">
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export function PageHeader({
  title,
  subtitle,
  crumbs,
  children,
}: {
  title: string
  subtitle?: string
  crumbs?: Crumb[]
  children?: React.ReactNode
}) {
  return (
    <div className="border-border from-soft-green to-cream border-b bg-gradient-to-b">
      <div className="container-page space-y-3 py-8 sm:py-10">
        {crumbs ? <Breadcrumbs items={crumbs} /> : null}
        <h1 className="text-brand-dark text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        {subtitle ? <p className="text-ink-muted max-w-2xl text-lg">{subtitle}</p> : null}
        {children}
      </div>
    </div>
  )
}
