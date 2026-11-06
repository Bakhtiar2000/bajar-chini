import type { Metadata } from 'next'
import { Suspense } from 'react'
import { LoginForm } from '@/components/admin/login-form'
import { LogoMark } from '@/components/site/logo'

export const metadata: Metadata = { title: 'Sign in' }

export default function LoginPage() {
  return (
    <div className="from-soft-green to-cream flex min-h-dvh items-center justify-center bg-gradient-to-b p-4">
      <div className="border-border w-full max-w-sm rounded-2xl border bg-white p-6 shadow-lg sm:p-8">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <LogoMark className="size-12" />
          <h1 className="text-ink text-xl font-bold">Bajarchini Admin</h1>
          <p className="text-ink-muted text-sm">Sign in to manage products and monthly prices.</p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
