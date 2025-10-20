// Request deduplication utility
// Prevents duplicate API calls by caching in-flight requests

const pendingRequests = new Map<string, Promise<any>>();

/**
 * Deduplicate requests by key
 * If a request with the same key is already in-flight, return the existing promise
 * Otherwise, execute the fetcher and cache the promise
 * 
 * @param key - Unique identifier for the request
 * @param fetcher - Function that performs the actual request
 * @returns Promise with the result
 */
export async function dedupeRequest<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  // Return existing promise if request is in flight
  if (pendingRequests.has(key)) {
    console.log(`Dedupe: Using cached promise for key: ${key}`);
    return pendingRequests.get(key)!;
  }

  console.log(`Dedupe: Creating new request for key: ${key}`);

  // Create new request
  const promise = fetcher().finally(() => {
    // Clean up after request completes
    pendingRequests.delete(key);
  });

  pendingRequests.set(key, promise);
  return promise;
}

/**
 * Clear all pending requests
 * Useful for testing or cache invalidation
 */
export function clearPendingRequests(): void {
  pendingRequests.clear();
}

/**
 * Check if a request is currently pending
 */
export function hasPendingRequest(key: string): boolean {
  return pendingRequests.has(key);
}

/**
 * Get the number of pending requests
 */
export function getPendingRequestCount(): number {
  return pendingRequests.size;
}
