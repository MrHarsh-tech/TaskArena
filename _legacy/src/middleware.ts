import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Routes that require authentication
const protectedPaths = ["/dashboard", "/admin", "/challenges/create"];

// Routes that only admins can access
const adminPaths = ["/admin"];

// Routes that only instructors/admins can access
const instructorPaths = ["/challenges/create"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path is protected
  const isProtected = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Redirect to login if not authenticated
  if (!token) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Check admin routes
  const isAdminRoute = adminPaths.some((path) => pathname.startsWith(path));
  if (isAdminRoute && token.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Check instructor routes
  const isInstructorRoute = instructorPaths.some((path) =>
    pathname.startsWith(path)
  );
  if (
    isInstructorRoute &&
    token.role !== "INSTRUCTOR" &&
    token.role !== "ADMIN"
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/challenges/create/:path*"],
};
