// Simple test to create a user manually and verify login
const bcrypt = require('bcryptjs');

async function testLogin() {
  try {
    // Test password hashing
    const password = 'password123';
    const hash = await bcrypt.hash(password, 12);
    console.log('Generated hash:', hash);
    
    // Test validation
    const isValid = await bcrypt.compare(password, hash);
    console.log('Hash validation:', isValid);
    
    // Test some sample hashes from mock data
    const mockHash = '$2a$12$LQv3c1yqBwEJXz1qDIBcdeM3/PwT8I9PkZ9ZrHxrHdQ7OVrmrYw6q';
    const mockValidation = await bcrypt.compare('password123', mockHash);
    console.log('Mock hash validation:', mockValidation);
    
    // Make a direct API call to test login
    const fetch = require('node-fetch');
    
    const loginData = {
      email: 'john.doe@example.com',
      password: 'password123'
    };
    
    console.log('\\n🔍 Testing login API call...');
    console.log('Login data:', loginData);
    
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    });
    
    const result = await response.json();
    console.log('\\n📡 API Response:');
    console.log('Status:', response.status);
    console.log('Response:', result);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testLogin();