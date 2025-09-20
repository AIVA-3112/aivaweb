// Simple test to verify API connection to Azure SQL database

async function testAPI() {
  try {
    console.log('🔍 Testing AIVA Backend API connection...\n');
    
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch('http://localhost:3005/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.status);
    
    // Test 2: Try accessing a protected endpoint (should get auth error)
    console.log('\n2. Testing protected chat endpoint...');
    const chatResponse = await fetch('http://localhost:3005/api/chat');
    console.log('📝 Chat endpoint status:', chatResponse.status);
    if (chatResponse.status === 401) {
      console.log('✅ Authentication required (expected)');
    } else {
      const chatData = await chatResponse.text();
      console.log('📄 Response:', chatData);
    }
    
    // Test 3: Test message endpoint without auth
    console.log('\n3. Testing message endpoint...');
    const messageResponse = await fetch('http://localhost:3005/api/chat/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Test message for Azure SQL database'
      })
    });
    console.log('📝 Message endpoint status:', messageResponse.status);
    const messageData = await messageResponse.text();
    console.log('📄 Response:', messageData);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAPI();