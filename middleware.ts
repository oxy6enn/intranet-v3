import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { resolveAccessPolicy } from "@/lib/access-policy";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const decision = resolveAccessPolicy(pathname, session);

  if (decision.action === "redirect") {
    return NextResponse.redirect(new URL(decision.destination, request.url));
  }

  return NextResponse.next();
}

export const config = {
  runtime: "nodejs",
  matcher: [
    "/",
    "/login",
    "/register",
    "/identify",
    "/dashboard/:path*",
    "/profile/:path*",
    "/admin/:path*",
    "/news",
    "/services",
    "/suspended",
  ],
};
