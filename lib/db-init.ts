// Database initialization script
// This runs automatically when the app starts to ensure required tables exist

import { query } from "./database"

// Singleton pattern with lock to prevent concurrent initialization
let isInitializing = false
let isInitialized = false
let initializationPromise: Promise<void> | null = null

export async function initializeDatabase(): Promise<void> {
  // If already initialized, return immediately
  if (isInitialized) {
    return
  }

  // If currently initializing, wait for it to complete
  if (isInitializing && initializationPromise) {
    return initializationPromise
  }

  // Set lock and create promise
  isInitializing = true
  initializationPromise = performInitialization()
  
  try {
    await initializationPromise
    isInitialized = true
  } finally {
    isInitializing = false
  }
}

async function performInitialization(): Promise<void> {
  try {
    console.log("🗄️  Initializing database...")

    // Create conversations table with all required columns
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

    // Create performance indexes
    await query(`CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_conversations_session_id ON conversations(session_id)`)

    // Create updated_at trigger function if it doesn't exist
    await query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `)

    // Create trigger for conversations table
    await query(`
      DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
      CREATE TRIGGER update_conversations_updated_at 
          BEFORE UPDATE ON conversations 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `)

    console.log("✅ Database initialization completed successfully")
  } catch (error) {
    console.error("❌ Database initialization failed:", error)
    // Don't throw error to prevent app from crashing
    // The app should continue to work even if database setup fails
  }
}

// Only auto-initialize at runtime (not during build)
// Check if we're in a browser or server runtime context
if (
  process.env.NODE_ENV !== 'test' && 
  typeof process.env.NEXT_PHASE === 'undefined' &&
  process.env.VERCEL_ENV !== undefined
) {
  // Only run on Vercel runtime, not during build
  initializeDatabase().catch(err => {
    console.error('Failed to auto-initialize database:', err)
  })
}