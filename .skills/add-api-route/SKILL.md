# Add API Route

Create a new Next.js API route with proper patterns.

## Description

Creates a new API route in the Next.js App Router with:
- TypeScript types
- Zod input validation
- Error handling
- Rate limiting setup (optional)
- Authentication check (optional)

## Instructions

1. Create a new folder in `app/api/[route-name]/`
2. Create `route.ts` with the appropriate HTTP handlers
3. Add Zod schema for request validation
4. Include proper error handling with status codes
5. Add rate limiting using Arcjet if public-facing
6. Add Clerk authentication if the endpoint is protected

## Parameters

- `route_name` - The URL path for the route (e.g., "webhooks", "notifications")
- `methods` - HTTP methods to support (GET, POST, PUT, DELETE)
- `is_public` - Whether the route is public or requires auth
- `needs_rate_limit` - Whether to add Arcjet rate limiting

## Template

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Input validation schema
const RequestSchema = z.object({
  // Define your schema here
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = RequestSchema.parse(body);
    
    // Your logic here
    
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Examples

### Public endpoint with rate limiting
```typescript
import { arcjet } from '@/lib/arcjet';

export async function POST(request: NextRequest) {
  const decision = await arcjet.protect(request);
  if (decision.isDenied()) {
    return NextResponse.json({ error: 'Rate limited' }, { status: 429 });
  }
  // ... rest of handler
}
```

### Protected endpoint
```typescript
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // ... rest of handler
}
```
