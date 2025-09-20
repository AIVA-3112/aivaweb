// Test sending a simple message directly to see what's failing
async function testSimpleMessage() {
  try {
    console.log('🔍 Testing simple message to Azure SQL backend...\n');
    
    const response = await fetch('http://localhost:3000/api/chat/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // Since auth is bypassed, any token works
      },
      body: JSON.stringify({
        message: 'Hello, this is a test message for Azure SQL database storage'
      })
    });
    
    console.log('📝 Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Message sent successfully!');
      console.log('📄 Response data:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('❌ Error response:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSimpleMessage();