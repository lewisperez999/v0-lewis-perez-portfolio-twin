import type React from "react"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { AdminSidebar } from "./components/admin-sidebar"

async function checkAdminAuth() {
  const cookieStore = await cookies()
  const adminSession = cookieStore.get("admin-session")

  if (!adminSession || adminSession.value !== "authenticated") {
    redirect("/admin/login")
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await checkAdminAuth()

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  )
}
