import { redirect } from 'next/navigation'

export default function AdminLoginPage() {
  // Redirect to the new Clerk sign-in page
  redirect('/admin/sign-in')
}
