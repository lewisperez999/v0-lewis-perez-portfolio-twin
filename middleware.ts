import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import arcjet, { detectBot, shield, tokenBucket } from "@arcjet/next";
import { NextResponse } from "next/server";

const isAdminRoute = createRouteMatcher(['/admin(.*)'])
const isPublicRoute = createRouteMatcher(['/admin/sign-in(.*)'])

// Configure Arcjet for site-wide protection
const aj = arcjet({
  key: process.env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
  rules: [
    // Shield protects against common attacks (SQL injection, XSS, etc.)
    shield({ 
      mode: "LIVE" // Use "DRY_RUN" to log only without blocking
    }),
    // Detect and block malicious bots
    detectBot({
      mode: "LIVE",
      allow: [
        "CATEGORY:SEARCH_ENGINE", // Allow Google, Bing, etc.
        "CATEGORY:MONITOR", // Allow uptime monitoring
        "CATEGORY:PREVIEW", // Allow link previews (Slack, Discord)
      ],
    }),
    // Rate limiting for the entire site
    tokenBucket({
      mode: "LIVE",
      characteristics: ["ip.src"],
      refillRate: 20, // Refill 20 tokens per interval
      interval: 10, // Refill every 10 seconds
      capacity: 50, // Bucket capacity of 50 tokens
    }),
  ],
});

export default clerkMiddleware(async (auth, req) => {
  // First, check Arcjet protection
  const decision = await aj.protect(req, { requested: 1 });
  
  // Log decisions in development
  if (process.env.NODE_ENV === "development") {
    console.log("Arcjet decision:", decision);
  }

  // Block denied requests
  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      return NextResponse.json(
        { error: "Too Many Requests" },
        { status: 429 }
      );
    } else if (decision.reason.isBot()) {
      return NextResponse.json(
        { error: "Bot access denied" },
        { status: 403 }
      );
    } else {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }
  }

  // Then handle Clerk authentication for admin routes
  if (isAdminRoute(req) && !isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}