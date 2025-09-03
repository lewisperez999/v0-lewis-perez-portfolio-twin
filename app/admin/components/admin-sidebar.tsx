"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LayoutDashboard, Database, BarChart3, Settings, FileText, Brain, LogOut, Menu, X } from "lucide-react"
import { adminLogout } from "../actions/auth"

const navigation = [
  {
    name: "Overview",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    name: "Content Management",
    href: "/admin/content",
    icon: FileText,
  },
  {
    name: "Embedding Management",
    href: "/admin/embeddings",
    icon: Brain,
  },
  {
    name: "Database Operations",
    href: "/admin/database",
    icon: Database,
  },
  {
    name: "System Monitoring",
    href: "/admin/monitoring",
    icon: Settings,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const handleLogout = async () => {
    await adminLogout()
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-semibold">Admin Dashboard</h1>
        <Button variant="ghost" size="sm" className="ml-auto md:hidden" onClick={() => setIsMobileOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
                onClick={() => setIsMobileOpen(false)}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      <div className="border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed left-4 top-4 z-50 md:hidden"
        onClick={() => setIsMobileOpen(true)}
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Desktop sidebar */}
      <div className="hidden w-64 border-r bg-card md:block">
        <SidebarContent />
      </div>

      {/* Mobile sidebar */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-64 border-r bg-card">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  )
}
