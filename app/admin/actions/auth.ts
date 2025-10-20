"use server"

import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export async function checkAdminAuth() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect("/admin/sign-in")
  }
  
  // Verify admin role from publicMetadata
  const user = await currentUser()
  const role = user?.publicMetadata?.role as string | undefined
  
  if (role !== 'admin') {
    // User is authenticated but not an admin
    // Redirect to unauthorized page or home
    redirect("/")
  }
  
  return userId
}

export async function adminLogout() {
  // Clerk handles logout via their components/hooks
  // This function can be used for additional cleanup if needed
  redirect("/admin/sign-in")
}
