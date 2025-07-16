import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow access to login page and auth API routes
  if (pathname === '/login' || pathname.startsWith('/api/auth/')) {
    return NextResponse.next()
  }

  // Allow access to database import API routes
  if (pathname.startsWith('/api/jobs') || pathname.startsWith('/api/vehicles')) {
    return NextResponse.next()
  }

  // Allow access to public config API route (needed for branding on login page)
  if (pathname === '/api/config') {
    return NextResponse.next()
  }

  // Allow access to optimization results API routes
  if (pathname.startsWith('/api/optimization-results')) {
    return NextResponse.next()
  }

  // Check for session cookie
  const sessionCookie = request.cookies.get('session')
  
  if (!sessionCookie) {
    // Redirect to login if no session
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Continue to the requested page
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
} 