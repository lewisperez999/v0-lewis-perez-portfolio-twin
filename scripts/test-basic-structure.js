/**
 * Simple MCP Server Test - CommonJS Version
 * Phase 2: Basic functionality testing
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
    console.log('✅ Environment variables loaded');
    return true;
  } catch (error) {
    console.error('❌ Failed to load environment:', error.message);
    return false;
  }
}

async function testBasicMCPStructure() {
  console.log('\n🧪 PHASE 2: Basic MCP Structure Testing\n');
  
  const envLoaded = loadEnv();
  
  console.log('1️⃣ Testing Environment Setup...');
  console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Set' : '❌ Missing'}`);
  console.log(`   AI_GATEWAY_API_KEY: ${process.env.AI_GATEWAY_API_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`   AI_MODEL: ${process.env.AI_MODEL || '❌ Not set'}`);
  
  console.log('\n2️⃣ Testing File Structure...');
  const requiredFiles = [
    'app/mcp/server.ts',
    'app/actions/chat.ts',
    'lib/database.ts'
  ];
  
  requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    const exists = fs.existsSync(filePath);
    console.log(`   ${file}: ${exists ? '✅ Exists' : '❌ Missing'}`);
  });
  
  console.log('\n3️⃣ Testing MCP Server Code Structure...');
  try {
    const serverPath = path.join(__dirname, '..', 'app', 'mcp', 'server.ts');
    const serverContent = fs.readFileSync(serverPath, 'utf-8');
    
    const requiredFunctions = [
      'createOrUpdateSession',
      'getAIChatHistory',
      'enhanceMessageWithPersona',
      'generateFollowUpQuestions',
      'logAIConversationAnalytics',
      'ai_chat_conversation'
    ];
    
    requiredFunctions.forEach(func => {
      const exists = serverContent.includes(func);
      console.log(`   ${func}: ${exists ? '✅ Implemented' : '❌ Missing'}`);
    });
    
    console.log('\n4️⃣ Testing Tool Definition...');
    const hasToolDefinition = serverContent.includes('ai_chat_conversation') && 
                              serverContent.includes('inputSchema') &&
                              serverContent.includes('properties');
    console.log(`   Tool Definition: ${hasToolDefinition ? '✅ Complete' : '❌ Incomplete'}`);
    
  } catch (error) {
    console.log(`   ❌ Error reading server file: ${error.message}`);
  }
  
  console.log('\n5️⃣ Testing Database Schema...');
  try {
    const schemaPath = path.join(__dirname, '..', 'database', 'migration-001-schema-alignment.sql');
    const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
    
    const requiredTables = [
      'ai_chat_sessions',
      'ai_conversation_analytics',
      'conversation_comparisons'
    ];
    
    requiredTables.forEach(table => {
      const exists = schemaContent.includes(table);
      console.log(`   ${table}: ${exists ? '✅ Defined' : '❌ Missing'}`);
    });
    
  } catch (error) {
    console.log(`   ❌ Error reading schema file: ${error.message}`);
  }
  
  console.log('\n📊 Basic Structure Test Complete');
  console.log('   Ready for runtime testing with proper TypeScript compilation');
  
  return true;
}

// Run the test
testBasicMCPStructure().then(() => {
  console.log('\n🎉 Phase 2 Basic Testing Completed!');
}).catch(error => {
  console.error('💥 Test failed:', error);
});