// Shared table initialization utilities with race condition protection
import { query } from "./database"

// Track initialization state for each table
const tableInitState = new Map<string, {
  isInitializing: boolean
  isInitialized: boolean
  promise: Promise<void> | null
}>()

/**
 * Ensures a table exists with proper locking to prevent race conditions
 * during concurrent initialization attempts
 */
export async function ensureTable(
  tableName: string,
  createTableSQL: string
): Promise<void> {
  // Get or create state for this table
  let state = tableInitState.get(tableName)
  if (!state) {
    state = {
      isInitializing: false,
      isInitialized: false,
      promise: null
    }
    tableInitState.set(tableName, state)
  }

  // If already initialized, return immediately
  if (state.isInitialized) {
    return
  }

  // If currently initializing, wait for it to complete
  if (state.isInitializing && state.promise) {
    return state.promise
  }

  // Set lock and create promise
  state.isInitializing = true
  state.promise = performTableInitialization(tableName, createTableSQL)
  
  try {
    await state.promise
    state.isInitialized = true
  } catch (error) {
    // Reset state on error so it can be retried
    state.isInitialized = false
    throw error
  } finally {
    state.isInitializing = false
  }
}

async function performTableInitialization(
  tableName: string,
  createTableSQL: string
): Promise<void> {
  try {
    await query(createTableSQL)
  } catch (error) {
    console.error(`Error ensuring ${tableName} table:`, error)
    throw error
  }
}

/**
 * Reset initialization state (useful for testing)
 */
export function resetTableInitState(): void {
  tableInitState.clear()
}
