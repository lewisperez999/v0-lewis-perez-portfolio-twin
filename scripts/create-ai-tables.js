/**
 * Create AI Chat Tables
 * Manually create the required AI chat tables for MCP functionality
 */

const fs = require('fs');
const path = require('path');

// Load environment variables
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match && !match[1].startsWith('#') && match[1].trim()) {
    process.env[match[1].trim()] = match[2].replace(/^"(.*)"$/, '$1');
  }
});

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function createAITables() {
  console.log('🏗️ Creating AI Chat Tables...\n');
  
  try {
    const client = await pool.connect();
    
    console.log('1️⃣ Creating ai_chat_sessions table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS ai_chat_sessions (
        session_id VARCHAR(255) PRIMARY KEY,
        conversation_type VARCHAR(50) NOT NULL CHECK (conversation_type IN ('interview', 'assessment', 'exploration', 'analysis')),
        persona VARCHAR(50) CHECK (persona IN ('interviewer', 'technical_assessor', 'curious_explorer', 'analyst')),
        ai_model VARCHAR(100) DEFAULT 'openai/gpt-4o-mini',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        message_count INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        metadata JSONB DEFAULT '{}'
      )
    `);
    console.log('✅ ai_chat_sessions table created');
    
    console.log('2️⃣ Creating ai_conversation_analytics table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS ai_conversation_analytics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id VARCHAR(255) REFERENCES ai_chat_sessions(session_id) ON DELETE CASCADE,
        conversation_turn INTEGER NOT NULL,
        question_type VARCHAR(100),
        response_quality_score DECIMAL(3,2) CHECK (response_quality_score >= 0 AND response_quality_score <= 1),
        technical_depth_score DECIMAL(3,2) CHECK (technical_depth_score >= 0 AND technical_depth_score <= 1),
        topics_mentioned TEXT[],
        technologies_discussed TEXT[],
        sources_utilized JSONB DEFAULT '[]',
        response_time_ms INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('✅ ai_conversation_analytics table created');
    
    console.log('3️⃣ Creating conversation_comparisons table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS conversation_comparisons (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_a VARCHAR(255) REFERENCES ai_chat_sessions(session_id),
        session_b VARCHAR(255) REFERENCES ai_chat_sessions(session_id),
        comparison_type VARCHAR(50) NOT NULL,
        quality_difference DECIMAL(3,2),
        engagement_score DECIMAL(3,2),
        insights JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        CONSTRAINT different_sessions CHECK (session_a != session_b)
      )
    `);
    console.log('✅ conversation_comparisons table created');
    
    console.log('4️⃣ Creating indexes...');
    
    // Indexes for ai_chat_sessions
    await client.query('CREATE INDEX IF NOT EXISTS idx_ai_chat_sessions_type ON ai_chat_sessions(conversation_type, created_at DESC)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_ai_chat_sessions_persona ON ai_chat_sessions(persona, last_activity DESC)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_ai_chat_sessions_active ON ai_chat_sessions(is_active, last_activity DESC)');
    
    // Indexes for ai_conversation_analytics
    await client.query('CREATE INDEX IF NOT EXISTS idx_ai_analytics_session ON ai_conversation_analytics(session_id, conversation_turn)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_ai_analytics_scores ON ai_conversation_analytics(response_quality_score DESC, technical_depth_score DESC)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_ai_analytics_topics ON ai_conversation_analytics USING GIN(topics_mentioned)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_ai_analytics_tech ON ai_conversation_analytics USING GIN(technologies_discussed)');
    
    // Indexes for conversation_comparisons
    await client.query('CREATE INDEX IF NOT EXISTS idx_conversation_comparisons_type ON conversation_comparisons(comparison_type, created_at DESC)');
    
    console.log('✅ All indexes created');
    
    console.log('5️⃣ Testing table creation...');
    
    // Test insert into ai_chat_sessions
    const testSessionId = `test-creation-${Date.now()}`;
    await client.query(`
      INSERT INTO ai_chat_sessions (session_id, conversation_type, persona, metadata)
      VALUES ($1, $2, $3, $4)
    `, [testSessionId, 'interview', 'technical_assessor', JSON.stringify({ test: true })]);
    
    console.log('✅ Test insert successful');
    
    // Clean up test data
    await client.query('DELETE FROM ai_chat_sessions WHERE session_id = $1', [testSessionId]);
    console.log('✅ Test cleanup successful');
    
    console.log('6️⃣ Verifying final structure...');
    
    // Check all tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name IN ('ai_chat_sessions', 'ai_conversation_analytics', 'conversation_comparisons')
      ORDER BY table_name
    `);
    
    console.log('Created AI tables:');
    tablesResult.rows.forEach(row => {
      console.log(`  ✅ ${row.table_name}`);
    });
    
    // Check indexes
    const indexesResult = await client.query(`
      SELECT tablename, indexname 
      FROM pg_indexes 
      WHERE tablename IN ('ai_chat_sessions', 'ai_conversation_analytics', 'conversation_comparisons')
      ORDER BY tablename, indexname
    `);
    
    console.log(`\nCreated indexes: ${indexesResult.rows.length} total`);
    indexesResult.rows.forEach(row => {
      console.log(`  ✅ ${row.tablename}.${row.indexname}`);
    });
    
    client.release();
    
    console.log('\n🎉 AI Chat Tables Successfully Created!');
    console.log('✅ All tables, constraints, and indexes are in place');
    console.log('✅ Ready for MCP AI-to-AI conversations');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error creating AI tables:', error.message);
    console.error(error.stack);
    return false;
  } finally {
    await pool.end();
  }
}

createAITables().then(success => {
  if (success) {
    console.log('\n🚀 Database is now ready for AI chat functionality!');
  } else {
    console.log('\n💥 Failed to create AI chat tables');
  }
  process.exit(success ? 0 : 1);
});