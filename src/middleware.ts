import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Route patterns
const authRoutes = ['/login', '/signup', '/forgot-password', '/reset-password']
const protectedRoutes = ['/account', '/wishlist', '/checkout']
const sellerRoutes = ['/seller']
const adminRoutes = ['/admin']

export async function middleware(request: NextRequest) {
  const { response, user, supabase } = await updateSession(request)
  const pathname = request.nextUrl.pathname

  // Check if route is an auth route (login, signup, etc.)
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Check protected routes
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )
  if (isProtectedRoute && !user) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Check seller routes - requires seller or admin role
  // Exception: /seller/register is accessible to any authenticated user
  const isSellerRoute = sellerRoutes.some((route) => pathname.startsWith(route))
  const isSellerRegister = pathname === '/seller/register' || pathname === '/seller/register/'

  if (isSellerRoute && !isSellerRegister) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Get user role from database
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['seller', 'admin'].includes(profile.role)) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Seller register requires authentication but not seller role
  if (isSellerRegister && !user) {
    return NextResponse.redirect(new URL('/login?redirectTo=/seller/register', request.url))
  }

  // Check admin routes
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))
  if (isAdminRoute) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
