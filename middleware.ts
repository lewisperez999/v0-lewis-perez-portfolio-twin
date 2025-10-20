import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from "next/server";

const isAdminRoute = createRouteMatcher(['/admin(.*)'])
const isPublicRoute = createRouteMatcher(['/admin/sign-in(.*)'])

export default clerkMiddleware(async (auth, req) => {
  // Handle Clerk authentication for admin routes
  // Protect admin routes and verify admin role
  if (isAdminRoute(req) && !isPublicRoute(req)) {
    await auth.protect((has) => {
      // Check if user has admin role in publicMetadata
      // The role is stored in publicMetadata.role
      return has({ role: 'admin' })
    })
  }

  // Add performance headers
  const response = NextResponse.next();
  
  // Add pathname to headers so server components can access it
  response.headers.set('x-pathname', req.nextUrl.pathname);
  
  // Add cache headers for public API routes (non-admin)
  if (req.nextUrl.pathname.startsWith('/api') && !req.nextUrl.pathname.startsWith('/api/admin')) {
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
  }
  
  return response;
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}

// Specify edge runtime for optimal performance
export const runtime = 'edge';