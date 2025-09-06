/**
 * Database Integration Testing for AI Chat System
 * Phase 2: Testing database operations, session management, and analytics
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

class DatabaseTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  logTest(name, passed, details = '') {
    if (passed) {
      console.log(`✅ ${name}`);
      this.results.passed++;
    } else {
      console.log(`❌ ${name}: ${details}`);
      this.results.failed++;
      this.results.errors.push({ name, details });
    }
  }

  async testDatabaseConnection() {
    console.log('\n🔌 Testing Database Connection...');
    
    try {
      // Import database functions
      const { query } = require('../lib/database.ts');
      
      // Test basic connection
      const result = await query('SELECT NOW() as current_time, version() as pg_version');
      
      this.logTest(
        'Database Connection',
        result && result.length > 0,
        `Connected at ${result[0]?.current_time}`
      );
      
      this.logTest(
        'PostgreSQL Version',
        result[0]?.pg_version?.includes('PostgreSQL'),
        `Version: ${result[0]?.pg_version?.substring(0, 50)}...`
      );
      
      return true;
    } catch (error) {
      this.logTest('Database Connection', false, error.message);
      return false;
    }
  }

  async testAITablesExist() {
    console.log('\n🗃️ Testing AI Tables Existence...');
    
    try {
      const { query } = require('../lib/database.ts');
      
      const tables = ['ai_chat_sessions', 'ai_conversation_analytics', 'conversation_comparisons'];
      
      for (const table of tables) {
        const result = await query(`
          SELECT table_name, column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = $1 
          ORDER BY ordinal_position
        `, [table]);
        
        this.logTest(
          `Table ${table} exists`,
          result && result.length > 0,
          `Columns: ${result.length}`
        );
        
        if (result.length > 0) {
          const columns = result.map(r => r.column_name);
          
          // Check for required columns based on table
          let requiredColumns = [];
          switch (table) {
            case 'ai_chat_sessions':
              requiredColumns = ['session_id', 'conversation_type', 'persona', 'created_at'];
              break;
            case 'ai_conversation_analytics':
              requiredColumns = ['session_id', 'conversation_turn', 'response_quality_score'];
              break;
            case 'conversation_comparisons':
              requiredColumns = ['session_a', 'session_b', 'comparison_type'];
              break;
          }
          
          const hasAllRequired = requiredColumns.every(col => columns.includes(col));
          this.logTest(
            `${table} required columns`,
            hasAllRequired,
            `Missing: ${requiredColumns.filter(col => !columns.includes(col)).join(', ')}`
          );
        }
      }
      
      return true;
    } catch (error) {
      this.logTest('AI Tables Check', false, error.message);
      return false;
    }
  }

  async testSessionOperations() {
    console.log('\n📝 Testing Session Operations...');
    
    try {
      const { query } = require('../lib/database.ts');
      
      const testSessionId = `test-db-session-${Date.now()}`;
      
      // Test session creation
      await query(`
        INSERT INTO ai_chat_sessions (session_id, conversation_type, persona, ai_model, metadata)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        testSessionId,
        'interview',
        'technical_assessor',
        'openai/gpt-4o-mini',
        JSON.stringify({ test: true, created_by: 'db_test' })
      ]);
      
      this.logTest('Session Creation', true, `Session ID: ${testSessionId}`);
      
      // Test session retrieval
      const sessionResult = await query(`
        SELECT session_id, conversation_type, persona, created_at, metadata
        FROM ai_chat_sessions 
        WHERE session_id = $1
      `, [testSessionId]);
      
      this.logTest(
        'Session Retrieval',
        sessionResult.length === 1 && sessionResult[0].session_id === testSessionId,
        `Retrieved session: ${sessionResult[0]?.session_id}`
      );
      
      // Test session update
      await query(`
        UPDATE ai_chat_sessions 
        SET last_activity = NOW(), message_count = message_count + 1
        WHERE session_id = $1
      `, [testSessionId]);
      
      const updatedSession = await query(`
        SELECT message_count, last_activity
        FROM ai_chat_sessions 
        WHERE session_id = $1
      `, [testSessionId]);
      
      this.logTest(
        'Session Update',
        updatedSession[0]?.message_count === 1,
        `Message count: ${updatedSession[0]?.message_count}`
      );
      
      // Cleanup test session
      await query('DELETE FROM ai_chat_sessions WHERE session_id = $1', [testSessionId]);
      
      return true;
    } catch (error) {
      this.logTest('Session Operations', false, error.message);
      return false;
    }
  }

  async testAnalyticsOperations() {
    console.log('\n📊 Testing Analytics Operations...');
    
    try {
      const { query } = require('../lib/database.ts');
      
      const testSessionId = `test-analytics-session-${Date.now()}`;
      
      // Create a test session first
      await query(`
        INSERT INTO ai_chat_sessions (session_id, conversation_type, persona)
        VALUES ($1, $2, $3)
      `, [testSessionId, 'analysis', 'analyst']);
      
      // Test analytics insertion
      await query(`
        INSERT INTO ai_conversation_analytics (
          session_id, conversation_turn, question_type, response_quality_score,
          technical_depth_score, topics_mentioned, technologies_discussed,
          sources_utilized, response_time_ms
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        testSessionId,
        1,
        'technical_deep_dive',
        0.92,
        0.87,
        ['java', 'microservices', 'architecture'],
        ['Spring Boot', 'PostgreSQL', 'AWS'],
        JSON.stringify([{ title: 'Experience Record', relevance: 0.95 }]),
        1250
      ]);
      
      this.logTest('Analytics Creation', true, 'Analytics record created');
      
      // Test analytics retrieval
      const analyticsResult = await query(`
        SELECT session_id, conversation_turn, response_quality_score, topics_mentioned
        FROM ai_conversation_analytics 
        WHERE session_id = $1
      `, [testSessionId]);
      
      this.logTest(
        'Analytics Retrieval',
        analyticsResult.length === 1 && analyticsResult[0].response_quality_score === '0.92',
        `Quality score: ${analyticsResult[0]?.response_quality_score}`
      );
      
      this.logTest(
        'Topics Array Storage',
        Array.isArray(analyticsResult[0]?.topics_mentioned) && 
        analyticsResult[0]?.topics_mentioned.includes('java'),
        `Topics: ${analyticsResult[0]?.topics_mentioned?.join(', ')}`
      );
      
      // Test analytics aggregation
      const aggregateResult = await query(`
        SELECT 
          AVG(response_quality_score) as avg_quality,
          AVG(technical_depth_score) as avg_depth,
          COUNT(*) as turn_count
        FROM ai_conversation_analytics 
        WHERE session_id = $1
      `, [testSessionId]);
      
      this.logTest(
        'Analytics Aggregation',
        aggregateResult[0]?.turn_count === '1',
        `Avg quality: ${aggregateResult[0]?.avg_quality}`
      );
      
      // Cleanup
      await query('DELETE FROM ai_conversation_analytics WHERE session_id = $1', [testSessionId]);
      await query('DELETE FROM ai_chat_sessions WHERE session_id = $1', [testSessionId]);
      
      return true;
    } catch (error) {
      this.logTest('Analytics Operations', false, error.message);
      return false;
    }
  }

  async testConversationHistory() {
    console.log('\n💬 Testing Conversation History...');
    
    try {
      const { query } = require('../lib/database.ts');
      
      const testSessionId = `test-history-session-${Date.now()}`;
      
      // Test conversation logging (using existing conversations/conversation_logs table)
      await query(`
        INSERT INTO conversation_logs (user_message, ai_response, session_id, metadata)
        VALUES ($1, $2, $3, $4)
      `, [
        'Tell me about your Java experience',
        'I have 8+ years of experience with Java development...',
        testSessionId,
        JSON.stringify({ persona: 'technical_assessor', turn: 1 })
      ]);
      
      this.logTest('Conversation Logging', true, 'Conversation logged');
      
      // Test conversation retrieval
      const historyResult = await query(`
        SELECT user_message, ai_response, created_at, metadata
        FROM conversation_logs 
        WHERE session_id = $1 
        ORDER BY created_at ASC
      `, [testSessionId]);
      
      this.logTest(
        'Conversation Retrieval',
        historyResult.length === 1 && historyResult[0].user_message.includes('Java'),
        `Retrieved ${historyResult.length} conversations`
      );
      
      // Test conversation count
      const countResult = await query(`
        SELECT COUNT(*) as conversation_count
        FROM conversation_logs 
        WHERE session_id = $1
      `, [testSessionId]);
      
      this.logTest(
        'Conversation Count',
        countResult[0]?.conversation_count === '1',
        `Count: ${countResult[0]?.conversation_count}`
      );
      
      // Cleanup
      await query('DELETE FROM conversation_logs WHERE session_id = $1', [testSessionId]);
      
      return true;
    } catch (error) {
      this.logTest('Conversation History', false, error.message);
      return false;
    }
  }

  async testIndexPerformance() {
    console.log('\n⚡ Testing Index Performance...');
    
    try {
      const { query } = require('../lib/database.ts');
      
      // Test that indexes exist for AI tables
      const indexResult = await query(`
        SELECT indexname, tablename 
        FROM pg_indexes 
        WHERE tablename IN ('ai_chat_sessions', 'ai_conversation_analytics', 'conversation_comparisons')
        ORDER BY tablename, indexname
      `);
      
      const indexes = indexResult.map(r => `${r.tablename}.${r.indexname}`);
      
      this.logTest(
        'AI Tables Have Indexes',
        indexes.length > 0,
        `Found ${indexes.length} indexes`
      );
      
      // Check for specific performance-critical indexes
      const criticalIndexes = [
        'ai_chat_sessions_pkey',
        'idx_ai_chat_sessions_type',
        'idx_ai_analytics_session'
      ];
      
      criticalIndexes.forEach(indexName => {
        const exists = indexes.some(idx => idx.includes(indexName.replace('idx_', '')));
        this.logTest(
          `Index ${indexName}`,
          exists,
          exists ? 'Found' : 'Missing'
        );
      });
      
      return true;
    } catch (error) {
      this.logTest('Index Performance', false, error.message);
      return false;
    }
  }

  async runAllTests() {
    console.log('\n🧪 PHASE 2: Database Integration Testing\n');
    
    if (!loadEnv()) {
      console.log('❌ Environment setup failed');
      return false;
    }
    
    const connectionOk = await this.testDatabaseConnection();
    if (!connectionOk) {
      console.log('❌ Database connection failed - skipping remaining tests');
      return false;
    }
    
    await this.testAITablesExist();
    await this.testSessionOperations();
    await this.testAnalyticsOperations();
    await this.testConversationHistory();
    await this.testIndexPerformance();
    
    // Print test summary
    console.log('\n📊 Database Integration Test Results:');
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    
    if (this.results.failed > 0) {
      console.log('\n🔍 Failed Tests:');
      this.results.errors.forEach(error => {
        console.log(`   • ${error.name}: ${error.details}`);
      });
    }
    
    const successRate = (this.results.passed / (this.results.passed + this.results.failed)) * 100;
    console.log(`\n🎯 Success Rate: ${successRate.toFixed(1)}%`);
    
    return this.results.failed === 0;
  }
}

// Run the tests
const tester = new DatabaseTester();
tester.runAllTests().then(success => {
  console.log('\n🎉 Database Integration Testing Completed!');
  if (success) {
    console.log('✅ All database operations working correctly');
  } else {
    console.log('⚠️ Some database tests failed - Review and fix before deployment');
  }
}).catch(error => {
  console.error('💥 Database test suite crashed:', error);
});