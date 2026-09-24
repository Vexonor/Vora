import { AUTH_COOKIE_NAME } from "@/lib/auth-session";
import { ROLE_ROUTE_PREFIX, isPathAllowedForRole } from "@/lib/role-routes";
import { UserRole } from "@/types/user";
import { NextRequest, NextResponse } from "next/server";

const PROTECTED_ROLES = Object.keys(ROLE_ROUTE_PREFIX).map(Number) as UserRole[];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const requiredRole = PROTECTED_ROLES.find((role) => isPathAllowedForRole(pathname, role));
  if (requiredRole === undefined) return NextResponse.next();

  const accessToken = request.cookies.get(AUTH_COOKIE_NAME.accessToken)?.value;
  if (!accessToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const userRoleCookie = request.cookies.get(AUTH_COOKIE_NAME.userRole)?.value;
  if (userRoleCookie === undefined || Number(userRoleCookie) !== requiredRole) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/manager/:path*", "/cashier/:path*", "/kitchen/:path*"],
};
