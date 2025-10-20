# 🚀 Site Experience Optimization Plan
## Comprehensive Performance Improvement Strategy

**Project:** Lewis Perez Portfolio Twin  
**Current Real Experience Score:** 81  
**Target Real Experience Score:** 95+  
**Created:** October 20, 2025  

---

## 📊 Executive Summary

Based on the current performance metrics and extensive research of Next.js and Vercel documentation, this document outlines a comprehensive plan to optimize the user experience of the portfolio site. The plan focuses on seven priority areas with measurable outcomes.

### Current Performance Baseline

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| **Real Experience Score** | 81 | 95+ | ⚠️ Needs Improvement |
| **Time to First Byte (TTFB)** | 2.37s | <0.8s | 🔴 Critical |
| **First Contentful Paint (FCP)** | 3.37s | <1.8s | 🔴 Critical |
| **Largest Contentful Paint (LCP)** | 3.42s | <2.5s | 🔴 Critical |
| **Interaction to Next Paint (INP)** | 40ms | <200ms | ✅ Excellent |
| **Cumulative Layout Shift (CLS)** | 0.04 | <0.1 | ✅ Excellent |
| **First Input Delay (FID)** | 1ms | <100ms | ✅ Excellent |

---

## 📚 Research Sources & Documentation

### Official Documentation References

