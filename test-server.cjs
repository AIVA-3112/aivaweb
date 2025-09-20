const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

// Mock auth middleware
const mockAuth = (req, res, next) => {
  req.user = { userId: 'test-user-123', email: 'test@example.com', name: 'Test User' };
  next();
};

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Mock chat message endpoint
app.post('/api/chat/message', mockAuth, (req, res) => {
  const { message, chatId } = req.body;
  const currentChatId = chatId || `chat-${Date.now()}`;
  
  // Mock response
  setTimeout(() => {
    res.json({
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
        content: `I received your message: "${message}". This response is coming from the Azure SQL database integration! Messages are now being stored and retrieved properly.`,
        role: 'assistant',
        timestamp: new Date().toISOString()
      }
    });
  }, 1000);
});

// Mock history endpoint
app.get('/api/history', mockAuth, (req, res) => {
  res.json({
    message: 'Chat history retrieved successfully',
    chatHistory: [
      {
        id: 'chat-1',
        title: 'Previous Chat 1',
        description: 'A conversation about Azure SQL integration',
        date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        messageCount: 8,
        lastMessage: 'Thank you for the help with the database setup!'
      },
      {
        id: 'chat-2',
        title: 'Previous Chat 2',
        description: 'Discussion about frontend improvements',
        date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        messageCount: 12,
        lastMessage: 'The new features look great!'
      }
    ]
  });
});

// Mock chat details endpoint
app.get('/api/history/:chatId', mockAuth, (req, res) => {
  const { chatId } = req.params;
  
  res.json({
    message: 'Chat details retrieved successfully',
    chat: {
      id: chatId,
      title: 'Mock Chat Details',
      description: 'Sample chat from database',
      messages: [
        {
          id: 'msg-1',
          content: 'Hello, this is a test message',
          role: 'user',
          createdAt: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 'msg-2',
          content: 'Hello! This is a response from the Azure SQL database. Your messages are now being stored and retrieved successfully!',
          role: 'assistant',
          createdAt: new Date(Date.now() - 3590000).toISOString()
        }
      ]
    }
  });
});

// Mock bookmarks endpoint
app.get('/api/bookmarks', mockAuth, (req, res) => {
  res.json({
    bookmarks: [
      {
        id: 'bookmark-1',
        title: 'Important Database Query',
        description: 'How to connect frontend to Azure SQL',
        date: new Date().toISOString(),
        type: 'Conversation',
        category: 'Conversation'
      }
    ]
  });
});

// Mock message actions endpoints
app.get('/api/message-actions/liked', mockAuth, (req, res) => {
  res.json({ messages: [] });
});

app.get('/api/message-actions/disliked', mockAuth, (req, res) => {
  res.json({ messages: [] });
});

app.post('/api/message-actions/:messageId/:actionType', mockAuth, (req, res) => {
  res.json({ success: true, action: req.params.actionType });
});

app.delete('/api/message-actions/:messageId/:actionType', mockAuth, (req, res) => {
  res.json({ success: true, action: req.params.actionType });
});

// Start server
app.listen(PORT, () => {
  console.log(`🧪 Mock AIVA Backend running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log('✅ Ready to test Azure SQL database integration!');
});