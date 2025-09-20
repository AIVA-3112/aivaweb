// Script to insert mock data using HTTP requests to the running server
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

// Configuration
const BASE_URL = 'http://localhost:3000/api';
const USER_EMAIL = 'sudhenreddym@gmail.com';
const USER_PASSWORD = 'password123';

async function insertMockDataViaHTTP() {
  try {
    console.log('Starting mock data insertion via HTTP...');
    
    // 1. Register the user (if not exists)
    try {
      console.log('Attempting to register user...');
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
        firstName: 'Sudhen',
        lastName: 'Reddy',
        email: USER_EMAIL,
        password: USER_PASSWORD
      });
      console.log('✅ User registered successfully');
      console.log('User ID:', registerResponse.data.user.id);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error === 'User already exists') {
        console.log('ℹ️ User already exists, proceeding with login');
      } else {
        console.log('ℹ️ User may already exist, proceeding with login');
      }
    }
    
    // 2. Login to get auth token
    console.log('Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: USER_EMAIL,
      password: USER_PASSWORD
    });
    
    const authToken = loginResponse.data.token;
    console.log('✅ Login successful');
    console.log('Auth token:', authToken);
    
    // 3. Create a chat
    console.log('Creating chat...');
    const chatResponse = await axios.post(`${BASE_URL}/chat`, {
      title: 'Test Chat',
      description: 'Test chat for mock data'
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    const chatId = chatResponse.data.chat.id;
    console.log('✅ Chat created successfully');
    console.log('Chat ID:', chatId);
    
    // 4. Send a message
    console.log('Sending user message...');
    const messageResponse = await axios.post(`${BASE_URL}/chat/message`, {
      message: 'Hello, this is a test message from Sudhen!',
      chatId: chatId
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    const userMessageId = messageResponse.data.userMessage.id;
    const aiMessageId = messageResponse.data.aiResponse.id;
    console.log('✅ User message sent successfully');
    console.log('User message ID:', userMessageId);
    console.log('AI response ID:', aiMessageId);
    
    // 5. Add message actions (like, bookmark)
    console.log('Adding like action...');
    await axios.post(`${BASE_URL}/message-actions/${aiMessageId}/like`, {}, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    console.log('✅ Like action added successfully');
    
    console.log('Adding bookmark action...');
    await axios.post(`${BASE_URL}/message-actions/${aiMessageId}/bookmark`, {}, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    console.log('✅ Bookmark action added successfully');
    
    // 6. Get chat history to verify
    console.log('Retrieving chat history...');
    const historyResponse = await axios.get(`${BASE_URL}/history`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('✅ Chat history retrieved successfully');
    console.log('Number of chats:', historyResponse.data.chatHistory.length);
    
    // 7. Get bookmarks to verify
    console.log('Retrieving bookmarks...');
    const bookmarksResponse = await axios.get(`${BASE_URL}/bookmarks`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('✅ Bookmarks retrieved successfully');
    console.log('Number of bookmarks:', bookmarksResponse.data.bookmarks.length);
    
    console.log('\n🎉 All mock data inserted and verified successfully!');
    console.log('User email:', USER_EMAIL);
    console.log('User password:', USER_PASSWORD);
    console.log('You should now be able to log in and see the mock data in the frontend.');
    
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    return false;
  }
}

// First, let's check if axios is installed
try {
  require('axios');
  insertMockDataViaHTTP();
} catch (e) {
  console.log('axios is not installed. Installing...');
  const { execSync } = require('child_process');
  execSync('npm install axios', { cwd: __dirname, stdio: 'inherit' });
  console.log('axios installed successfully. Running script...');
  insertMockDataViaHTTP();
}