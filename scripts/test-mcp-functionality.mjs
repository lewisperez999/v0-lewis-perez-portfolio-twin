/**
 * Comprehensive Test Suite for MCP AI-to-AI Chat Tool
 * Phase 2: Testing and Refinement
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
function loadEnv() {
  try {
    const envPath = join(__dirname, '..', '.env.local');
    const envContent = readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match && !match[1].startsWith('#') && match[1].trim()) {
        process.env[match[1].trim()] = match[2].replace(/^"(.*)"$/, '$1');
      }
    });
    console.log('✅ Environment variables loaded');
  } catch (error) {
    console.error('❌ Failed to load environment:', error.message);
  }
}

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

function logTest(name, passed, details = '') {
  if (passed) {
    console.log(`✅ ${name}`);
    testResults.passed++;
  } else {
    console.log(`❌ ${name}: ${details}`);
    testResults.failed++;
    testResults.errors.push({ name, details });
  }
}

async function testMCPServerFunctionality() {
  console.log('\n🧪 PHASE 2: MCP Server Functionality Testing\n');
  
  loadEnv();
  
  try {
    // Import the server after env is loaded
    const { createServer } = await import('../app/mcp/server.ts');
    
    console.log('1️⃣ Testing MCP Server Creation...');
    const server = createServer();
    logTest('MCP Server Creation', !!server, 'Server instance created');
    
    console.log('\n2️⃣ Testing Tool Listing...');
    const toolsResponse = await server.listTools();
    logTest('Tools List Response', !!toolsResponse.tools, 'Tools response received');
    
    const aiChatTool = toolsResponse.tools.find(tool => tool.name === 'ai_chat_conversation');
    logTest('AI Chat Tool Present', !!aiChatTool, 'ai_chat_conversation tool found');
    
    if (aiChatTool) {
      logTest('Tool Has Description', !!aiChatTool.description, aiChatTool.description);
      logTest('Tool Has Input Schema', !!aiChatTool.inputSchema, 'Input schema defined');
      
      const requiredProps = ['message', 'sessionId'];
      const hasRequired = requiredProps.every(prop => 
        aiChatTool.inputSchema.properties && aiChatTool.inputSchema.properties[prop]
      );
      logTest('Required Properties Present', hasRequired, `Missing: ${requiredProps.filter(prop => !aiChatTool.inputSchema.properties?.[prop]).join(', ')}`);
    }
    
    console.log('\n3️⃣ Testing Tool Parameter Validation...');
    
    // Test with missing required parameters
    try {
      await server.callTool({
        name: 'ai_chat_conversation',
        arguments: {}
      });
      logTest('Parameter Validation (Missing Required)', false, 'Should have thrown error for missing parameters');
    } catch (error) {
      logTest('Parameter Validation (Missing Required)', true, 'Correctly rejected missing parameters');
    }
    
    // Test with invalid conversation type
    try {
      await server.callTool({
        name: 'ai_chat_conversation',
        arguments: {
          message: 'Test message',
          sessionId: 'test-session',
          conversationType: 'invalid_type'
        }
      });
      logTest('Parameter Validation (Invalid Type)', false, 'Should have rejected invalid conversation type');
    } catch (error) {
      logTest('Parameter Validation (Invalid Type)', true, 'Correctly rejected invalid conversation type');
    }
    
    console.log('\n4️⃣ Testing Basic Tool Execution...');
    
    const testRequest = {
      name: 'ai_chat_conversation',
      arguments: {
        message: "Tell me about your Java experience",
        sessionId: `test-session-${Date.now()}`,
        conversationType: "interview",
        persona: "technical_assessor",
        maxConversationTurns: 5,
        responseFormat: "brief",
        includeFollowUpQuestions: false,
        includeSourceReferences: false,
        enhanceWithContext: false
      }
    };
    
    const response = await server.callTool(testRequest);
    
    logTest('Tool Execution', !response.isError, response.isError ? response.content : 'Tool executed successfully');
    
    if (!response.isError && response.content && response.content[0]) {
      const responseText = response.content[0].text;
      logTest('Response Has Content', !!responseText && responseText.length > 10, `Response length: ${responseText?.length || 0}`);
      logTest('Response Format', responseText.includes('AI Portfolio Response'), 'Response includes expected format markers');
    }
    
  } catch (error) {
    logTest('MCP Server Test Suite', false, error.message);
    console.error('Stack trace:', error.stack);
  }
  
  // Print test summary
  console.log('\n📊 MCP Server Test Results:');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  
  if (testResults.failed > 0) {
    console.log('\n🔍 Failed Tests:');
    testResults.errors.forEach(error => {
      console.log(`   • ${error.name}: ${error.details}`);
    });
  }
  
  return testResults.failed === 0;
}

// Export for use in other test files
export { testMCPServerFunctionality, testResults };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testMCPServerFunctionality().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('💥 Test suite crashed:', error);
    process.exit(1);
  });
}