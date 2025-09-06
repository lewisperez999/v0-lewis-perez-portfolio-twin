/**
 * Check existing database tables
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

async function checkTables() {
  console.log('🔍 Checking existing database tables...\n');
  
  try {
    const client = await pool.connect();
    
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('Existing tables:');
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    console.log(`\nTotal tables: ${result.rows.length}\n`);
    
    // Check if AI tables exist
    const aiTables = ['ai_chat_sessions', 'ai_conversation_analytics', 'conversation_comparisons'];
    const existingTables = result.rows.map(r => r.table_name);
    
    console.log('AI Tables Status:');
    aiTables.forEach(table => {
      const exists = existingTables.includes(table);
      console.log(`  ${exists ? '✅' : '❌'} ${table}`);
    });
    
    client.release();
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkTables();