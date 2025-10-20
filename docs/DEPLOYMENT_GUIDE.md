# Week 1 Deployment Quick Reference

## 🚀 Immediate Deployment Steps

### 1. Commit Changes
```powershell
git add .
git commit -m "Week 1: Critical performance optimizations - TTFB, FCP, LCP improvements"
git push origin main
```

### 2. Vercel Deployment
- Push will automatically trigger deployment
- Monitor deployment at https://vercel.com/dashboard

### 3. Add Upstash Redis Integration (CRITICAL)
**In Vercel Dashboard:**
1. Go to your project
2. Click on "Storage" tab
3. Click "Create Database" → Select "KV (Redis)"
4. Choose "Upstash" as provider
5. Select region closest to your database
6. Click "Create"

**Auto-Generated Environment Variables:**
- `KV_URL` - Upstash Redis REST URL
- `KV_REST_API_TOKEN` - Upstash Redis REST Token

These will be automatically added to your Vercel project.

### 4. Run Database Optimizations
**Connect to your production database and run:**
```sql
-- Run the optimization script
-- File: database/optimize.sql

-- This creates indexes on:
-- - experiences (start_date, professional_id)
-- - skills (category, proficiency)
-- - projects (created_at, professional_id)
-- - content_chunks (chunk_type, created_at)
```

**To verify indexes were created:**
```sql
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND indexname LIKE 'idx_%'
ORDER BY indexname;
```

---

## 🧪 Post-Deployment Testing

### Test Server-Side Rendering
```powershell
# View page source to verify SSR
curl https://your-domain.vercel.app/

# Should see fully rendered HTML with:
# - Experience data in HTML
# - Skills data in HTML
# - Projects data in HTML
# (No client-side data fetching needed!)
```

### Test Cache Functionality
1. **First Request:**
   - Should see "Cache miss" in Upstash console
   - Response generated from database

2. **Second Request (within 1 hour):**
   - Should see "Cache hit" in Upstash console
   - Response served from cache (faster)

3. **After 1 Hour:**
   - Cache expires
   - New data fetched and cached

### Verify Resource Hints
1. Open homepage in Chrome
2. Open DevTools → Network tab
3. Filter by "Fonts" and "Images"
4. Check that hero image loads early (preloaded)
5. Verify font connections established early (preconnected)

---

## 📊 Performance Testing

### Run Lighthouse Audit
1. Open site in Chrome Incognito
2. Open DevTools (F12)
3. Click "Lighthouse" tab
4. Select "Performance" only
5. Run for Desktop and Mobile
6. Compare with baseline:
   - **Current:** RES 81, TTFB 2.37s, FCP 3.37s, LCP 3.42s
   - **Target:** RES 89-91, TTFB <1.5s, FCP <2.5s, LCP <2.8s

### Check Vercel Analytics
1. Go to Vercel Dashboard
2. Select your project
3. Click "Analytics" tab
4. View "Speed Insights"
5. Monitor:
   - Real Experience Score (RES)
   - TTFB trends
   - FCP trends
   - LCP trends

### Monitor Upstash Dashboard
1. Go to https://console.upstash.com
2. Select your Redis database
3. Monitor:
   - Request count
   - Hit rate (should be >50% after warming)
   - Key count (should see experiences:*, skills:*, projects:*)
   - Memory usage

---

## 🔍 What to Monitor

### First 24 Hours
- [ ] Real Experience Score trending upward
- [ ] TTFB reduced by at least 30%
- [ ] No increase in error rates
- [ ] Cache hit rate increasing over time
- [ ] Page load times decreasing

### First Week
- [ ] Stable RES around 89-91
- [ ] TTFB consistently <1.5s
- [ ] Cache hit rate >70%
- [ ] No user-reported issues
- [ ] Database query times improved

---

## ⚠️ Rollback Procedure (If Needed)

### If Performance Degrades
```powershell
# Revert to previous commit
git revert HEAD
git push origin main

# Or restore from Vercel
# 1. Go to Vercel Dashboard
# 2. Click "Deployments"
# 3. Find last working deployment
# 4. Click "..." → "Promote to Production"
```

### If Cache Issues Occur
1. Go to Upstash Console
2. Click "Data Browser"
3. Delete problematic keys
4. Or flush entire database: `FLUSHALL`

---

## 📈 Expected Results

### Performance Metrics (After Cache Warm-Up)
| Metric | Before | Week 1 Target | Expected |
|--------|--------|---------------|----------|
| RES | 81 | 89-91 | 89 |
| TTFB | 2.37s | <1.5s | ~1.2s |
| FCP | 3.37s | <2.5s | ~2.4s |
| LCP | 3.42s | <2.8s | ~2.7s |

### User Experience Improvements
- ✅ Pages load ~50% faster
- ✅ Hero image appears immediately
- ✅ Content visible sooner
- ✅ Smoother navigation
- ✅ Better mobile experience

---

## 🐛 Common Issues & Solutions

### Issue: "Redis not configured" warning in logs
**Solution:** 
- Verify Upstash Redis integration is active in Vercel
- Check environment variables in Vercel dashboard
- Redeploy if variables were just added

### Issue: Cache not populating
**Solution:**
- Check Upstash console for errors
- Verify API endpoints are being called
- Check that `redis` client is initialized properly

### Issue: Database queries still slow
**Solution:**
- Verify indexes were created: `\di` in psql
- Run EXPLAIN ANALYZE on slow queries
- Check database connection pool isn't exhausted

### Issue: Images not optimized
**Solution:**
- Ensure `images.unoptimized` is `false` in next.config.mjs
- Clear `.next` cache: `rm -rf .next`
- Rebuild: `pnpm build`

---

## 📞 Support Resources

### Documentation
- Week 1 Implementation Summary: `docs/WEEK_1_IMPLEMENTATION_SUMMARY.md`
- Optimization Plan: `docs/SITE_EXPERIENCE_OPTIMIZATION_PLAN.md`
- Implementation Checklist: `docs/IMPLEMENTATION_CHECKLIST.md`

### Monitoring Links
- Vercel Dashboard: https://vercel.com/dashboard
- Upstash Console: https://console.upstash.com
- Database: (Your PostgreSQL connection)

### Key Files
- Cache utilities: `lib/cache.ts`, `lib/upstash.ts`
- API routes: `app/api/experiences/route.ts`, etc.
- Database indexes: `database/optimize.sql`
- Configuration: `next.config.mjs`

---

## ✅ Deployment Checklist

- [ ] Code committed and pushed
- [ ] Vercel deployment successful
- [ ] Upstash Redis integration added
- [ ] Environment variables verified
- [ ] Database indexes created
- [ ] API endpoints tested
- [ ] Cache headers verified
- [ ] Lighthouse audit completed
- [ ] Upstash dashboard monitored
- [ ] Performance metrics improving
- [ ] No errors in logs
- [ ] User testing passed

---

**Status:** Ready for Deployment ✅  
**Risk Level:** Low (all changes are performance enhancements)  
**Rollback Time:** <5 minutes  
**Expected Downtime:** None

**Deploy with confidence!** 🚀
