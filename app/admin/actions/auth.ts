"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123"

export async function adminLogin(password: string) {
  try {
    if (password !== ADMIN_PASSWORD) {
      return { success: false, error: "Invalid password" }
    }

    const cookieStore = await cookies()

    // Set secure session cookie (expires in 24 hours)
    cookieStore.set("admin-session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/admin",
    })

    return { success: true }
  } catch (error) {
    console.error("Admin login error:", error)
    return { success: false, error: "Login failed" }
  }
}

export async function adminLogout() {
  const cookieStore = await cookies()
  cookieStore.delete("admin-session")
  redirect("/admin/login")
}
