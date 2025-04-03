import { type NextRequest, NextResponse } from "next/server"
import { verifyJwtToken } from "./lib/jwt"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for API routes and public assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next()
  }

  // Get token from cookies
  const token = request.cookies.get("auth_token")?.value

  // Check if user is accessing admin routes
  const isAdminRoute = pathname.startsWith("/admin")
  const isUserRoute = pathname.startsWith("/profile")

  // If no token and trying to access protected routes
  if (!token) {
    if (isAdminRoute) {
      return NextResponse.redirect(new URL("/signin?redirect=/admin", request.url))
    }
    else if(isUserRoute) {
      return NextResponse.redirect(new URL("/", request.url))
    }
    return NextResponse.next()
  }

  try {
    // Verify token
    const decodedToken = await verifyJwtToken(token)

    // If token is valid but user is trying to access admin routes without admin privileges
    if (isAdminRoute && !decodedToken.isAdmin) {
      return NextResponse.redirect(new URL("/", request.url))
    }

    // Add user info to headers for server components
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set("x-user-id", decodedToken.userId)
    requestHeaders.set("x-user-email", decodedToken.email)
    requestHeaders.set("x-user-is-admin", String(decodedToken.isAdmin))
    requestHeaders.set("x-user-is-verified", "true") // All users are considered verified

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch (error) {
    // If token is invalid and trying to access admin routes
    // if (isAdminRoute) {
    //   return NextResponse.redirect(new URL("/signin?redirect=/admin", request.url))
    // }

    // For other routes, just continue (they'll be handled by client-side auth)
    return NextResponse.next()
  }
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
}

