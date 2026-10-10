import { NextResponse, type NextRequest } from "next/server";
import { verifySession, COOKIE_NAME } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes
  if (pathname.startsWith("/admin")) {
    const sessionToken = request.cookies.get(COOKIE_NAME)?.value;
    const session = await verifySession(sessionToken);

    // If on /admin/login and already authenticated, redirect to /admin
    if (pathname === "/admin/login") {
      if (session) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.next();
    }

    // For all other /admin routes, require valid session
    if (!session) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
