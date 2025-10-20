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

// Configure fonts with optimal loading strategy
const geistSans = GeistSans;
const geistMono = GeistMono;

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
        <head>
          {/* Resource hints for critical resources */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="dns-prefetch" href="https://api.openai.com" />
          <link rel="dns-prefetch" href="https://vercel.live" />
          <link rel="dns-prefetch" href="https://clerk.com" />
          {/* Preload hero image for faster LCP */}
          <link rel="preload" as="image" href="/professional-developer-portrait.avif" />
        </head>
        <body className={`font-sans ${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}>
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
