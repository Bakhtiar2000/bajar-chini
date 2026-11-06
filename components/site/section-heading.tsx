import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SectionHeading({
  title,
  subtitle,
  href,
  linkLabel,
  className,
  id,
}: {
  title: string
  subtitle?: string
  href?: string
  linkLabel?: string
  className?: string
  id?: string
}) {
  return (
    <div className={cn('mb-6 flex flex-wrap items-end justify-between gap-3', className)}>
      <div>
        <h2 id={id} className="text-ink text-2xl font-bold tracking-tight sm:text-3xl">
          {title}
        </h2>
        {subtitle ? <p className="text-ink-muted mt-1.5">{subtitle}</p> : null}
      </div>
      {href && linkLabel ? (
        <Link
          href={href}
          className="group text-brand hover:text-brand-dark inline-flex items-center gap-1 font-medium"
        >
          {linkLabel}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      ) : null}
    </div>
  )
}
