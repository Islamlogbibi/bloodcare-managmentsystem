import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { decrypt } from "@/lib/auth"

const protectedRoutes = [
  "/",
  "/patients",
  "/transfusions",
  "/history",
  "/analytics",
  "/analyse",
  "/reports",
  "/settings",
  "/users", // Added users route to protected routes
]

const publicRoutes = ["/login", "/setup-admin"]

export async function middleware(request: NextRequest) {
  const cookie = request.cookies.get("session")?.value
  const session = cookie ? await decrypt(cookie).catch(() => null) : null

  const path = request.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.some((route) => path === route || path.startsWith(route + "/"))
  const isPublicRoute = publicRoutes.includes(path)

  // Redirect to login if accessing protected route without session
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/login", request.nextUrl))
  }

  // Redirect to dashboard if accessing public route with valid session
  if (isPublicRoute && session) {
    return NextResponse.redirect(new URL("/", request.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
}
