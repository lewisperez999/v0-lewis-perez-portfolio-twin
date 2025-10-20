import type React from "react"
import { headers } from "next/headers"
import { checkAdminAuth } from "./actions/auth"
import { ConditionalAdminLayout } from "./components/conditional-admin-layout"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get the current pathname to check if it's a public route
  const headersList = await headers()
  const pathname = headersList.get("x-pathname") || ""
  
  // Public routes that don't require authentication
  const isPublicRoute = pathname === "/admin/sign-in" || 
                        pathname === "/admin/login" ||
                        pathname.startsWith("/admin/sign-in/")
  
  // Only check admin authentication for protected routes
  // Skip auth check for public routes like sign-in to prevent redirect loops
  if (!isPublicRoute) {
    await checkAdminAuth()
  }
  
  return <ConditionalAdminLayout>{children}</ConditionalAdminLayout>
}
