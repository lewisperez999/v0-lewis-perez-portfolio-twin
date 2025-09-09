import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground">Admin Sign In</h2>
          <p className="mt-2 text-muted-foreground">Access the digital twin management dashboard</p>
          <p className="mt-1 text-xs text-muted-foreground">Admin accounts are created manually. Contact the administrator for access.</p>
        </div>
        <SignIn 
          appearance={{
            elements: {
              formButtonPrimary: 
                'bg-primary hover:bg-primary/90 text-primary-foreground',
              card: 'bg-background border border-border',
              headerTitle: 'text-foreground',
              headerSubtitle: 'text-muted-foreground',
              socialButtonsBlockButton: 
                'bg-background border border-border text-foreground hover:bg-accent',
              formFieldLabel: 'text-foreground',
              formFieldInput: 
                'bg-background border border-border text-foreground focus:ring-primary',
              footerActionLink: 'text-primary hover:text-primary/90',
            },
          }}
        />
      </div>
    </div>
  )
}