const fetch = require('node-fetch');

async function testMessageFlow() {
  try {
    console.log('Testing message flow...');
    
    // Send a message to the backend
    const response = await fetch('http://localhost:3000/api/chat/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // This will be bypassed in development mode
      },
      body: JSON.stringify({
        message: 'Hello, this is a test message',
        useDataAgent: false
      })
    });
    
    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ Message flow test PASSED');
      console.log('User message ID:', data.userMessage?.id);
      console.log('AI response ID:', data.aiResponse?.id);
      console.log('AI response content:', data.aiResponse?.content);
    } else {
      console.log('❌ Message flow test FAILED');
      console.log('Error:', data.error);
      console.log('Message:', data.message);
    }
  } catch (error) {
    console.error('Error during test:', error);
  }
}

testMessageFlow();