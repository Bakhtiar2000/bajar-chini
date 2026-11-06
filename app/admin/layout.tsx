import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import '../globals.css'
import { hind, inter } from '@/lib/fonts'

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s · Bajarchini Admin' },
  robots: { index: false, follow: false, nocache: true },
}

export default function AdminRootLayout({ children }: LayoutProps<'/admin'>) {
  return (
    <html lang="en" className={`${hind.variable} ${inter.variable}`}>
      <body className="min-h-dvh bg-[#f6f5f0]">
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  )
}
