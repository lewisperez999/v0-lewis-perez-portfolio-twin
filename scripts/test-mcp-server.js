/**
 * Test script for MCP server functionality
 */

const MCP_BASE_URL = 'http://localhost:3000/api/mcp/http';

async function testMCPServer() {
  console.log('🔧 Testing MCP Server...\n');

  try {
    // Test 1: Initialize
    console.log('1. Testing initialization...');
    const initResponse = await fetch(MCP_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'initialize',
        params: {},
        id: 1
      })
    });
    
    const initResult = await initResponse.json();
    console.log('   Initialize response:', JSON.stringify(initResult, null, 2));
    
    if (initResult.result && initResult.result.serverInfo) {
      console.log('   ✅ Initialization successful\n');
    } else {
      console.log('   ❌ Initialization failed\n');
      return;
    }

    // Test 2: List tools
    console.log('2. Testing tools/list...');
    const toolsResponse = await fetch(MCP_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/list',
        params: {},
        id: 2
      })
    });
    
    const toolsResult = await toolsResponse.json();
    console.log('   Tools list response:', JSON.stringify(toolsResult, null, 2));
    
    if (toolsResult.result && toolsResult.result.tools) {
      console.log(`   ✅ Found ${toolsResult.result.tools.length} tools\n`);
    } else {
      console.log('   ❌ Tools list failed\n');
      return;
    }

    // Test 3: Test a simple tool call
    console.log('3. Testing tools/call with get_contact_info...');
    const callResponse = await fetch(MCP_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'get_contact_info',
          arguments: {}
        },
        id: 3
      })
    });
    
    const callResult = await callResponse.json();
    console.log('   Tool call response:', JSON.stringify(callResult, null, 2));
    
    if (callResult.result) {
      console.log('   ✅ Tool call successful\n');
    } else {
      console.log('   ❌ Tool call failed\n');
    }

    // Test 4: Test GET endpoint
    console.log('4. Testing GET endpoint...');
    const getResponse = await fetch(MCP_BASE_URL, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    const getResult = await getResponse.json();
    console.log('   GET response:', JSON.stringify(getResult, null, 2));
    
    if (getResult.name) {
      console.log('   ✅ GET endpoint successful\n');
    } else {
      console.log('   ❌ GET endpoint failed\n');
    }

    console.log('🎉 MCP Server test completed!');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error('Make sure the Next.js development server is running on port 3000');
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testMCPServer();
}

module.exports = { testMCPServer };