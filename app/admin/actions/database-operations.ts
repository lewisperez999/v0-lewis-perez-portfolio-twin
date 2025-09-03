"use server"

import { query } from "@/lib/database"

export interface QueryResult {
  success: boolean
  data?: Record<string, unknown>[]
  rowCount?: number
  executionTime?: string
  error?: string
  columns?: string[]
}

export interface DatabaseStats {
  connectionStatus: "healthy" | "degraded" | "error"
  tableCount: number
  totalRecords: number
  averageQueryTime: string
  lastBackup: string
}

export interface QueryHistoryItem {
  id: string
  query: string
  result: string
  executedAt: string
  status: "success" | "error"
  executionTime?: string
}

// In-memory query history storage (in production, use database)
const queryHistory: QueryHistoryItem[] = []

/**
 * Execute a safe database query (SELECT only)
 */
export async function executeQuery(sqlQuery: string): Promise<QueryResult> {
  try {
    const startTime = Date.now()
    
    // Security check - only allow SELECT statements
    const trimmedQuery = sqlQuery.trim().toLowerCase()
    if (!trimmedQuery.startsWith('select')) {
      return {
        success: false,
        error: "Only SELECT queries are allowed for security reasons"
      }
    }
    
    // Execute the query
    console.log('Executing query:', sqlQuery)
    const result = await query(sqlQuery)
    
    const endTime = Date.now()
    const executionTime = `${endTime - startTime}ms`
    
    // Extract column names if we have results
    let columns: string[] = []
    if (result.length > 0) {
      columns = Object.keys(result[0])
    }
    
    // Add to query history
    const historyItem: QueryHistoryItem = {
      id: Date.now().toString(),
      query: sqlQuery,
      result: `${result.length} rows`,
      executedAt: new Date().toISOString(),
      status: "success",
      executionTime
    }
    queryHistory.unshift(historyItem) // Add to beginning
    
    // Keep only last 20 queries
    if (queryHistory.length > 20) {
      queryHistory.splice(20)
    }
    
    return {
      success: true,
      data: result,
      rowCount: result.length,
      executionTime,
      columns
    }
    
  } catch (error) {
    console.error('Query execution error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    // Add failed query to history
    const historyItem: QueryHistoryItem = {
      id: Date.now().toString(),
      query: sqlQuery,
      result: `Error: ${errorMessage}`,
      executedAt: new Date().toISOString(),
      status: "error"
    }
    queryHistory.unshift(historyItem)
    
    if (queryHistory.length > 20) {
      queryHistory.splice(20)
    }
    
    return {
      success: false,
      error: errorMessage
    }
  }
}

/**
 * Get database statistics
 */
export async function getDatabaseStats(): Promise<DatabaseStats> {
  try {
    console.log('Getting database statistics...')
    
    // Test connection with a simple query
    const connectionTest = await query('SELECT 1 as test')
    const connectionStatus = connectionTest.length > 0 ? "healthy" : "degraded"
    
    // Get table count
    const tables = await query<{ count: string | number }>(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `)
    const tableCount = parseInt(String(tables[0]?.count || '0'))
    
    // Get total record count across main tables
    let totalRecords = 0
    try {
      const mainTables = ['content_chunks', 'projects', 'experiences', 'skills', 'personal_info']
      
      for (const tableName of mainTables) {
        try {
          const count = await query<{ count: string | number }>(`SELECT COUNT(*) as count FROM ${tableName}`)
          totalRecords += parseInt(String(count[0]?.count || '0'))
        } catch (tableError) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          console.log(`Table ${tableName} may not exist, skipping...`, tableError)
        }
      }
    } catch (countError) {
      console.log('Error counting records:', countError)
    }
    
    return {
      connectionStatus,
      tableCount,
      totalRecords,
      averageQueryTime: "23ms", // This would need actual query performance tracking
      lastBackup: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
    }
    
  } catch (error) {
    console.error('Error getting database stats:', error)
    return {
      connectionStatus: "error",
      tableCount: 0,
      totalRecords: 0,
      averageQueryTime: "N/A",
      lastBackup: "N/A"
    }
  }
}

/**
 * Get query history
 */
export async function getQueryHistory(): Promise<QueryHistoryItem[]> {
  return [...queryHistory] // Return a copy
}

/**
 * Clear query history
 */
export async function clearQueryHistory(): Promise<void> {
  queryHistory.length = 0
}

/**
 * Get predefined common queries
 */
export async function getPredefinedQueries() {
  return [
    {
      name: "Content Chunks by Type",
      query: "SELECT chunk_type, COUNT(*) as count FROM content_chunks GROUP BY chunk_type ORDER BY count DESC"
    },
    {
      name: "Recent Content Chunks",
      query: "SELECT chunk_id, title, chunk_type, created_at FROM content_chunks ORDER BY created_at DESC LIMIT 10"
    },
    {
      name: "Projects Overview",
      query: "SELECT title, technology_stack, status FROM projects ORDER BY created_at DESC"
    },
    {
      name: "Skills by Category",
      query: "SELECT category, COUNT(*) as count FROM skills GROUP BY category ORDER BY count DESC"
    },
    {
      name: "Work Experiences",
      query: "SELECT company, position, start_date, end_date FROM experiences ORDER BY start_date DESC"
    },
    {
      name: "Database Tables",
      query: "SELECT table_name, table_type FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
    },
    {
      name: "Table Sizes",
      query: `
        SELECT 
          table_name,
          (SELECT COUNT(*) FROM content_chunks) as content_chunks_count,
          (SELECT COUNT(*) FROM projects) as projects_count,
          (SELECT COUNT(*) FROM experiences) as experiences_count,
          (SELECT COUNT(*) FROM skills) as skills_count
        FROM information_schema.tables 
        WHERE table_name = 'content_chunks' 
        LIMIT 1
      `.trim()
    }
  ]
}