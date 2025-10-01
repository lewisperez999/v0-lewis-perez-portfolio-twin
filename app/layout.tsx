import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"
import { Suspense } from "react"
import { ClerkProvider } from '@clerk/nextjs'
import "./globals.css"

export const metadata: Metadata = {
  title: "Lewis Perez - Full Stack Developer",
  description: "Professional portfolio of Lewis Perez - Full Stack Developer specializing in modern web technologies",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased min-h-screen bg-background text-foreground`}>
          <Suspense fallback={null}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
              {children}
            </ThemeProvider>
          </Suspense>
          <Toaster richColors position="top-right" />
          <Analytics />
          <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  )
}
