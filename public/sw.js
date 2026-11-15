/*
 * Bajarchini service worker — makes previously visited pages, prices and
 * guides available offline (useful in a crowded bajar with a weak signal).
 *
 * - Pages: network first, fall back to the cached copy, then /offline.html.
 * - Public JSON APIs: stale-while-revalidate.
 * - Build assets (/_next/static, icons, fonts, images): cache first.
 * - Never caches /admin or /api/admin, and only handles same-origin GETs.
 */

const VERSION = 'v1'
const PAGES = `bc-pages-${VERSION}`
const DATA = `bc-data-${VERSION}`
const ASSETS = `bc-assets-${VERSION}`
const OFFLINE_URL = '/offline.html'
const MAX_PAGES = 60
const MAX_DATA = 80

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(PAGES)
      .then((cache) => cache.addAll([OFFLINE_URL, '/icon.svg']))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith('bc-') && ![PAGES, DATA, ASSETS].includes(k))
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

async function trim(cacheName, max) {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i])
}

async function networkFirstPage(request) {
  const cache = await caches.open(PAGES)
  try {
    const response = await fetch(request)
    if (response.ok && response.type === 'basic') {
      cache.put(request, response.clone()).then(() => trim(PAGES, MAX_PAGES))
    }
    return response
  } catch {
    return (
      (await cache.match(request, { ignoreVary: true })) ||
      (await cache.match(OFFLINE_URL)) ||
      Response.error()
    )
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(DATA)
  const cached = await cache.match(request)
  const network = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone()).then(() => trim(DATA, MAX_DATA))
      return response
    })
    .catch(() => cached || Response.error())
  return cached || network
}

async function cacheFirst(request) {
  const cache = await caches.open(ASSETS)
  const cached = await cache.match(request)
  if (cached) return cached
  const response = await fetch(request)
  if (response.ok) cache.put(request, response.clone())
  return response
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/api/admin')) return
  if (url.pathname === '/sw.js') return

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstPage(request))
    return
  }
  if (url.pathname.startsWith('/api/')) {
    // Downloads are large and change monthly; let the browser handle them.
    if (url.pathname.startsWith('/api/open-data')) return
    event.respondWith(staleWhileRevalidate(request))
    return
  }
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/_next/image') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname === '/icon.svg'
  ) {
    event.respondWith(cacheFirst(request))
  }
})
