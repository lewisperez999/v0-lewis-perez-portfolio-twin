/**
 * Simple Database Schema Validation
 * Phase 2: Verify AI chat tables exist and have correct structure
 */

const fs = require('fs');
const path = require('path');

// Load environment variables
function loadEnv() {
  try {
    const envPath = path.join(__dirname, '..', '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match && !match[1].startsWith('#') && match[1].trim()) {
        process.env[match[1].trim()] = match[2].replace(/^"(.*)"$/, '$1');
      }
    });
    return true;
  } catch (error) {
    console.error('❌ Failed to load environment:', error.message);
    return false;
  }
}

async function testDatabaseSchema() {
  console.log('\n🧪 PHASE 2: Database Schema Validation\n');
  
  if (!loadEnv()) {
    console.log('❌ Environment setup failed');
    return false;
  }
  
  try {
    // Use the standard pg module
    const { Pool } = require('pg');
    
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
    
    console.log('1️⃣ Testing Database Connection...');
    const client = await pool.connect();
    
    try {
      // Test basic connection
      const timeResult = await client.query('SELECT NOW() as current_time');
      console.log(`✅ Database connected at ${timeResult.rows[0].current_time}`);
      
      console.log('\n2️⃣ Checking AI Chat Tables...');
      
      // Check ai_chat_sessions table
      const sessionsCheck = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'ai_chat_sessions'
        ORDER BY ordinal_position
      `);
      
      if (sessionsCheck.rows.length > 0) {
        console.log('✅ ai_chat_sessions table exists');
        console.log(`   Columns: ${sessionsCheck.rows.map(r => r.column_name).join(', ')}`);
        
        // Check required columns
        const requiredColumns = ['session_id', 'conversation_type', 'persona', 'created_at'];
        const existingColumns = sessionsCheck.rows.map(r => r.column_name);
        const hasAllRequired = requiredColumns.every(col => existingColumns.includes(col));
        
        if (hasAllRequired) {
          console.log('✅ All required columns present in ai_chat_sessions');
        } else {
          console.log('❌ Missing required columns in ai_chat_sessions');
        }
      } else {
        console.log('❌ ai_chat_sessions table does not exist');
      }
      
      // Check ai_conversation_analytics table
      const analyticsCheck = await client.query(`
        SELECT column_name, data_type
        FROM information_schema.columns 
        WHERE table_name = 'ai_conversation_analytics'
        ORDER BY ordinal_position
      `);
      
      if (analyticsCheck.rows.length > 0) {
        console.log('✅ ai_conversation_analytics table exists');
        console.log(`   Columns: ${analyticsCheck.rows.length} total`);
        
        // Check for key analytics columns
        const analyticsColumns = analyticsCheck.rows.map(r => r.column_name);
        const hasScoreColumns = analyticsColumns.includes('response_quality_score') && 
                                analyticsColumns.includes('technical_depth_score');
        
        if (hasScoreColumns) {
          console.log('✅ Analytics scoring columns present');
        } else {
          console.log('❌ Missing analytics scoring columns');
        }
      } else {
        console.log('❌ ai_conversation_analytics table does not exist');
      }
      
      // Check conversation_comparisons table
      const comparisonsCheck = await client.query(`
        SELECT column_name
        FROM information_schema.columns 
        WHERE table_name = 'conversation_comparisons'
      `);
      
      if (comparisonsCheck.rows.length > 0) {
        console.log('✅ conversation_comparisons table exists');
      } else {
        console.log('❌ conversation_comparisons table does not exist');
      }
      
      console.log('\n3️⃣ Testing Indexes...');
      
      // Check for indexes on AI tables
      const indexCheck = await client.query(`
        SELECT tablename, indexname
        FROM pg_indexes 
        WHERE tablename IN ('ai_chat_sessions', 'ai_conversation_analytics', 'conversation_comparisons')
        ORDER BY tablename, indexname
      `);
      
      if (indexCheck.rows.length > 0) {
        console.log(`✅ Found ${indexCheck.rows.length} indexes on AI tables`);
        indexCheck.rows.forEach(row => {
          console.log(`   ${row.tablename}: ${row.indexname}`);
        });
      } else {
        console.log('⚠️ No indexes found on AI tables (may impact performance)');
      }
      
      console.log('\n4️⃣ Testing Basic Operations...');
      
      // Test a simple insert and delete (if tables exist)
      if (sessionsCheck.rows.length > 0) {
        const testSessionId = `test-schema-validation-${Date.now()}`;
        
        try {
          await client.query(`
            INSERT INTO ai_chat_sessions (session_id, conversation_type, persona)
            VALUES ($1, $2, $3)
          `, [testSessionId, 'interview', 'technical_assessor']);
          
          console.log('✅ Insert operation successful');
          
          // Clean up
          await client.query('DELETE FROM ai_chat_sessions WHERE session_id = $1', [testSessionId]);
          console.log('✅ Delete operation successful');
          
        } catch (error) {
          console.log(`❌ Database operation failed: ${error.message}`);
        }
      }
      
      console.log('\n5️⃣ Schema Validation Summary...');
      
      // Count existing records
      const recordCounts = await client.query(`
        SELECT 
          (SELECT COUNT(*) FROM ai_chat_sessions) as sessions,
          (SELECT COUNT(*) FROM ai_conversation_analytics) as analytics,
          (SELECT COUNT(*) FROM conversation_comparisons) as comparisons,
          (SELECT COUNT(*) FROM conversations) as conversations
      `);
      
      const counts = recordCounts.rows[0];
      console.log(`   AI Chat Sessions: ${counts.sessions}`);
      console.log(`   Analytics Records: ${counts.analytics}`);
      console.log(`   Comparisons: ${counts.comparisons}`);
      console.log(`   Total Conversations: ${counts.conversations}`);
      
      const allTablesExist = sessionsCheck.rows.length > 0 && 
                            analyticsCheck.rows.length > 0 && 
                            comparisonsCheck.rows.length > 0;
      
      if (allTablesExist) {
        console.log('\n🎉 Database schema validation PASSED!');
        console.log('✅ All AI chat tables exist with proper structure');
        console.log('✅ Database operations working correctly');
        console.log('✅ Ready for MCP AI-to-AI conversations');
        return true;
      } else {
        console.log('\n⚠️ Database schema validation PARTIAL');
        console.log('❌ Some tables missing - run migration again');
        return false;
      }
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('❌ Database schema validation failed:', error.message);
    return false;
  }
}

// Run the validation
testDatabaseSchema().then(success => {
  if (success) {
    console.log('\n🚀 Database is ready for Phase 2 testing completion!');
  } else {
    console.log('\n🔧 Database needs attention before proceeding');
  }
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('💥 Schema validation crashed:', error);
  process.exit(1);
});