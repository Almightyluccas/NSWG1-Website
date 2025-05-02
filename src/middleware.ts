import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  if (
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.startsWith('/auth') ||
    request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/images')
  ) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request })

  const requestHeaders = new Headers(request.headers)
  const currentPath = request.nextUrl.pathname + request.nextUrl.search
  requestHeaders.set('x-url', currentPath)

  if (!token && request.nextUrl.pathname.startsWith('/perscom')) {
    const url = new URL('/login', request.url)
    url.searchParams.set('callbackUrl', encodeURIComponent(currentPath))
    return NextResponse.redirect(url)
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|auth).*)',
  ],
}