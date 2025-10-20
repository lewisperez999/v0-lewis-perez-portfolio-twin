# Quick Admin Setup Guide 🚀

## TL;DR - Setup Your First Admin

### Option 1: Clerk Dashboard (Easiest) ⭐

1. Go to [https://dashboard.clerk.com](https://dashboard.clerk.com)
2. Navigate to **Users**
3. Click on your user
4. Scroll to **Public metadata**
5. Click **Edit**
6. Add this JSON:
   ```json
   {
     "role": "admin"
   }
   ```
7. Click **Save**
8. **Sign out and sign back in** to your app

### Option 2: CLI Script

```bash
pnpm ts-node scripts/set-admin-role.ts set your-email@example.com
```

Then sign out and sign back in.

### Option 3: API Endpoint (After you have an admin)

```bash
curl -X POST http://localhost:3000/api/admin/roles \
  -H "Content-Type: application/json" \
  -d '{"userId": "user_123", "role": "admin"}'
```

---

## How It Works

### Protection Layers

1. **Middleware** (`middleware.ts`)
   - Checks `role === 'admin'` in session token
   - Returns 404 if not admin
   - First line of defense

2. **Server Actions** (`app/admin/actions/auth.ts`)
   - Verifies role from `publicMetadata`
   - Redirects to home if not admin
   - Second line of defense

3. **Layout** (`app/admin/layout.tsx`)
   - Calls `checkAdminAuth()` on every page load
   - Third line of defense

### What Happens When...

| Scenario | Result |
|----------|--------|
| Not signed in | Redirect to `/admin/sign-in` |
| Signed in, no role | 404 error or redirect to home |
| Signed in, role = "admin" | Full access ✅ |

---

## Testing Your Setup

### Test 1: Unauthenticated
```bash
# Sign out first
# Then try to access admin page
http://localhost:3000/admin
# Expected: Redirects to /admin/sign-in
```

### Test 2: Non-Admin User
```bash
# Sign in with a regular user (no role)
# Try to access admin page
http://localhost:3000/admin
# Expected: 404 error or redirect to home
```

### Test 3: Admin User
```bash
# Sign in with admin user (role = "admin")
# Access admin page
http://localhost:3000/admin
# Expected: Success! ✅
```

---

## Troubleshooting

### ❌ Still can't access after setting role

**Solution:** Sign out and sign back in to get a new session token with the updated role.

```bash
1. Click sign out in your app
2. Clear browser cookies (optional but recommended)
3. Sign back in
4. Try accessing /admin again
```

### ❌ "404 Not Found" after signing in

**Solution:** Verify the role is set correctly in Clerk Dashboard.

```bash
1. Go to Clerk Dashboard
2. Users → Select your user
3. Check Public metadata
4. Should see: { "role": "admin" }
5. If not there, add it and save
6. Sign out and sign back in
```

### ❌ CLI script not working

**Solution:** Make sure you're in the project root and TypeScript is configured.

```bash
# Make sure you're in the project root
cd /path/to/v0-lewis-perez-portfolio-twin

# Install dependencies if needed
pnpm install

# Try running the script
pnpm ts-node scripts/set-admin-role.ts set your-email@example.com
```

---

## Management Commands

### List All Admins
```bash
pnpm ts-node scripts/set-admin-role.ts list
```

### Add Admin Role
```bash
pnpm ts-node scripts/set-admin-role.ts set email@example.com
```

### Remove Admin Role
```bash
pnpm ts-node scripts/set-admin-role.ts remove email@example.com
```

---

## Security Notes 🔒

- ✅ **Multi-layer protection**: Middleware + Server Actions + Layout
- ✅ **Session-based**: Role included in JWT session token
- ✅ **Defense-in-depth**: Multiple checks ensure security
- ✅ **Clerk-powered**: Leverages Clerk's robust auth system

### Best Practices

1. **Limit admin users**: Only give admin role to trusted users
2. **Use strong passwords**: Enforce password requirements in Clerk
3. **Enable 2FA**: Turn on two-factor authentication for admins
4. **Monitor access**: Check admin activity logs regularly
5. **Audit roles**: Periodically review who has admin access

---

## Next Steps

After setting up your admin:

1. ✅ Access the admin dashboard at `/admin`
2. ✅ Manage content, users, and settings
3. ✅ Set up additional admin users if needed
4. ✅ Configure role-based features in your app

---

## Need Help?

- 📖 Full documentation: `docs/ADMIN_ROLE_SETUP.md`
- 🔗 Clerk documentation: [https://clerk.com/docs](https://clerk.com/docs)
- 💬 Clerk support: [https://clerk.com/contact/support](https://clerk.com/contact/support)

---

**Remember:** Always sign out and sign back in after changing roles! 🔄
