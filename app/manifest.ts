import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'বাজারচিনি · Bajarchini',
    short_name: 'বাজারচিনি',
    description:
      'বাজার চিনি, ভালো পণ্য কিনি — পণ্য চেনা, মান যাচাই ও মাসিক বাজারদর। Know your bajar: product identification, quality checks and monthly market prices.',
    lang: 'bn',
    dir: 'ltr',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#FAF7F0',
    theme_color: '#166534',
    categories: ['shopping', 'food', 'lifestyle'],
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'বাজারদর · Prices', url: '/prices' },
      { name: 'বাজারের তালিকা · Bajar list', url: '/list' },
      { name: 'খুঁজুন · Search', url: '/search' },
    ],
  }
}
