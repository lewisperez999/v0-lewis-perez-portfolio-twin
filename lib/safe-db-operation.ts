/**
 * Safe database operation wrapper
 * Gracefully handles errors during build time and returns fallback data
 */

export async function safeDbOperation<T>(
  operation: () => Promise<T>,
  fallback: T,
  operationName: string
): Promise<T> {
  // During build phase, check if we should skip DB operations
  const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build' || 
                       process.env.NEXT_PHASE === 'phase-export'
  
  try {
    const result = await operation()
    return result
  } catch (error) {
    // Log error but don't fail the build
    if (isBuildPhase) {
      console.warn(`[Build Phase] Skipping ${operationName} due to error:`, error)
    } else {
      console.error(`Error in ${operationName}:`, error)
    }
    
    // Return fallback data
    return fallback
  }
}
