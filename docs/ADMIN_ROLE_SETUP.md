# Admin Role-Based Access Control

## Overview

The admin section of this application is now protected with Clerk's role-based access control. Only users with the `admin` role can access the admin dashboard and its features.

## Implementation Details

### 1. Middleware Protection

The middleware (`middleware.ts`) now checks for the admin role before allowing access to admin routes:

```typescript
if (isAdminRoute(req) && !isPublicRoute(req)) {
  await auth.protect((has) => {
    return has({ role: 'admin' })
  })
}
```

This ensures that:
- Unauthenticated users are redirected to the sign-in page
- Authenticated users without the `admin` role receive a 404 error
- Only users with the `admin` role can proceed

### 2. Server-Side Role Verification

The `checkAdminAuth()` function in `app/admin/actions/auth.ts` performs additional role verification:

```typescript
const user = await currentUser()
const role = user?.publicMetadata?.role as string | undefined

if (role !== 'admin') {
  redirect("/")
}
```

This provides defense-in-depth by checking the role on the server side.

### 3. Layout Protection

The admin layout (`app/admin/layout.tsx`) calls `checkAdminAuth()` on every page load, ensuring role verification happens before rendering any admin content.

## Setting Up Admin Users

### Using Clerk Dashboard (Recommended)

1. **Sign in to Clerk Dashboard**: Go to [https://dashboard.clerk.com](https://dashboard.clerk.com)

2. **Navigate to Users**: 
   - Select your application
   - Go to "Users" section

3. **Select or Create User**:
   - Choose an existing user or create a new one

4. **Add Admin Role**:
   - Click on the user
   - Scroll to "Public metadata" section
   - Click "Edit"
   - Add the following JSON:
   ```json
   {
     "role": "admin"
   }
   ```
   - Click "Save"

### Using Clerk API (Programmatic)

You can also set the admin role programmatically using Clerk's Backend API:

```typescript
import { clerkClient } from '@clerk/nextjs/server'

await clerkClient.users.updateUserMetadata(userId, {
  publicMetadata: {
    role: 'admin'
  }
})
```

## Role Hierarchy

Currently, the application supports the following role:

- **admin**: Full access to admin dashboard and all administrative features

You can extend this in the future to support additional roles like:
- **editor**: Can edit content but not manage users
- **viewer**: Read-only access to admin dashboard
- **moderator**: Can moderate content and user submissions

## Security Considerations

### Multi-Layer Protection

The implementation uses a defense-in-depth approach:

1. **Middleware Layer**: First line of defense, blocks unauthorized requests before they reach the application
2. **Server Action Layer**: Additional role checks in server actions
3. **Layout Layer**: Role verification before rendering any admin pages

### Public Metadata vs. Private Metadata

- **Public Metadata**: Used for roles that need to be accessible in the frontend (like UI rendering)
- **Private Metadata**: Use for sensitive information that should never be exposed to the client

For admin roles, we use `publicMetadata` because:
- It's included in the session token
- Can be checked efficiently in middleware
- Available in the client for conditional UI rendering

### Session Token Claims

The admin role is automatically included in the session token claims, allowing for efficient role checks without additional database queries.

## Testing Role-Based Access

### Test 1: Unauthenticated Access
1. Sign out of Clerk
2. Try to access `/admin`
3. **Expected**: Redirected to `/admin/sign-in`

### Test 2: Authenticated Non-Admin Access
1. Sign in with a user account that doesn't have the admin role
2. Try to access `/admin`
3. **Expected**: Receive a 404 error or redirected to home page

### Test 3: Admin Access
1. Sign in with an account that has `role: "admin"` in publicMetadata
2. Access `/admin`
3. **Expected**: Successfully access the admin dashboard

## Troubleshooting

### "404 Not Found" Error After Authentication

**Issue**: User is authenticated but sees a 404 error when accessing admin routes.

**Solution**: Verify the user has the admin role in their publicMetadata:
1. Check Clerk Dashboard → Users → Select user → Public metadata
2. Ensure it contains: `{ "role": "admin" }`

### Middleware Not Detecting Role

**Issue**: Middleware doesn't seem to check the role properly.

**Solution**: 
1. Ensure Clerk SDK is up to date: `pnpm update @clerk/nextjs`
2. Verify `CLERK_SECRET_KEY` and `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` are set
3. Restart the development server
4. Clear browser cache and cookies

### Role Changes Not Taking Effect

**Issue**: After adding admin role, user still can't access admin pages.

**Solution**:
1. Sign out and sign back in (to get a new session token with updated metadata)
2. Clear browser cookies for localhost/your domain
3. In development, restart the Next.js dev server

## Future Enhancements

### 1. Multiple Roles

Extend the system to support multiple roles:

```typescript
await auth.protect((has) => {
  return has({ role: 'admin' }) || has({ role: 'editor' })
})
```

### 2. Permissions-Based Access

Implement fine-grained permissions:

```typescript
// In Clerk Dashboard, set up permissions
{
  "role": "admin",
  "permissions": ["read:users", "write:users", "delete:users"]
}

// In middleware
await auth.protect((has) => {
  return has({ permission: 'write:users' })
})
```

### 3. Role-Based UI Components

Create client-side components that conditionally render based on roles:

```typescript
'use client'
import { useUser } from '@clerk/nextjs'

export function AdminOnly({ children }) {
  const { user } = useUser()
  const isAdmin = user?.publicMetadata?.role === 'admin'
  
  if (!isAdmin) return null
  return <>{children}</>
}
```

## References

- [Clerk Middleware Documentation](https://clerk.com/docs/references/nextjs/auth-middleware)
- [Clerk Auth Object Reference](https://clerk.com/docs/references/nextjs/auth)
- [Clerk Roles and Permissions](https://clerk.com/docs/organizations/roles-permissions)
- [Next.js Middleware Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)

## Support

If you encounter issues with admin role setup:
1. Check the Clerk Dashboard for proper metadata configuration
2. Review the browser console and server logs for error messages
3. Verify environment variables are correctly set
4. Contact Clerk support at [https://clerk.com/contact/support](https://clerk.com/contact/support)
