import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { routePermissions } from '@/config/roles';
import { roleHierarchy } from '@/types/database';

export async function middleware(request: NextRequest) {
  if (
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.startsWith('/auth') ||
    request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/images') ||
    request.nextUrl.pathname === '/unauthorized'
  ) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request });

  const requiredPermissionEntry = Object.entries(routePermissions).find(([path]) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (requiredPermissionEntry) {
    if (!token || token.error === 'RefreshAccessTokenError') {
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search));
      return NextResponse.redirect(url);
    }

    const permission = requiredPermissionEntry[1];
    const userRoles = (token.roles as string[]) || [];
    let hasPermission = false;

    if (permission.specificRoles) {
      if (permission.specificRoles.some(role => userRoles.includes(role))) {
        hasPermission = true;
      }
    }

    if (!hasPermission && permission.minimumRole) {
      const userLevel = Math.max(0, ...userRoles.map(role => roleHierarchy[role] || 0));
      const requiredLevel = roleHierarchy[permission.minimumRole] || Infinity;

      if (userLevel >= requiredLevel) {
        hasPermission = true;
      }
    }

    if (!hasPermission) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|auth).*)',
  ],
}