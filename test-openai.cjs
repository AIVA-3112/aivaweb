require('dotenv').config({ path: './server/.env' });
const { OpenAIService } = require('./server/dist/services/openai');

async function testOpenAI() {
  try {
    console.log('Testing OpenAI service...');
    const openAIService = OpenAIService.getInstance();
    
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful assistant.'
      },
      {
        role: 'user',
        content: 'Hello, this is a test message. Please respond with a short greeting.'
      }
    ];
    
    console.log('Sending test message to OpenAI...');
    const response = await openAIService.getChatCompletion(messages, {
      maxTokens: 100,
      temperature: 0.7
    });
    
    console.log('Response from OpenAI:');
    console.log(response.content);
    console.log('Tokens used:', response.tokens);
  } catch (error) {
    console.error('Error testing OpenAI service:', error);
  }
}

testOpenAI();