// Database connection utilities
import { Pool, PoolClient } from 'pg'

// Global connection pool
let pool: Pool | null = null

// Initialize the database pool
function initializePool(): Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set')
  }

  return new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  })
}

// Get or create the database pool
export function getPool(): Pool {
  // During build phase, don't create pool if DATABASE_URL is missing
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not set - database operations will fail')
  }
  
  if (!pool) {
    pool = initializePool()
    
    // Handle pool errors
    pool.on('error', (err: Error) => {
      console.error('Database pool error:', err)
    })
  }

  return pool
}

// Execute a query with automatic connection management
export async function query<T = Record<string, unknown>>(
  text: string, 
  params?: unknown[]
): Promise<T[]> {
  const pool = getPool()
  const client = await pool.connect()

  try {
    const result = await client.query(text, params)
    return result.rows
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  } finally {
    client.release()
  }
}

// Execute multiple queries in a transaction
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const pool = getPool()
  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

// Health check function
export async function getDatabaseHealth(): Promise<{
  status: 'healthy' | 'warning' | 'error'
  message: string
  details?: Record<string, unknown>
}> {
  try {
    const startTime = Date.now()
    await query('SELECT 1 as test')
    
    const responseTime = Date.now() - startTime
    
    if (responseTime > 1000) {
      return {
        status: 'warning',
        message: `Database responding slowly (${responseTime}ms)`,
        details: { responseTime }
      }
    }
    
    return {
      status: 'healthy',
      message: `Database healthy (${responseTime}ms)`,
      details: { responseTime }
    }
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Database connection failed',
      details: { error: error instanceof Error ? error.message : error }
    }
  }
}

// Close the pool (for cleanup)
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end()
    pool = null
  }
}

const databaseConfig = {
  query,
  transaction,
  getDatabaseHealth,
  getPool,
  closePool
}

export default databaseConfig
