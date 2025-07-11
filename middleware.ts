import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow access to login page and auth API routes
  if (pathname === '/login' || pathname.startsWith('/api/auth/')) {
    return NextResponse.next()
  }

  // Check for session cookie
  const sessionCookie = request.cookies.get('session')
  
  if (!sessionCookie) {
    // Redirect to login if no session
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Allow access to protected routes
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 