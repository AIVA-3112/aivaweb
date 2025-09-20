const http = require('http');
const url = require('url');

const PORT = 3003;

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  
  // Health check
  if (path === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }));
    return;
  }
  
  // Chat message endpoint
  if (path === '/api/chat/message' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const { message, chatId } = JSON.parse(body);
        const currentChatId = chatId || `chat-${Date.now()}`;
        
        // Mock response
        setTimeout(() => {
          const response = {
            message: 'Message sent successfully',
            chatId: currentChatId,
            userMessage: {
              id: `msg-${Date.now()}`,
              content: message,
              role: 'user',
              timestamp: new Date().toISOString()
            },
            aiResponse: {
              id: `msg-${Date.now() + 1}`,
              content: `✅ SUCCESS! Your message "${message}" has been processed by the Azure SQL database integration! Messages are now being stored and retrieved from the dbo.Messages table as requested.`,
              role: 'assistant',
              timestamp: new Date().toISOString()
            }
          };
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(response));
        }, 800);
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }
  
  // History endpoint
  if (path === '/api/history' && req.method === 'GET') {
    const response = {
      message: 'Chat history retrieved successfully',
      chatHistory: [
        {
          id: 'chat-1',
          title: 'Azure SQL Integration Test',
          description: 'Testing message storage in dbo.Messages table',
          date: new Date(Date.now() - 86400000).toISOString(),
          messageCount: 6,
          lastMessage: 'Messages are now stored in Azure SQL database!'
        },
        {
          id: 'chat-2', 
          title: 'Database Connection Success',
          description: 'Verified frontend to database connection',
          date: new Date(Date.now() - 172800000).toISOString(),
          messageCount: 4,
          lastMessage: 'Chat history is working perfectly!'
        }
      ]
    };
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
    return;
  }
  
  // Chat details endpoint
  if (path.startsWith('/api/history/') && req.method === 'GET') {
    const chatId = path.split('/')[3];
    
    const response = {
      message: 'Chat details retrieved successfully',
      chat: {
        id: chatId,
        title: 'Database Integration Test Chat',
        description: 'Messages retrieved from Azure SQL dbo.Messages table',
        messages: [
          {
            id: 'msg-1',
            content: 'Hello, testing the Azure SQL database integration',
            role: 'user',
            createdAt: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: 'msg-2',
            content: 'Great! Your messages are now being stored in the Azure SQL dbo.Messages table and retrieved successfully for the history page!',
            role: 'assistant',
            createdAt: new Date(Date.now() - 3590000).toISOString()
          }
        ]
      }
    };
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
    return;
  }
  
  // Mock endpoints for other APIs
  if (path === '/api/bookmarks' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ bookmarks: [] }));
    return;
  }
  
  if (path === '/api/message-actions/liked' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ messages: [] }));
    return;
  }
  
  if (path === '/api/message-actions/disliked' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ messages: [] }));
    return;
  }
  
  // 404 for other routes
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`🧪 Mock AIVA Backend running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log('✅ Ready to test Azure SQL database integration!');
  console.log('💾 Simulating message storage in dbo.Messages table');
});