"use server"

import { query, getDatabaseHealth } from "@/lib/database"
import "@/lib/db-init" // Auto-initialize database tables

// Database query result interfaces
interface ConversationLogRow {
  id: string
  session_id?: string
  user_message: string
  ai_response: string
  response_time_ms?: number
  status: "answered" | "pending" | "failed"
  model_used?: string
  vector_sources?: Record<string, unknown>[]
  context_used?: string
  user_ip?: string
  user_agent?: string
  created_at: string | Date
  updated_at: string | Date
}

interface ConversationStatsRow {
  total: string | number
  answered: string | number
  pending: string | number
  failed: string | number
  average_response_time: string | number
}

interface DeleteResultRow {
  deleted_count: string | number
}

interface CountRow {
  count: string | number
}

export interface ConversationLog {
  id: string
  session_id?: string
  user_message: string
  ai_response: string
  response_time_ms?: number
  status: "answered" | "pending" | "failed"
  model_used?: string
  vector_sources?: Record<string, unknown>[]
  context_used?: string
  user_ip?: string
  user_agent?: string
  created_at: Date
  updated_at: Date
}

export interface ConversationStats {
  total: number
  answered: number
  pending: number
  failed: number
  averageResponseTime: number
}

// Ensure the conversations table exists
async function ensureTablesExist(): Promise<void> {
  try {
    // Create the conversations table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id VARCHAR(255),
        user_message TEXT NOT NULL,
        ai_response TEXT NOT NULL,
        response_time_ms INTEGER,
        status VARCHAR(20) NOT NULL CHECK (status IN ('answered', 'pending', 'failed')),
        model_used VARCHAR(100),
        vector_sources JSONB,
        context_used TEXT,
        user_ip VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `)

    // Create indexes if they don't exist
    await query(`
      CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC)
    `)
    
    await query(`
      CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status)
    `)

    console.log("Conversations table and indexes ensured")
  } catch (error) {
    console.error("Error ensuring conversations table exists:", error)
    throw error
  }
}

// Log a new conversation to the database
export async function logConversation(
  userMessage: string,
  aiResponse: string,
  status: "answered" | "pending" | "failed" = "answered",
  responseTimeMs?: number,
  sessionId?: string,
  modelUsed?: string,
  vectorSources?: Record<string, unknown>[],
  contextUsed?: string
): Promise<void> {
  try {
    // Ensure table exists first
    await ensureTablesExist()

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const result = await query(`
      INSERT INTO conversations (
        session_id,
        user_message, 
        ai_response, 
        response_time_ms, 
        status, 
        model_used, 
        vector_sources, 
        context_used
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `, [
      sessionId || null,
      userMessage.trim(),
      aiResponse.trim(),
      responseTimeMs || null,
      status,
      modelUsed || null,
      vectorSources ? JSON.stringify(vectorSources) : null,
      contextUsed || null
    ])

    console.log(`Logged conversation to database: "${userMessage.substring(0, 50)}..." - Status: ${status}`)
  } catch (error) {
    console.error("Error logging conversation to database:", error)
    // Don't throw the error to prevent breaking the chat flow
    // In production, you might want to log this to an error tracking service
  }
}

// Get recent conversations from the database
export async function getRecentConversations(limit: number = 10): Promise<ConversationLog[]> {
  try {
    await ensureTablesExist()

    const rows = await query<ConversationLogRow>(`
      SELECT 
        id,
        session_id,
        user_message,
        ai_response,
        response_time_ms,
        status,
        model_used,
        vector_sources,
        context_used,
        user_ip,
        user_agent,
        created_at,
        updated_at
      FROM conversations 
      ORDER BY created_at DESC 
      LIMIT $1
    `, [limit])

    return rows.map(row => ({
      id: row.id,
      session_id: row.session_id,
      user_message: row.user_message,
      ai_response: row.ai_response,
      response_time_ms: row.response_time_ms,
      status: row.status,
      model_used: row.model_used,
      vector_sources: row.vector_sources,
      context_used: row.context_used,
      user_ip: row.user_ip,
      user_agent: row.user_agent,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    }))
  } catch (error) {
    console.error("Error getting recent conversations:", error)
    return []
  }
}

// Get conversation statistics from the database
export async function getConversationStats(): Promise<ConversationStats> {
  try {
    await ensureTablesExist()

    const [statsRow] = await query<ConversationStatsRow>(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'answered') as answered,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'failed') as failed,
        COALESCE(AVG(response_time_ms) FILTER (WHERE response_time_ms IS NOT NULL), 0)::INTEGER as average_response_time
      FROM conversations
    `)

    return {
      total: parseInt(String(statsRow.total)) || 0,
      answered: parseInt(String(statsRow.answered)) || 0,
      pending: parseInt(String(statsRow.pending)) || 0,
      failed: parseInt(String(statsRow.failed)) || 0,
      averageResponseTime: parseInt(String(statsRow.average_response_time)) || 0
    }
  } catch (error) {
    console.error("Error getting conversation stats:", error)
    return {
      total: 0,
      answered: 0,
      pending: 0,
      failed: 0,
      averageResponseTime: 0
    }
  }
}

// Clear old conversations (cleanup function)
export async function clearOldConversations(olderThanDays: number = 30): Promise<number> {
  try {
    await ensureTablesExist()

    const [result] = await query<DeleteResultRow>(`
      WITH deleted AS (
        DELETE FROM conversations 
        WHERE created_at < NOW() - INTERVAL '${olderThanDays} days'
        RETURNING id
      )
      SELECT COUNT(*) as deleted_count FROM deleted
    `)

    const deletedCount = parseInt(String(result.deleted_count)) || 0
    console.log(`Cleared ${deletedCount} old conversations`)
    
    return deletedCount
  } catch (error) {
    console.error("Error clearing old conversations:", error)
    return 0
  }
}

// Get database health for system monitoring
export async function getConversationDatabaseHealth() {
  try {
    const dbHealth = await getDatabaseHealth()
    
    // Additional conversation-specific health checks
    const recentCount = await query<CountRow>(`
      SELECT COUNT(*) as count 
      FROM conversations 
      WHERE created_at >= NOW() - INTERVAL '24 hours'
    `)

    return {
      ...dbHealth,
      details: {
        ...dbHealth.details,
        recent_conversations_24h: parseInt(String(recentCount[0]?.count)) || 0
      }
    }
  } catch (error) {
    return {
      status: 'error' as const,
      message: 'Conversation database health check failed',
      details: { error: error instanceof Error ? error.message : error }
    }
  }
}