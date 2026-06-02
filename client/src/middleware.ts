import { NextRequest, NextResponse } from "next/server";

const ROLE_CASHIER = 0;
const ROLE_KITCHEN = 1;
const ROLE_MANAGER = 2;

const ROUTE_ROLES: { prefix: string; role: number }[] = [
  { prefix: "/cashier", role: ROLE_CASHIER },
  { prefix: "/kitchen", role: ROLE_KITCHEN },
  { prefix: "/manager", role: ROLE_MANAGER },
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const routeConfig = ROUTE_ROLES.find((r) => pathname.startsWith(r.prefix));

  if (!routeConfig) {
    return NextResponse.next();
  }

  const token = request.cookies.get("access_token")?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const roleRaw = request.cookies.get("user_role")?.value;
  const userRole = roleRaw !== undefined ? Number(roleRaw) : null;

  if (userRole === null || userRole !== routeConfig.role) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/manager/:path*", "/cashier/:path*", "/kitchen/:path*"],
};
