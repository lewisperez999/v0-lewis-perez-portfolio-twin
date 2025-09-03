import type React from "react"
import { ConditionalAdminLayout } from "./components/conditional-admin-layout"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ConditionalAdminLayout>{children}</ConditionalAdminLayout>
}
