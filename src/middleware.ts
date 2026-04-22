import { NextResponse } from "next/server";
import type { NextRequest, NextMiddleware } from "next/server";
import { getToken } from "next-auth/jwt";
import { routePermissions } from "@/config/roles";
import { roleHierarchy } from "@/types/database";

const SESSION_SECURE = process.env.NEXTAUTH_URL?.startsWith("https://");
const SESSION_COOKIE_NAME = SESSION_SECURE
  ? "__Secure-next-auth.session-token"
  : "next-auth.session-token";

export const middleware: NextMiddleware = async (request: NextRequest) => {
  const token = await getToken({ req: request });

  if (!token) {
    const isProtectedRoute = Object.keys(routePermissions).some((path) =>
      request.nextUrl.pathname.startsWith(path)
    );
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  const response = NextResponse.next();
  if (token.rememberMe === false) {
    const currentCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (currentCookie) {
      response.cookies.set(SESSION_COOKIE_NAME, currentCookie, {
        httpOnly: true,
        secure: Boolean(SESSION_SECURE),
        sameSite: "lax",
        path: "/",
      });
    }
  }

  const requiredPermissionEntry = Object.entries(routePermissions).find(
    ([path]) => request.nextUrl.pathname.startsWith(path)
  );

  if (requiredPermissionEntry) {
    const permission = requiredPermissionEntry[1];
    const userRoles = (token.roles as string[]) || [];
    let hasPermission = false;

    if (permission.specificRoles?.some((role) => userRoles.includes(role))) {
      hasPermission = true;
    }

    if (!hasPermission && permission.minimumRole) {
      const userLevel = Math.max(
        0,
        ...userRoles.map((role) => roleHierarchy[role] || 0)
      );
      const requiredLevel = roleHierarchy[permission.minimumRole] || Infinity;
      if (userLevel >= requiredLevel) {
        hasPermission = true;
      }
    }

    if (!hasPermission) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  return response;
};

export const config = {
  matcher: ["/((?!api/auth/|static|.*\\..*|_next).*)"],
};
