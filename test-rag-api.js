/**
 * RAG API Testing Script
 * 
 * Tests the RAG API endpoints
 * Run: node test-rag-api.js
 * 
 * Make sure your dev server is running: npm run dev
 */

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

// Test data
const testData = {
  brand: 'kommi',
  query: 'best brand tracking tools',
  user_email: 'test@example.com',
  user_id: 'test-user-id'
};

async function testAPI(endpoint, data) {
  console.log(`\n🧪 Testing: ${endpoint}`);
  console.log('─'.repeat(50));
  
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Status: Success');
      console.log('📊 Response:', JSON.stringify(result, null, 2));
      return { success: true, result };
    } else {
      console.log(`⚠️ Status: ${response.status}`);
      console.log('📊 Error:', result);
      return { success: false, error: result };
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    console.log('💡 Make sure your dev server is running: npm run dev');
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 RAG API Testing');
  console.log('='.repeat(50));
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`RAG Enabled: ${process.env.ENABLE_RAG_TRACKING === 'true' ? 'Yes ✅' : 'No (disabled by default) ✅'}`);
  
  // Check if fetch is available (Node.js 18+)
  if (typeof fetch === 'undefined') {
    console.error('\n❌ This script requires Node.js 18+ or fetch polyfill');
    console.log('💡 Alternative: Use curl or Postman to test endpoints');
    return;
  }

  // Test 1: Standard checkMention endpoint (should work with or without RAG)
  console.log('\n📝 Test 1: Standard /api/checkMention endpoint');
  const test1 = await testAPI('/api/checkMention', testData);
  
  // Test 2: Realtime endpoint (new RAG endpoint)
  console.log('\n📝 Test 2: Realtime /api/trackBrand/realtime endpoint');
  const test2 = await testAPI('/api/trackBrand/realtime', testData);
  
  // Summary
  console.log('\n📊 Test Summary');
  console.log('='.repeat(50));
  console.log(`Standard endpoint: ${test1.success ? '✅ Working' : '❌ Failed'}`);
  console.log(`Realtime endpoint: ${test2.success ? '✅ Working' : '❌ Failed'}`);
  
  if (test1.success) {
    console.log('\n✅ Your existing endpoint works! RAG enhancement is optional.');
  }
  
  if (test2.success) {
    console.log('\n✅ Realtime endpoint works!');
    if (test2.result?.method === 'rag_realtime') {
      console.log('✨ RAG is being used!');
    } else {
      console.log('ℹ️ Using standard flow (RAG may be disabled or failed)');
    }
  }
  
  console.log('\n💡 Next steps:');
  console.log('   1. Check server logs for RAG messages');
  console.log('   2. If RAG is disabled, set ENABLE_RAG_TRACKING=true');
  console.log('   3. Ensure OPENAI_API_KEY is set');
  console.log('   4. Restart server and test again');
}

// Run tests
runTests().catch(console.error);

