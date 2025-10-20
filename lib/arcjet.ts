import arcjet, { detectBot, shield, tokenBucket } from "@arcjet/next";

// Configure Arcjet for API route protection (only if key is available)
export const aj = process.env.ARCJET_KEY ? arcjet({
  key: process.env.ARCJET_KEY,
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
}) : null;

// Helper function to check Arcjet protection in API routes
export async function checkArcjetProtection(req: Request) {
  if (!aj) {
    // If Arcjet is not configured, allow the request
    return { isDenied: () => false };
  }
  
  const decision = await aj.protect(req, { requested: 1 });
  
  // Log decisions in development
  if (process.env.NODE_ENV === "development") {
    console.log("Arcjet decision:", decision);
  }

  return decision;
}
