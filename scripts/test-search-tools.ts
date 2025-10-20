#!/usr/bin/env ts-node
/**
 * Test script to verify search_professional_content tool works correctly
 */

import { toolHandlers } from '../lib/realtime-tools';
import { searchProfessionalContent } from '../app/actions/chat';

async function testSearchTools() {
  console.log('🧪 Testing search_professional_content tool...\n');
  
  // Test 1: Direct function call
  console.log('📍 Test 1: Direct searchProfessionalContent function');
  try {
    const directResult = await searchProfessionalContent('projects');
    console.log('✅ Direct function result:');
    console.log(JSON.stringify(directResult, null, 2));
    console.log('\n');
  } catch (error) {
    console.error('❌ Direct function error:', error);
    console.log('\n');
  }
  
  // Test 2: Tool handler call
  console.log('📍 Test 2: Tool handler (as used by OpenAI Realtime)');
  try {
    const toolResult = await toolHandlers.search_professional_content({ query: 'projects' });
    console.log('✅ Tool handler result:');
    console.log(JSON.stringify(toolResult, null, 2));
    console.log('\n');
  } catch (error) {
    console.error('❌ Tool handler error:', error);
    console.log('\n');
  }
  
  // Test 3: Different queries
  const queries = ['React experience', 'e-commerce', 'ING work', 'technical skills'];
  
  for (const query of queries) {
    console.log(`📍 Testing query: "${query}"`);
    try {
      const result = await toolHandlers.search_professional_content({ query });
      console.log(`✅ Results for "${query}": ${result.totalResults} items found`);
      if (result.success && result.results && result.results.length > 0) {
        console.log(`   First result: ${result.results[0].content.substring(0, 100)}...`);
      }
    } catch (error) {
      console.error(`❌ Error for "${query}":`, error);
    }
    console.log('');
  }
  
  console.log('🎉 Test complete!');
}

testSearchTools().catch(console.error);
