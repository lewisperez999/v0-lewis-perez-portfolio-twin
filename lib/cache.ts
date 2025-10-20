import { getCachedData, invalidateCache } from './upstash';

// Re-export Upstash cache utilities for convenience
export { getCachedData, invalidateCache };

// Cache key builders for consistent naming
export const cacheKeys = {
  experiences: {
    all: 'experiences:all',
    byId: (id: string) => `experiences:${id}`,
    pattern: 'experiences:*',
  },
  skills: {
    all: 'skills:all',
    byCategory: 'skills:by-category',
    pattern: 'skills:*',
  },
  projects: {
    all: 'projects:all',
    featured: 'projects:featured',
    byId: (id: string) => `projects:${id}`,
    pattern: 'projects:*',
  },
  personalInfo: 'personal-info',
};

// Cache TTL configurations (in seconds)
export const cacheTTL = {
  // Content that rarely changes - 1 hour
  experiences: 3600,
  skills: 3600,
  projects: 3600,
  personalInfo: 3600,
  
  // API responses - 5 minutes
  api: 300,
  
  // Search results - 30 minutes
  search: 1800,
  
  // User-specific data - 1 minute
  user: 60,
};
