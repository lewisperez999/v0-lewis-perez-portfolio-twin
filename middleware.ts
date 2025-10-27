import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

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
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
