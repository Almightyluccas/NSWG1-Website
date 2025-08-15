import { NextResponse } from 'next/server';
import type { NextRequest, NextMiddleware } from 'next/server';
import { getToken, encode, JWT } from 'next-auth/jwt';
import { routePermissions } from '@/config/roles';
import { roleHierarchy } from '@/types/database';
import {RefreshTokenResponse} from "@/types/nswg1Api";

const SESSION_TIMEOUT = 60 * 60 * 24 * 30; // 30 days
const TOKEN_REFRESH_BUFFER_SECONDS = 300; // 5 minutes
const SESSION_SECURE = process.env.NEXTAUTH_URL?.startsWith("https://");
const SESSION_COOKIE = SESSION_SECURE ? "__Secure-next-auth.session-token" : "next-auth.session-token";


function shouldUpdateToken(token: JWT): boolean {
  const timeInSeconds: number = Math.floor(Date.now() / 1000);
  const expiresAt = token.expires_at as number;
  return timeInSeconds >= expiresAt - TOKEN_REFRESH_BUFFER_SECONDS;
}

async function refreshAccessToken(token: JWT, request: NextRequest): Promise<JWT> {
  try {
    const refreshApiUrl = new URL('/api/auth/refresh', request.url);

    const response: Response = await fetch(refreshApiUrl, {
      method: "POST",
      headers: {
        'cookie': request.headers.get('cookie') ?? '',
      },
    });

    const refreshedTokens: RefreshTokenResponse = await response.json();

    if (!response.ok || 'error' in refreshedTokens) {
      console.error("Failed to refresh token via internal API:", refreshedTokens);
      throw new Error("Failed to refresh token.");
    }

    return {
      ...token,
      access_token: refreshedTokens.access_token,
      expires_in: refreshedTokens.expires_in,
      refresh_token: refreshedTokens.refresh_token ?? token.refresh_token,
    };
  } catch (error) {
    console.error("Error in refreshAccessToken function:", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

function updateCookie(
  sessionToken: string | null,
  request: NextRequest,
): NextResponse<unknown> {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  if (sessionToken) {
    request.cookies.set(SESSION_COOKIE, sessionToken);
    response.cookies.set(SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      maxAge: SESSION_TIMEOUT,
      secure: SESSION_SECURE,
      sameSite: "lax"
    });
  } else {
    request.cookies.delete(SESSION_COOKIE);
    response = NextResponse.redirect(new URL('/api/auth/signin', request.url));
    response.cookies.delete(SESSION_COOKIE);
  }

  return response;
}

export const middleware: NextMiddleware = async (request: NextRequest) => {
  const token: JWT | null = await getToken({ req: request });

  if (!token) {
    const isProtectedRoute = Object.keys(routePermissions).some(path => request.nextUrl.pathname.startsWith(path));
    if (isProtectedRoute) {
      const loginUrl = new URL('/login', request.url);

      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  let response = NextResponse.next();

  if (shouldUpdateToken(token)) {
    const refreshedToken: JWT = await refreshAccessToken(token, request);

    if (refreshedToken.error) {
      const loginUrl = new URL('/login', request.url);

      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete(SESSION_COOKIE);
      return res;
    }

    const newSessionToken: string = await encode({
      secret: process.env.NEXTAUTH_SECRET!,
      token: refreshedToken,
      maxAge: SESSION_TIMEOUT
    });

    Object.assign(token, refreshedToken);

    response = updateCookie(newSessionToken, request);
  }

  const requiredPermissionEntry = Object.entries(routePermissions).find(([path]) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (requiredPermissionEntry) {
    const permission = requiredPermissionEntry[1];
    const userRoles = (token.roles as string[]) || [];
    let hasPermission = false;

    if (permission.specificRoles?.some(role => userRoles.includes(role))) {
      hasPermission = true;
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

  return response;
};

export const config = {
  matcher: [
    '/((?!api/auth/|static|.*\\..*|_next).*)',
  ],
};