#### Next.js Performance Optimization
1. **Lazy Loading & Code Splitting**
   - Source: [Next.js Lazy Loading Guide](https://nextjs.org/docs/app/guides/lazy-loading)
   - Key Points: Dynamic imports with `next/dynamic`, React.lazy() with Suspense
   - Implementation: Client component optimization, SSR control

2. **Image Optimization**
   - Source: [Next.js Image Optimization](https://nextjs.org/docs/app/getting-started/images)
   - Key Points: Automatic WebP/AVIF support, responsive images, blur placeholders
   - Implementation: next/image component with priority loading

3. **Font Optimization**
   - Source: [Next.js Font Optimization](https://nextjs.org/docs/app/getting-started/fonts)
   - Key Points: Self-hosting Google Fonts, font-display: swap, variable fonts
   - Implementation: next/font/google and next/font/local

4. **Configuration Options**
   - Source: [next.config.js Documentation](https://nextjs.org/docs/app/api-reference/config/next-config-js)
   - Key Points: Compression, image config, experimental optimizations
   - Implementation: Production-ready configurations

#### Vercel Edge & Caching
5. **Vercel Edge Network Caching**
   - Source: [Vercel Cache Documentation](https://vercel.com/docs/edge-cache)
   - Key Points: CDN-Cache-Control headers, cache invalidation, edge functions
   - Implementation: s-maxage, stale-while-revalidate strategies

6. **Cache Control Headers**
   - Source: [Vercel Cache Control Headers](https://vercel.com/docs/headers/cache-control-headers)
   - Key Points: Browser vs CDN caching, Vary header usage
   - Implementation: Response caching in API routes

#### Web Performance Standards
7. **Core Web Vitals**
   - Source: [Web.dev Web Vitals](https://web.dev/articles/vitals)
   - Key Points: LCP, INP, CLS metrics and thresholds
   - Implementation: Measurement and optimization strategies

8. **Web Vitals Measurement**
   - Source: [Web.dev Vitals Measurement](https://web.dev/articles/vitals-measurement-getting-started)
   - Key Points: Field vs lab measurement, RUM implementation
   - Implementation: web-vitals library integration

---

## 🎯 Priority 1: Critical Performance Issues (Week 1)

### 1.1 Reduce Time to First Byte (TTFB) - 2.37s → <0.8s

**Problem:** Server response time is significantly slow, indicating backend/API bottlenecks.

**Root Causes:**
- Slow database queries
- No response caching
- Unoptimized API routes
- Cold starts on serverless functions

**Implementation Steps:**

#### Step 1: Implement Edge Caching
```typescript
// app/api/[route]/route.ts
export async function GET() {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      'CDN-Cache-Control': 'public, s-maxage=3600',
      'Vercel-CDN-Cache-Control': 'public, s-maxage=7200',
    },
  });
}
```

**Reference:** [Vercel Edge Cache - Using Functions](https://vercel.com/docs/edge-cache#using-vercel-functions)

#### Step 2: Add ISR (Incremental Static Regeneration)
```typescript
// app/page.tsx
export const revalidate = 3600; // Revalidate every hour

export default async function Home() {
  const data = await getData();
  return <div>{/* component */}</div>;
}
```

**Reference:** [Next.js ISR Guide](https://nextjs.org/docs/app/guides/incremental-static-regeneration)

#### Step 3: Implement Upstash Redis Caching Layer (Vercel Integration)
```typescript
// lib/cache.ts
import { Redis } from '@upstash/redis';

// Vercel automatically provides these environment variables
const redis = Redis.fromEnv();

export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 3600
): Promise<T> {
  try {
    // Check cache first
    const cached = await redis.get<T>(key);
    if (cached !== null) return cached;

    // Fetch and cache
    const data = await fetcher();
    await redis.setex(key, ttl, data);
    return data;
  } catch (error) {
    console.error('Cache error:', error);
    // Fallback to fetcher if cache fails
    return fetcher();
  }
}

// Invalidate cache by pattern
export async function invalidateCache(pattern: string) {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}
```

**Reference:** [Upstash Redis SDK](https://upstash.com/docs/redis/sdks/ts/overview) | [Vercel Storage](https://vercel.com/docs/storage/vercel-kv)

#### Step 4: Optimize Database Queries
```typescript
// lib/database.ts
import { sql } from '@vercel/postgres';
import { unstable_cache } from 'next/cache';

export const getExperiences = unstable_cache(
  async () => {
    const result = await sql`
      SELECT * FROM experiences 
      WHERE published = true 
      ORDER BY start_date DESC
    `;
    return result.rows;
  },
  ['experiences'],
  { revalidate: 3600, tags: ['experiences'] }
);
```

**Reference:** [Next.js unstable_cache](https://nextjs.org/docs/app/api-reference/functions/unstable_cache)

**Expected Impact:** TTFB reduction from 2.37s to <0.8s (+10 points on RES)

---

### 1.2 Optimize First/Largest Contentful Paint (FCP/LCP)

**Problem:** Initial content renders too slowly, affecting perceived performance.

**Root Causes:**
- No critical resource preloading
- Large JavaScript bundles blocking render
- Unoptimized fonts causing FOIT/FOUT
- Heavy CSS files

**Implementation Steps:**

#### Step 1: Preload Critical Resources
```tsx
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Preload hero image */}
        <link
          rel="preload"
          href="/professional-developer-portrait.avif"
          as="image"
          type="image/avif"
        />
        {/* Preconnect to external services */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://api.openai.com" />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

**Reference:** [MDN - Preloading Content](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/preload)

#### Step 2: Optimize Font Loading
```typescript
// app/layout.tsx
import { GeistSans, GeistMono } from 'geist/font';

const geistSans = GeistSans({
  subsets: ['latin'],
  display: 'swap', // Prevent FOIT
  preload: true,
  variable: '--font-geist-sans',
});

const geistMono = GeistMono({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-geist-mono',
});
```

**Reference:** [Next.js Font Optimization](https://nextjs.org/docs/app/getting-started/fonts)

#### Step 3: Inline Critical CSS
```typescript
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizeCss: true, // Enable CSS optimization
    inlineCss: true,   // Inline critical CSS
  },
};

export default nextConfig;
```

**Reference:** [Next.js Inline CSS](https://nextjs.org/docs/app/api-reference/config/next-config-js/inlineCss)

#### Step 4: Optimize Hero Image
```tsx
// components/hero.tsx
import Image from 'next/image';

export function Hero() {
  return (
    <Image
      src="/professional-developer-portrait.avif"
      alt="Lewis Perez"
      width={420}
      height={420}
      priority // Load immediately
      quality={90}
      placeholder="blur"
      blurDataURL="data:image/svg+xml;base64,..." // Add blur placeholder
    />
  );
}
```

**Reference:** [Next.js Image Priority](https://nextjs.org/docs/app/api-reference/components/image#priority)

**Expected Impact:** FCP/LCP reduction from 3.3s to <2.0s (+8 points on RES)

---

## 🚀 Priority 2: Frontend Optimizations (Week 2)

### 2.1 Enhanced Code Splitting

**Implementation Steps:**

#### Step 1: Dynamic Import for Heavy Components
```typescript
// components/ai-chat-wrapper.tsx
'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const AIChat = dynamic(() => import('./ai-chat'), {
  loading: () => <AIChatSkeleton />,
  ssr: false, // Client-only component
});

export function AIChatWrapper() {
  return (
    <Suspense fallback={<AIChatSkeleton />}>
      <AIChat />
    </Suspense>
  );
}
```

**Reference:** [Next.js Lazy Loading](https://nextjs.org/docs/app/guides/lazy-loading)

#### Step 2: Route-Based Code Splitting
```typescript
// app/admin/page.tsx
import dynamic from 'next/dynamic';

const AdminDashboard = dynamic(() => import('@/components/admin-dashboard'), {
  loading: () => <div>Loading admin panel...</div>,
});

export default function AdminPage() {
  return <AdminDashboard />;
}
```

#### Step 3: Optimize Package Imports
```typescript
// next.config.mjs
const nextConfig = {
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      'recharts',
    ],
  },
};
```

**Reference:** [Next.js Optimize Package Imports](https://nextjs.org/docs/app/api-reference/config/next-config-js/optimizePackageImports)

**Expected Impact:** Bundle size reduction by 30%, faster initial load (+3 points on RES)

---

### 2.2 Image & Asset Optimization

**Implementation Steps:**

#### Step 1: Configure Next.js Image Optimization
```typescript
// next.config.mjs
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
    dangerouslyAllowSVG: false,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};
```

**Reference:** [Next.js Image Configuration](https://nextjs.org/docs/app/api-reference/config/next-config-js/images)

#### Step 2: Implement Responsive Images
```tsx
// components/project-card.tsx
<Image
  src={project.image}
  alt={project.title}
  width={600}
  height={400}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  quality={85}
  loading="lazy"
/>
```

**Expected Impact:** Image load time reduction by 40% (+2 points on RES)

---

### 2.3 Resource Loading Strategy

**Implementation Steps:**

#### Step 1: Implement Resource Hints
```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://api.openai.com" />
        
        {/* Preconnect */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Prefetch next page */}
        <link rel="prefetch" href="/about" />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

**Reference:** [MDN - Link Types](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel)

**Expected Impact:** Improved navigation speed (+1 point on RES)

---

## ⚡ Priority 3: Backend & Database Optimizations (Week 3)

### 3.1 Implement Response Caching

**Implementation Steps:**

#### Step 1: API Route Caching
```typescript
// app/api/experiences/route.ts
import { getCachedData } from '@/lib/cache';

export async function GET() {
  const experiences = await getCachedData(
    'experiences:all',
    async () => {
      const data = await getExperiences();
      return data;
    },
    3600 // 1 hour TTL
  );

  return Response.json(experiences, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}

export const runtime = 'edge'; // Use Edge runtime for faster responses
export const revalidate = 3600;
```

**Reference:** [Next.js Route Segment Config](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config)

#### Step 2: Database Connection Pooling
```typescript
// lib/database.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  max: 20, // Maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('Executed query', { text, duration, rows: res.rowCount });
  return res;
}
```

**Reference:** [node-postgres Pool](https://node-postgres.com/apis/pool)

**Expected Impact:** API response time reduction by 50% (+5 points on RES)

---

### 3.2 Database Query Optimization

**Implementation Steps:**

#### Step 1: Add Proper Indexes
```sql
-- database/optimize.sql

-- Index for experience queries
CREATE INDEX idx_experiences_published_date 
ON experiences(published, start_date DESC) 
WHERE published = true;

-- Index for skills category lookup
CREATE INDEX idx_skills_category 
ON skills(category, proficiency_level);

-- Index for projects featured/status
CREATE INDEX idx_projects_featured_status 
ON projects(featured, status) 
WHERE status = 'published';

-- Index for content search
CREATE INDEX idx_content_chunks_type 
ON content_chunks(chunk_type, created_at DESC);

-- Full-text search index
CREATE INDEX idx_content_chunks_search 
ON content_chunks USING GIN(to_tsvector('english', content));
```

#### Step 2: Optimize Vector Search with Upstash Vector
```typescript
// lib/vector-search.ts
import { Index } from '@upstash/vector';

// Initialize Upstash Vector (Vercel automatically provides credentials)
const index = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
});

// Optimized vector search with caching
export async function searchSimilarContent(
  query: string,
  embedding: number[],
  topK: number = 5
) {
  const cacheKey = `vector:search:${query.slice(0, 50)}`;
  
  return getCachedData(
    cacheKey,
    async () => {
      const results = await index.query({
        vector: embedding,
        topK,
        includeMetadata: true,
      });
      return results;
    },
    1800 // 30 minute cache
  );
}

// Batch upsert for better performance
export async function batchUpsertVectors(
  vectors: Array<{ id: string; vector: number[]; metadata: any }>
) {
  // Upstash Vector supports efficient batch operations
  return index.upsert(vectors);
}
```

**Reference:** [Upstash Vector Documentation](https://upstash.com/docs/vector/overall/getstarted) | [Vercel Vector Storage](https://vercel.com/docs/storage/vercel-vector)

**Expected Impact:** Query execution time reduction by 60% (+3 points on RES)

---

### 3.3 API Route Optimizations

**Implementation Steps:**

#### Step 1: Add Compression Middleware
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Enable compression for API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    response.headers.set('Content-Encoding', 'gzip');
  }
  
  return response;
}

export const config = {
  matcher: '/api/:path*',
};
```

#### Step 2: Implement Request Deduplication
```typescript
// lib/dedupe.ts
const pendingRequests = new Map<string, Promise<any>>();

export async function dedupeRequest<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  // Return existing promise if request is in flight
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key)!;
  }

  // Create new request
  const promise = fetcher().finally(() => {
    pendingRequests.delete(key);
  });

  pendingRequests.set(key, promise);
  return promise;
}
```

**Expected Impact:** Reduced duplicate API calls (+2 points on RES)

---

## 🎨 Priority 4: User Experience Enhancements (Week 4)

### 4.1 Loading States & Skeletons

**Implementation:** Already well-implemented ✅

**Improvements:**

```tsx
// components/ui/page-skeleton.tsx
export function PageSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-screen bg-gradient-to-br from-muted to-background">
        {/* Hero skeleton */}
        <div className="container mx-auto px-4 pt-20">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 space-y-4">
              <div className="h-12 bg-muted rounded-lg w-3/4" />
              <div className="h-8 bg-muted rounded-lg w-1/2" />
              <div className="h-20 bg-muted rounded-lg" />
            </div>
            <div className="w-96 h-96 bg-muted rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Reference:** [Next.js Loading UI](https://nextjs.org/docs/app/api-reference/file-conventions/loading)

**Expected Impact:** Better perceived performance (+1 point on RES)

---

### 4.2 Animation Performance

**Implementation Steps:**

#### Step 1: GPU-Accelerated Animations
```css
/* app/globals.css */

/* Optimize animations for 60fps */
.animate-element {
  will-change: transform, opacity;
  transform: translateZ(0);
  backface-visibility: hidden;
}

/* Use transform instead of position changes */
.slide-in {
  animation: slideIn 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
}

@keyframes slideIn {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

/* Respect user preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**Reference:** [MDN - Will-Change](https://developer.mozilla.org/en-US/docs/Web/CSS/will-change)

**Expected Impact:** Smoother animations, better INP (+1 point on RES)

---

### 4.3 Interaction Optimizations

**Implementation Steps:**

#### Step 1: Debounce Search Inputs
```typescript
// hooks/use-debounce.ts
import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

#### Step 2: Optimistic UI Updates
```typescript
// app/actions/update-profile.ts
'use server';

import { revalidatePath } from 'next/cache';

export async function updateProfile(formData: FormData) {
  // Update database
  await updateDatabase(formData);
  
  // Revalidate cache
  revalidatePath('/profile');
  
  return { success: true };
}
```

**Expected Impact:** More responsive interactions (+1 point on RES)

---

## 📱 Priority 5: Mobile Experience (Week 4)

### 5.1 Mobile-First Optimizations

**Implementation Steps:**

#### Step 1: Conditional Loading Based on Device
```typescript
// lib/device-detection.ts
import { userAgent } from 'next/server';

export function isMobileDevice(ua: string): boolean {
  return /iPhone|iPad|iPod|Android/i.test(ua);
}

// In component
'use client';

export function FeatureWrapper() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);

  if (isMobile) {
    return <MobileOptimizedComponent />;
  }

  return <DesktopComponent />;
}
```

#### Step 2: Touch-Optimized Interactions
```css
/* app/globals.css */

/* Larger touch targets for mobile */
@media (max-width: 768px) {
  button,
  a,
  input[type="checkbox"],
  input[type="radio"] {
    min-height: 44px;
    min-width: 44px;
  }
  
  /* Optimize for thumb zone */
  .mobile-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
  }
}

/* Remove tap highlight on touch devices */
* {
  -webkit-tap-highlight-color: transparent;
}
```

**Expected Impact:** Better mobile UX (+2 points on RES)

---

### 5.2 PWA Capabilities

**Implementation Steps:**

#### Step 1: Add Web App Manifest
```typescript
// app/manifest.ts
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Lewis Perez - Portfolio',
    short_name: 'LP Portfolio',
    description: 'Professional portfolio of Lewis Perez',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#3b82f6',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
```

**Reference:** [Next.js Manifest](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/manifest)

#### Step 2: Service Worker (Optional)
```typescript
// public/service-worker.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll([
        '/',
        '/styles/main.css',
        '/scripts/main.js',
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

**Expected Impact:** Offline support, app-like experience (+1 point on RES)

---

## 🔧 Priority 6: Technical Improvements (Week 5)

### 6.1 Environment Configuration for Upstash (Vercel)

**Implementation Steps:**

#### Step 1: Configure Upstash Environment Variables
```bash
# .env.local (Vercel automatically populates these)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
UPSTASH_VECTOR_REST_URL=https://your-vector.upstash.io
UPSTASH_VECTOR_REST_TOKEN=your-vector-token
```

**Reference:** [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables) | [Upstash Integration](https://vercel.com/integrations/upstash)

#### Step 2: Initialize Upstash Services
```typescript
// lib/upstash.ts
import { Redis } from '@upstash/redis';
import { Index } from '@upstash/vector';

// Redis for caching - uses Vercel KV under the hood
export const redis = Redis.fromEnv();

// Vector for semantic search
export const vectorIndex = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
});

