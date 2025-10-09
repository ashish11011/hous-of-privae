import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // Not logged in
  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  console.log(JSON.stringify(token));

  // Not an admin
  // if (token?.user?.user_type !== "1") {
  // return NextResponse.redirect(new URL("/unauthorized", request.url));
  //   return NextResponse.redirect(new URL("/", request.url));
  // }

  return NextResponse.next();
}

// ✅ Restrict to only /admin routes
export const config = {
  matcher: ["/admin/:path*"],
};
