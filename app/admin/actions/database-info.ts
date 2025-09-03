"use server"

import { query } from "@/lib/database"

// Database query result interfaces
interface TableRow {
  table_name: string
  table_type: string
}

interface CountRow {
  count: string | number
}

interface SampleChunkRow {
  chunk_id: string
  title: string
  content_length: string | number
  chunk_type: string
}

export interface DatabaseInfo {
  tables: string[]
  tableCount: number
  recordCounts: Record<string, number>
  totalRecords: number
  contentChunksCount: number
  conversationsCount: number
  sampleChunks?: Array<{
    chunk_id: string
    title: string
    content_length: number
    chunk_type: string
  }>
  error?: string
}

export async function checkDatabaseRecords(): Promise<DatabaseInfo> {
  try {
    console.log("🔍 Checking database records...")
    
    // Check what tables exist
    const tables = await query<TableRow>(`
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `)
    
    const results: DatabaseInfo = {
      tables: tables.map(t => t.table_name),
      tableCount: tables.length,
      recordCounts: {},
      totalRecords: 0,
      contentChunksCount: 0,
      conversationsCount: 0
    }
    
    // Check if content_chunks table exists
    const contentChunksExists = tables.some(t => t.table_name === 'content_chunks')
    
    if (contentChunksExists) {
      const [chunkCount] = await query<CountRow>(`SELECT COUNT(*) as count FROM content_chunks`)
      results.contentChunksCount = parseInt(String(chunkCount.count)) || 0
      results.recordCounts.content_chunks = results.contentChunksCount
      results.totalRecords += results.contentChunksCount
      
      // Get some sample records
      const samples = await query<SampleChunkRow>(`
        SELECT chunk_id, title, LENGTH(content) as content_length, chunk_type
        FROM content_chunks 
        ORDER BY created_at DESC 
        LIMIT 3
      `)
      
      results.sampleChunks = samples.map(sample => ({
        chunk_id: sample.chunk_id,
        title: sample.title,
        content_length: parseInt(String(sample.content_length)) || 0,
        chunk_type: sample.chunk_type
      }))
    }
    
    // Check conversations table
    const conversationsExists = tables.some(t => t.table_name === 'conversations')
    
    if (conversationsExists) {
      const [convCount] = await query<CountRow>(`SELECT COUNT(*) as count FROM conversations`)
      results.conversationsCount = parseInt(String(convCount.count)) || 0
      results.recordCounts.conversations = results.conversationsCount
      results.totalRecords += results.conversationsCount
    }
    
    // Count records in other tables
    for (const table of tables) {
      if (table.table_name !== 'content_chunks' && table.table_name !== 'conversations') {
        try {
          const [count] = await query<CountRow>(`SELECT COUNT(*) as count FROM ${table.table_name}`)
          const tableCount = parseInt(String(count.count)) || 0
          results.recordCounts[table.table_name] = tableCount
          results.totalRecords += tableCount
        } catch (error) {
          console.error(`Error counting ${table.table_name}:`, error)
          results.recordCounts[table.table_name] = 0
        }
      }
    }
    
    console.log(`📊 Database check completed - Total records: ${results.totalRecords}`)
    return results
    
  } catch (error) {
    console.error("Database check failed:", error)
    return {
      tables: [],
      tableCount: 0,
      recordCounts: {},
      totalRecords: 0,
      contentChunksCount: 0,
      conversationsCount: 0,
      error: error instanceof Error ? error.message : "Database check failed"
    }
  }
}

export async function getActualDatabaseRecordCount(): Promise<number> {
  try {
    const info = await checkDatabaseRecords()
    
    // If we have content_chunks, that's our primary metric
    if (info.contentChunksCount > 0) {
      console.log(`📚 Content chunks found: ${info.contentChunksCount}`)
      return info.contentChunksCount
    }
    
    // Otherwise return total records across all tables
    console.log(`📊 Total database records: ${info.totalRecords}`)
    return info.totalRecords
    
  } catch (error) {
    console.error("Error getting database record count:", error)
    return 0
  }
}