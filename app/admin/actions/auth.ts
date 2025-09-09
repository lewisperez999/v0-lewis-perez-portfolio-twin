"use server"

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export async function checkAdminAuth() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect("/admin/sign-in")
  }
  
  return userId
}

export async function adminLogout() {
  // Clerk handles logout via their components/hooks
  // This function can be used for additional cleanup if needed
  redirect("/admin/sign-in")
}