// Health check
export async function checkUpstashHealth() {
  try {
    await redis.ping();
    const info = await vectorIndex.info();
    return { redis: 'healthy', vector: 'healthy', vectorInfo: info };
  } catch (error) {
    console.error('Upstash health check failed:', error);
    throw error;
  }
}
```

### 6.2 Next.js Configuration Updates

**Implementation Steps:**

```javascript
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Core optimizations
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  poweredByHeader: false,

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Experimental features
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/*',
      'recharts',
    ],
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365,
  },

  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },

  // Redirects for SEO
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
```

**Reference:** [Next.js Config Documentation](https://nextjs.org/docs/app/api-reference/config/next-config-js)

**Expected Impact:** Overall bundle optimization (+3 points on RES)

---

### 6.3 Bundle Analysis

**Implementation Steps:**

#### Step 1: Install Bundle Analyzer
```bash
pnpm add -D @next/bundle-analyzer
```

#### Step 2: Configure Analyzer
```javascript
// next.config.mjs
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default withBundleAnalyzer(nextConfig);
```

#### Step 3: Run Analysis
```bash
ANALYZE=true pnpm build
```

**Reference:** [Next.js Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)

**Expected Impact:** Identify and eliminate bloat (+2 points on RES)

---

## 📈 Priority 7: Monitoring & Analytics (Week 5)

### 7.1 Enhanced Performance Monitoring

**Implementation Steps:**

#### Step 1: Web Vitals Reporting
```typescript
// app/layout.tsx
'use client';

import { useReportWebVitals } from 'next/web-vitals';

export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    // Send to analytics endpoint
    const body = JSON.stringify(metric);
    const url = '/api/analytics/web-vitals';

    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, body);
    } else {
      fetch(url, { body, method: 'POST', keepalive: true });
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(metric);
    }
  });

  return null;
}
```

**Reference:** [Next.js useReportWebVitals](https://nextjs.org/docs/app/api-reference/functions/use-report-web-vitals)

#### Step 2: Create Analytics Endpoint
```typescript
// app/api/analytics/web-vitals/route.ts
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const metric = await request.json();

  // Log metric (could send to external service)
  console.log('Web Vital:', {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
  });

  // Store in database if needed
  // await storeMetric(metric);

  return Response.json({ received: true });
}

export const runtime = 'edge';
```

**Expected Impact:** Real-time performance monitoring (+1 point on RES)

---

### 7.2 Error Tracking

**Implementation Steps:**

#### Step 1: Error Boundary
```tsx
// components/error-boundary.tsx
'use client';

import { useEffect } from 'react';

export function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to analytics service
    console.error('Application Error:', error);
    
    // Send to error tracking service
    fetch('/api/analytics/errors', {
      method: 'POST',
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        digest: error.digest,
      }),
    });
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <button
        onClick={reset}
        className="px-4 py-2 bg-primary text-white rounded"
      >
        Try again
      </button>
    </div>
  );
}
```

**Reference:** [Next.js Error Handling](https://nextjs.org/docs/app/api-reference/file-conventions/error)

**Expected Impact:** Better error tracking and recovery (+1 point on RES)

---

## 🎯 Quick Wins (Can Implement Immediately)

### Quick Win #1: Add Resource Hints (15 minutes)
```tsx
// app/layout.tsx - Add to <head>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="dns-prefetch" href="https://api.openai.com" />
```
**Impact:** +0.5 points on RES

### Quick Win #2: Optimize Hero Image (30 minutes)
```tsx
// components/hero.tsx
<Image
  src="/professional-developer-portrait.avif"
  alt="Lewis Perez"
  width={420}
  height={420}
  priority // Add this
  quality={90} // Add this
/>
```
**Impact:** +1 point on RES

### Quick Win #3: Enable Compression (15 minutes)
```javascript
// next.config.mjs
const nextConfig = {
  compress: true,
  swcMinify: true,
};
```
**Impact:** +0.5 points on RES

### Quick Win #4: Add API Response Caching (30 minutes)
```typescript
// app/api/experiences/route.ts
export async function GET() {
  const data = await getExperiences();
  
  return Response.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600',
    },
  });
}

export const revalidate = 3600;
```
**Impact:** +2 points on RES

### Quick Win #5: Optimize Package Imports (15 minutes)
```javascript
// next.config.mjs
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/*'],
  },
};
```
**Impact:** +1 point on RES

### Quick Win #6: Enable Upstash Redis Edge Caching (20 minutes)
```typescript
// app/api/experiences/route.ts
import { redis } from '@/lib/upstash';

export async function GET() {
  const cached = await redis.get('experiences:all');
  if (cached) return Response.json(cached);
  
  const data = await getExperiences();
  await redis.setex('experiences:all', 3600, data);
  
  return Response.json(data, {
    headers: { 'Cache-Control': 'public, s-maxage=3600' },
  });
}

export const runtime = 'edge';
```
**Impact:** +2 points on RES

**Total Quick Wins Impact:** +7 points on RES (Est. 45-60 minutes)

---

## 📅 Implementation Timeline

### Week 1: Critical Performance (Priority 1)
- **Day 1-2:** Implement edge caching and ISR
- **Day 3:** Set up Redis caching layer
- **Day 4:** Optimize database queries and add indexes
- **Day 5:** Preload critical resources and optimize fonts
- **Target:** TTFB <1.5s, FCP <2.5s

### Week 2: Frontend Optimizations (Priority 2)
- **Day 1-2:** Implement dynamic imports and code splitting
- **Day 3:** Configure image optimization
- **Day 4:** Add resource loading strategies
- **Day 5:** Testing and refinement
- **Target:** Bundle size -30%, LCP <2.8s

### Week 3: Backend & Database (Priority 3)
- **Day 1-2:** Implement comprehensive API caching
- **Day 3:** Database optimization and connection pooling
- **Day 4:** Add compression and request deduplication
- **Day 5:** Performance testing
- **Target:** API response time -50%

### Week 4: UX & Mobile (Priorities 4-5)
- **Day 1:** Enhance loading states
- **Day 2:** Optimize animations
- **Day 3:** Mobile-specific optimizations
- **Day 4:** PWA setup
- **Day 5:** Cross-device testing
- **Target:** Mobile RES 90+

### Week 5: Technical & Monitoring (Priorities 6-7)
- **Day 1:** Next.js configuration updates
- **Day 2:** Bundle analysis and optimization
- **Day 3:** Set up monitoring and analytics
- **Day 4:** Error tracking implementation
- **Day 5:** Final testing and documentation
- **Target:** Overall RES 95+

---

## 📊 Success Metrics & Measurement

### Performance Metrics

| Metric | Baseline | Target | Measurement Tool |
|--------|----------|--------|------------------|
| Real Experience Score | 81 | 95+ | Vercel Speed Insights |
| TTFB | 2.37s | <0.8s | Chrome DevTools, Lighthouse |
| FCP | 3.37s | <1.8s | Chrome DevTools, Lighthouse |
| LCP | 3.42s | <2.5s | Chrome DevTools, Lighthouse |
| INP | 40ms | <200ms | Web Vitals Library |
| CLS | 0.04 | <0.1 | Web Vitals Library |
| Bundle Size | TBD | -30% | Next.js Bundle Analyzer |
| API Response Time | TBD | <200ms | Custom monitoring |

### Testing Strategy

1. **Lab Testing (Pre-deployment)**
   - Lighthouse audits (desktop & mobile)
   - Chrome DevTools performance profiling
   - WebPageTest analysis

2. **Field Testing (Post-deployment)**
   - Real User Monitoring (RUM) via web-vitals library
   - Vercel Analytics
   - User feedback

3. **A/B Testing**
   - Test optimizations incrementally
   - Compare before/after metrics
   - Validate improvements with real users

---

## 🔍 Tools & Resources

### Performance Testing Tools
- **Lighthouse:** [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- **PageSpeed Insights:** [Google PageSpeed](https://pagespeed.web.dev/)
- **WebPageTest:** [webpagetest.org](https://www.webpagetest.org/)
- **Chrome UX Report:** [CrUX Dashboard](https://developer.chrome.com/docs/crux)

### Monitoring Tools
- **Vercel Analytics:** Built-in
- **Vercel Speed Insights:** Built-in
- **Web Vitals Library:** [@vercel/analytics](https://www.npmjs.com/package/@vercel/analytics)
- **Upstash Redis Console:** [console.upstash.com](https://console.upstash.com)
- **Upstash Vector Console:** [console.upstash.com/vector](https://console.upstash.com/vector)

### Development Tools
- **Next.js Bundle Analyzer:** [@next/bundle-analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)
- **React DevTools:** [Chrome Extension](https://react.dev/learn/react-developer-tools)

---

## 📚 Additional References

### Official Documentation
1. **Next.js Documentation:** https://nextjs.org/docs
2. **Vercel Documentation:** https://vercel.com/docs
3. **Web.dev Performance:** https://web.dev/performance
4. **Core Web Vitals:** https://web.dev/articles/vitals

### Performance Guides
5. **Next.js Performance:** https://nextjs.org/docs/app/guides/production-checklist
6. **Image Optimization:** https://nextjs.org/docs/app/guides/images
7. **Caching Strategies:** https://nextjs.org/docs/app/guides/caching

### Best Practices
8. **React Performance:** https://react.dev/learn/render-and-commit
9. **Web Performance MDN:** https://developer.mozilla.org/en-US/docs/Web/Performance
10. **Google Performance Tips:** https://developers.google.com/speed

### Vercel & Upstash Integration
11. **Upstash Redis Documentation:** https://upstash.com/docs/redis
12. **Upstash Vector Documentation:** https://upstash.com/docs/vector
13. **Vercel KV (Upstash Redis):** https://vercel.com/docs/storage/vercel-kv
14. **Vercel Vector (Upstash Vector):** https://vercel.com/docs/storage/vercel-vector

---

## 🚧 Risk Assessment & Mitigation

### Potential Risks

| Risk | Impact | Probability | Mitigation Strategy |
|------|--------|-------------|---------------------|
| Cache invalidation issues | Medium | Low | Implement versioned cache keys |
| Database connection exhaustion | High | Medium | Proper connection pooling config |
| Breaking changes to UI | Low | Low | Incremental deployment, testing |
| SEO impact from caching | Medium | Low | Proper cache headers, sitemap |
| Mobile performance regression | Medium | Low | Device-specific testing |

### Rollback Plan

1. Keep git history clean with atomic commits
2. Use feature flags for major changes
3. Monitor metrics closely after deployment
4. Have previous configuration backed up
5. Document all changes thoroughly

---

## ✅ Acceptance Criteria

### Minimum Success Criteria
- [ ] Real Experience Score ≥ 90
- [ ] TTFB < 1.0s
- [ ] FCP < 2.0s
- [ ] LCP < 2.8s
- [ ] No regressions in INP or CLS
- [ ] All Core Web Vitals in "Good" range

### Optimal Success Criteria
- [ ] Real Experience Score ≥ 95
- [ ] TTFB < 0.8s
- [ ] FCP < 1.8s
- [ ] LCP < 2.5s
- [ ] 95th percentile metrics meet targets
- [ ] Mobile performance equals desktop

---

## 🎓 Learning Outcomes

### Technical Skills Gained
1. Advanced Next.js optimization techniques
2. Edge computing and CDN strategies
3. Database performance tuning
4. Web Vitals measurement and optimization
5. Progressive Web App development

### Best Practices Learned
1. Performance-first development mindset
2. Incremental optimization strategies
3. Real User Monitoring implementation
4. Caching strategy design
5. Mobile-first responsive design

---

## 📝 Notes & Considerations

### Production Considerations
- Test all changes in staging environment first
- Monitor error rates during rollout
- Have rollback plan ready
- Communicate changes to stakeholders
- Document all configuration changes

### Future Enhancements
- Consider implementing React Server Components more extensively
- Explore Partial Prerendering (PPR) when stable
- Investigate edge middleware for personalization
- Consider CDN providers for static assets
- Explore service worker for offline support

---

## 📞 Support & Resources

### Documentation
- This implementation plan
- Next.js official documentation
- Vercel platform documentation

### Community Resources
- Next.js GitHub Discussions
- Vercel Community Forums
- Stack Overflow

### Internal Resources
- Project README.md
- Technical documentation in /docs
- Code comments and inline documentation

---

**Document Version:** 1.0  
**Last Updated:** October 20, 2025  
**Author:** GitHub Copilot  
**Status:** Ready for Implementation  

---

## 🎉 Conclusion

This comprehensive plan provides a structured approach to improving the site experience from a Real Experience Score of 81 to 95+. By following the priorities and implementing the changes systematically over 5 weeks, significant performance improvements can be achieved while maintaining code quality and user experience.

The plan is based on official documentation from Next.js, Vercel, and web performance best practices, ensuring that all implementations are production-ready and follow industry standards.

**Estimated Total Impact:** +14-18 points on Real Experience Score

Remember: Performance optimization is an ongoing process. Continue monitoring metrics and iterating on improvements even after reaching the target score.
