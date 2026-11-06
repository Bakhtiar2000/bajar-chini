import { cn } from '@/lib/utils'

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden className={cn('size-9', className)}>
      <rect width="40" height="40" rx="11" fill="#166534" />
      {/* basket */}
      <path d="M9 18h22l-2.4 11.2A3 3 0 0 1 25.7 32H14.3a3 3 0 0 1-2.9-2.8L9 18Z" fill="#FAF7F0" />
      <path
        d="M14 18c0-4 2.7-7 6-7s6 3 6 7"
        fill="none"
        stroke="#FAF7F0"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {/* leaf */}
      <path
        d="M20 22.5c2.6-2.4 5.6-2.2 6.6-2-0.2 2.4-2 5.4-6.6 4.6 0 0-.3-1.4 0-2.6Z"
        fill="#F59E0B"
      />
      <path d="M15 24.5h3.5M15 27.5h7" stroke="#166534" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function Logo({ name, className }: { name: string; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <LogoMark />
      <span className="text-brand-dark text-xl leading-none font-bold tracking-tight">{name}</span>
    </span>
  )
}
