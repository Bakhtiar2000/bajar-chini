import { NextResponse, type NextRequest } from 'next/server'
import { defaultLocale, LOCALE_COOKIE } from '@/i18n/config'
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth/session'

/**
 * - Bengali (default) is served from clean URLs: "/products/rui-fish" → internally "/bn/products/rui-fish".
 * - English lives under "/en/...".
 * - A visitor who chose English (cookie) and opens a clean URL is redirected to the English page.
 * - Admin pages get an optimistic session check here; every admin API/page verifies again on the server.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  if (pathname.startsWith('/admin')) {
    const isLogin = pathname === '/admin/login'
    const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value)
    if (!session && !isLogin) {
      const url = new URL('/admin/login', request.url)
      if (pathname !== '/admin') url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }
    if (session && (isLogin || pathname === '/admin')) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
    const res = NextResponse.next()
    res.headers.set('X-Robots-Tag', 'noindex, nofollow')
    return res
  }

  if (pathname === '/en' || pathname.startsWith('/en/')) return NextResponse.next()

  // Never expose the default locale prefix; canonical Bengali URLs have no prefix.
  if (pathname === `/${defaultLocale}` || pathname.startsWith(`/${defaultLocale}/`)) {
    const stripped = pathname.slice(defaultLocale.length + 1) || '/'
    return NextResponse.redirect(new URL(`${stripped}${search}`, request.url), 308)
  }

  if (request.cookies.get(LOCALE_COOKIE)?.value === 'en') {
    const target = pathname === '/' ? '/en' : `/en${pathname}`
    return NextResponse.redirect(new URL(`${target}${search}`, request.url))
  }

  const url = request.nextUrl.clone()
  url.pathname = pathname === '/' ? `/${defaultLocale}` : `/${defaultLocale}${pathname}`
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
}
