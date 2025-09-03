import { LoginForm } from "../components/login-form"

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground">Admin Login</h2>
          <p className="mt-2 text-muted-foreground">Access the digital twin management dashboard</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
