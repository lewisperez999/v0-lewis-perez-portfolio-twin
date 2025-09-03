"use client"

import { usePathname } from "next/navigation"
import { AdminSidebar } from "./admin-sidebar"

export function ConditionalAdminLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const pathname = usePathname()
  const isLoginPage = pathname === "/admin/login"

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        {children}
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  )
}