import * as React from 'react'
import { Label as LabelPrimitive, Separator as SeparatorPrimitive } from 'radix-ui'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        'text-sm leading-none font-medium select-none peer-disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

function Separator({
  className,
  orientation = 'horizontal',
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      decorative
      orientation={orientation}
      className={cn(
        'bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px',
        className,
      )}
      {...props}
    />
  )
}

function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card"
      className={cn(
        'border-border bg-card text-card-foreground rounded-2xl border shadow-sm',
        className,
      )}
      {...props}
    />
  )
}
function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex flex-col gap-1.5 p-5', className)} {...props} />
}
function CardTitle({ className, ...props }: React.ComponentProps<'h3'>) {
  return <h3 className={cn('text-lg leading-tight font-semibold', className)} {...props} />
}
function CardDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return <p className={cn('text-muted-foreground text-sm', className)} {...props} />
}
function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('p-5 pt-0', className)} {...props} />
}

const badgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center justify-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap [&>svg]:size-3',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-soft-green text-brand-dark',
        outline: 'border-border bg-white text-foreground',
        warning: 'border-amber-200 bg-amber-50 text-amber-800',
        muted: 'border-transparent bg-muted text-muted-foreground',
        destructive: 'border-red-200 bg-red-50 text-red-700',
        info: 'border-sky-200 bg-sky-50 text-sky-800',
        demo: 'border-dashed border-amber-400 bg-amber-50 text-amber-800',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
}

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('bg-muted animate-pulse rounded-lg', className)}
      {...props}
    />
  )
}

function Alert({
  className,
  variant = 'info',
  ...props
}: React.ComponentProps<'div'> & { variant?: 'info' | 'warning' | 'danger' | 'success' }) {
  const styles = {
    info: 'border-sky-200 bg-sky-50 text-sky-900',
    warning: 'border-amber-200 bg-amber-50 text-amber-900',
    danger: 'border-red-200 bg-red-50 text-red-900',
    success: 'border-green-200 bg-soft-green text-brand-dark',
  }[variant]
  return (
    <div
      role="note"
      className={cn(
        'flex gap-3 rounded-xl border p-4 text-sm leading-relaxed [&>svg]:mt-0.5 [&>svg]:size-5 [&>svg]:shrink-0',
        styles,
        className,
      )}
      {...props}
    />
  )
}

export {
  Label,
  Separator,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  badgeVariants,
  Skeleton,
  Alert,
}
