import { Hind_Siliguri, Inter } from 'next/font/google'

export const hind = Hind_Siliguri({
  subsets: ['bengali', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-bengali',
  display: 'swap',
})

export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-latin',
  display: 'swap',
})
