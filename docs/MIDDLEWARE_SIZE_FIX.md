# Middleware Bundle Size Fix

## Problem
The middleware was exceeding Vercel's Edge Function size limit (1 MB) because it was importing both Clerk and Arcjet packages, resulting in a 1.03 MB bundle.

## Solution
Moved Arcjet protection from middleware to a separate utility file (`lib/arcjet.ts`) that can be imported only in API routes that need it.

### Changes Made

1. **Simplified Middleware** (`middleware.ts`)
   - Removed Arcjet imports and logic
   - Kept only Clerk authentication for admin routes
   - Added `runtime = 'edge'` export for explicit edge runtime
   - Reduced bundle size significantly

2. **Created Arcjet Utility** (`lib/arcjet.ts`)
   - Moved all Arcjet configuration to a reusable utility
   - Added helper function `checkArcjetProtection()`
   - Made Arcjet optional (gracefully handles missing API key)

3. **Updated Vercel Config** (`vercel.json`)
   - Added Node.js memory optimization for builds

## How to Use Arcjet in API Routes

Import and use the Arcjet helper in your API routes:

```typescript
import { checkArcjetProtection } from '@/lib/arcjet';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // Check Arcjet protection
  const decision = await checkArcjetProtection(req);
  
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

  // Your API logic here
  return NextResponse.json({ success: true });
}
```

## Benefits

1. **Smaller Middleware Bundle**: Middleware now only includes Clerk, staying well under 1 MB
2. **Selective Protection**: Apply Arcjet only to routes that need it
3. **Better Performance**: Lighter middleware executes faster
4. **More Flexibility**: Can configure different Arcjet rules per route if needed

## Trade-offs

- Arcjet protection is no longer site-wide by default
- Need to manually add protection to each API route
- Consider adding to high-traffic or sensitive routes first

## Priority Routes for Arcjet Protection

Add Arcjet protection to these routes in priority order:

1. `/api/contact` - Contact form (prone to spam)
2. `/api/admin/**` - Admin endpoints (security critical)
3. `/api/google-meet/**` - OAuth callbacks
4. `/api/mcp/**` - MCP server endpoints
5. Other public API endpoints as needed

## Monitoring

- Arcjet logs decisions in development mode
- Use Arcjet dashboard to monitor blocked requests in production
- Adjust rate limits and bot detection rules as needed
