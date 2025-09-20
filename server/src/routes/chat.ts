import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken } from '../middleware/auth';
import { AIDataService } from '../services/aiDataService';
import { validate, schemas } from '../middleware/validation';
import { chatLimiter, aiLimiter } from '../middleware/rateLimiter';
import { DatabaseManager } from '../config/database';
import { OpenAIService } from '../services/openai';
import { CacheService } from '../services/cache';
import { logger } from '../utils/logger';
import sql from 'mssql';

const router = express.Router();
const dbManager = DatabaseManager.getInstance();

// Apply authentication to all chat routes
router.use(authenticateToken);

// Get services
const openAIService = OpenAIService.getInstance();
const cacheService = CacheService.getInstance();
let aiDataService: AIDataService | null = null;

// Get user's chats
router.get('/', validate(schemas.pagination), async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 20, sortBy = 'updatedAt', sortOrder = 'desc' } = req.query;
    
    const pool = await dbManager.getPool();
    const offset = (Number(page) - 1) * Number(limit);
    
    const result = await pool.request()
      .input('userId', sql.NVarChar, userId)
      .input('limit', sql.Int, Number(limit))
      .input('offset', sql.Int, offset)
      .query(`
        SELECT 
          c.*,
          w.name as workspaceName,
          w.color as workspaceColor,
          (SELECT COUNT(*) FROM Messages WHERE chatId = c.id) as messageCount
        FROM Chats c
        LEFT JOIN Workspaces w ON c.workspaceId = w.id
        WHERE c.userId = @userId AND c.isArchived = 0
        ORDER BY c.${sortBy} ${sortOrder}
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY
      `);
    
    const countResult = await pool.request()
      .input('userId', sql.NVarChar, userId)
      .query('SELECT COUNT(*) as total FROM Chats WHERE userId = @userId AND isArchived = 0');
    
    const total = countResult.recordset[0].total;

    res.json({
      message: 'Chats retrieved successfully',
      chats: result.recordset,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    logger.error('Get chats error:', error);
    res.status(500).json({
      error: 'Failed to retrieve chats'
    });
  }
});

// Create new chat
router.post('/', validate(schemas.createChat), async (req, res) => {
  try {
    const { title, description, workspaceId } = req.body;
    const userId = req.user.userId;
    const chatId = uuidv4();

    const pool = await dbManager.getPool();
    
    // In development mode with bypass auth, we might need to create the user
    if (process.env.NODE_ENV === 'development' && process.env.BYPASS_AUTH === 'true') {
      // Check if user exists
      const userCheck = await pool.request()
        .input('userId', sql.NVarChar, userId)
        .query('SELECT id FROM Users WHERE id = @userId');
      
      if (userCheck.recordset.length === 0) {
        // Check if a user with the same email already exists
        const emailCheck = await pool.request()
          .input('email', sql.NVarChar, `${userId}@example.com`)
          .query('SELECT id FROM Users WHERE email = @email');
        
        if (emailCheck.recordset.length === 0) {
          // Create the mock user only if no user with this email exists
          await pool.request()
            .input('id', sql.NVarChar, userId)
            .input('firstName', sql.NVarChar, 'Test')
            .input('lastName', sql.NVarChar, 'User')
            .input('email', sql.NVarChar, `${userId}@example.com`)
            .input('role', sql.NVarChar, req.user.role || 'user')
            .query(`
              INSERT INTO Users (id, firstName, lastName, email, role, isActive, createdAt, updatedAt)
              VALUES (@id, @firstName, @lastName, @email, @role, 1, GETUTCDATE(), GETUTCDATE())
            `);
        } else {
          // If user with email exists, update the user ID
          await pool.request()
            .input('id', sql.NVarChar, userId)
            .input('email', sql.NVarChar, `${userId}@example.com`)
            .query(`
              UPDATE Users SET id = @id WHERE email = @email
            `);
        }
      }
    }
    
    let finalWorkspaceId = workspaceId;
    
    // If no workspaceId provided, create a default workspace
    if (!finalWorkspaceId) {
      // Check if user has any workspaces
      const workspaceCheck = await pool.request()
        .input('userId', sql.NVarChar, userId)
        .query('SELECT TOP 1 id FROM Workspaces WHERE ownerId = @userId');
      
      if (workspaceCheck.recordset.length > 0) {
        // Use existing workspace
        finalWorkspaceId = workspaceCheck.recordset[0].id;
      } else {
        // Create a default workspace for the user
        const defaultWorkspaceId = uuidv4();
        const workspaceResult = await pool.request()
          .input('id', sql.NVarChar, defaultWorkspaceId)
          .input('name', sql.NVarChar, 'Default Workspace')
          .input('description', sql.NVarChar, 'Auto-created default workspace')
          .input('color', sql.NVarChar, '#3B82F6')
          .input('ownerId', sql.NVarChar, userId)
          .query(`
            INSERT INTO Workspaces (id, name, description, color, ownerId, createdAt, updatedAt)
            OUTPUT INSERTED.id
            VALUES (@id, @name, @description, @color, @ownerId, GETUTCDATE(), GETUTCDATE())
          `);
        
        finalWorkspaceId = workspaceResult.recordset[0].id;
        logger.info(`Created default workspace ${finalWorkspaceId} for user ${userId}`);
      }
    } else {
      // Verify workspace belongs to user if provided
      const workspaceCheck = await pool.request()
        .input('workspaceId', sql.NVarChar, finalWorkspaceId)
        .input('userId', sql.NVarChar, userId)
        .query('SELECT id FROM Workspaces WHERE id = @workspaceId AND ownerId = @userId');
      
      if (workspaceCheck.recordset.length === 0) {
        // Check if workspace exists but doesn't belong to user
        const workspaceExists = await pool.request()
          .input('workspaceId', sql.NVarChar, finalWorkspaceId)
          .query('SELECT id, ownerId FROM Workspaces WHERE id = @workspaceId');
        
        if (workspaceExists.recordset.length > 0) {
          // Workspace exists but doesn't belong to user
          return res.status(403).json({
            error: 'Access denied',
            message: 'You do not have access to this workspace.'
          });
        } else {
          // Workspace doesn't exist, create a default one
          const defaultWorkspaceId = uuidv4();
          const workspaceResult = await pool.request()
            .input('id', sql.NVarChar, defaultWorkspaceId)
            .input('name', sql.NVarChar, 'Default Workspace')
            .input('description', sql.NVarChar, 'Auto-created default workspace')
            .input('color', sql.NVarChar, '#3B82F6')
            .input('ownerId', sql.NVarChar, userId)
            .query(`
              INSERT INTO Workspaces (id, name, description, color, ownerId, createdAt, updatedAt)
              OUTPUT INSERTED.id
              VALUES (@id, @name, @description, @color, @ownerId, GETUTCDATE(), GETUTCDATE())
            `);
          
          finalWorkspaceId = workspaceResult.recordset[0].id;
          logger.info(`Created default workspace ${finalWorkspaceId} for user ${userId} as fallback`);
        }
      }
    }
    
    // Ensure user exists before creating chat
    const userCheck = await pool.request()
      .input('userId', sql.NVarChar, userId)
      .query('SELECT id FROM Users WHERE id = @userId');
    
    if (userCheck.recordset.length === 0 && process.env.NODE_ENV === 'development' && process.env.BYPASS_AUTH === 'true') {
      // Check if a user with the same email already exists
      const emailCheck = await pool.request()
        .input('email', sql.NVarChar, `${userId}@example.com`)
        .query('SELECT id FROM Users WHERE email = @email');
      
      if (emailCheck.recordset.length === 0) {
        // Create user if not exists in development mode with bypass auth
        await pool.request()
          .input('id', sql.NVarChar, userId)
          .input('firstName', sql.NVarChar, 'Test')
          .input('lastName', sql.NVarChar, 'User')
          .input('email', sql.NVarChar, `${userId}@example.com`)
          .input('role', sql.NVarChar, req.user.role || 'user')
          .query(`
            INSERT INTO Users (id, firstName, lastName, email, role, isActive, createdAt, updatedAt)
            VALUES (@id, @firstName, @lastName, @email, @role, 1, GETUTCDATE(), GETUTCDATE())
          `);
      } else {
        // If user with email exists, update the user ID
        await pool.request()
          .input('id', sql.NVarChar, userId)
          .input('email', sql.NVarChar, `${userId}@example.com`)
          .query(`
            UPDATE Users SET id = @id WHERE email = @email
          `);
      }
    }
    
    const result = await pool.request()
      .input('id', sql.NVarChar, chatId)
      .input('title', sql.NVarChar, title)
      .input('description', sql.NVarChar, description || '')
      .input('userId', sql.NVarChar, userId)
      .input('workspaceId', sql.NVarChar, finalWorkspaceId)
      .query(`
        INSERT INTO Chats (id, title, description, userId, workspaceId, createdAt, updatedAt)
        OUTPUT INSERTED.*
        VALUES (@id, @title, @description, @userId, @workspaceId, GETUTCDATE(), GETUTCDATE())
      `);
    
    const chat = result.recordset[0];

    res.status(201).json({
      message: 'Chat created successfully',
      chat
    });

    logger.info(`Chat created: ${chatId} for user: ${userId} in workspace: ${finalWorkspaceId}`);
  } catch (error) {
    logger.error('Create chat error:', error);
    res.status(500).json({
      error: 'Failed to create chat',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Send message and get AI response
router.post('/message', validate(schemas.sendMessage), async (req, res) => {
  try {
    // Log the entire request body for debugging
    logger.info('Received message request body:', JSON.stringify(req.body, null, 2));
    logger.info('Request headers:', JSON.stringify(req.headers, null, 2));
    
    const { message, chatId, parentMessageId, useDataAgent, datasetId, workspaceId, files } = req.body;
    const userId = req.user.userId;

    // Validate message content or files
    if ((!message || message.trim().length === 0) && (!files || files.length === 0)) {
      return res.status(400).json({
        error: 'Message content or files are required',
        message: 'Please provide a message or attach files to send'
      });
    }

    // Validate files array structure if present
    if (files && files.length > 0) {
      logger.info(`Processing ${files.length} files`);
      for (const [index, file] of files.entries()) {
        logger.info(`File ${index}:`, JSON.stringify(file, null, 2));
        
        // Check required properties
        if (!file.originalName) {
          logger.error(`File at index ${index} missing originalName:`, JSON.stringify(file));
          return res.status(400).json({
            error: 'Invalid file format',
            message: `File at index ${index} missing originalName property`
          });
        }
        
        if (!file.url) {
          logger.error(`File at index ${index} missing url:`, JSON.stringify(file));
          return res.status(400).json({
            error: 'Invalid file format',
            message: `File at index ${index} missing url property`
          });
        }
        
        // Check if fileName property exists
        if (!file.fileName) {
          logger.warn(`File at index ${index} missing fileName property, will try to extract from URL`);
        }
      }
    }

    // Set a default title for file-only messages
    let defaultTitle = 'New Chat';
    if (!message || message.trim().length === 0) {
      if (files && files.length > 0) {
        defaultTitle = `File: ${files[0].originalName}`;
        if (files.length > 1) {
          defaultTitle += ` and ${files.length - 1} more`;
        }
      }
    }

    const pool = await dbManager.getPool();
    
    // Ensure user exists in database before proceeding
    const userCheck = await pool.request()
      .input('userId', sql.NVarChar, userId)
      .query('SELECT id FROM Users WHERE id = @userId');
    
    if (userCheck.recordset.length === 0) {
      // Create user if not exists (especially important in development mode with bypass auth)
      if (process.env.NODE_ENV === 'development' && process.env.BYPASS_AUTH === 'true') {
        // First check if a user with the same email already exists
        const emailCheck = await pool.request()
          .input('email', sql.NVarChar, `${userId}@example.com`)
          .query('SELECT id FROM Users WHERE email = @email');
        
        if (emailCheck.recordset.length === 0) {
          // Create the user only if no user with this email exists
          await pool.request()
            .input('id', sql.NVarChar, userId)
            .input('firstName', sql.NVarChar, 'Test')
            .input('lastName', sql.NVarChar, 'User')
            .input('email', sql.NVarChar, `${userId}@example.com`)
            .input('role', sql.NVarChar, req.user.role || 'user')
            .query(`
              INSERT INTO Users (id, firstName, lastName, email, role, isActive, createdAt, updatedAt)
              VALUES (@id, @firstName, @lastName, @email, @role, 1, GETUTCDATE(), GETUTCDATE())
            `);
        } else {
          // If user with email exists, update the user ID to match our expected ID
          await pool.request()
            .input('id', sql.NVarChar, userId)
            .input('email', sql.NVarChar, `${userId}@example.com`)
            .query(`
              UPDATE Users SET id = @id WHERE email = @email
            `);
        }
      } else {
        // In production, this should not happen as user should be authenticated
        return res.status(404).json({
          error: 'User not found',
          message: 'User account not found. Please log in again.'
        });
      }
    }
    
    // Get or create workspace - handle invalid workspaceId gracefully
    let actualWorkspaceId = workspaceId;
    
    // Validate workspaceId format if provided
    if (actualWorkspaceId) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(actualWorkspaceId)) {
        logger.warn(`Invalid workspaceId format: ${actualWorkspaceId}, ignoring it`);
        actualWorkspaceId = null;
      }
    }
    
    // Only proceed if workspaceId is valid or create a default one
    if (!actualWorkspaceId) {
      // Check if user has any workspaces
      const workspaceCheck = await pool.request()
        .input('userId', sql.NVarChar, userId)
        .query('SELECT TOP 1 id FROM Workspaces WHERE ownerId = @userId');
      
      if (workspaceCheck.recordset.length > 0) {
        // Use existing workspace
        actualWorkspaceId = workspaceCheck.recordset[0].id;
      } else {
        // Create a default workspace for the user
        const defaultWorkspaceId = uuidv4();
        const workspaceResult = await pool.request()
          .input('id', sql.NVarChar, defaultWorkspaceId)
          .input('name', sql.NVarChar, 'Default Workspace')
          .input('description', sql.NVarChar, 'Auto-created default workspace')
          .input('color', sql.NVarChar, '#3B82F6')
          .input('ownerId', sql.NVarChar, userId)
          .query(`
            INSERT INTO Workspaces (id, name, description, color, ownerId, createdAt, updatedAt)
            OUTPUT INSERTED.id
            VALUES (@id, @name, @description, @color, @ownerId, GETUTCDATE(), GETUTCDATE())
          `);
        
        actualWorkspaceId = workspaceResult.recordset[0].id;
        logger.info(`Created default workspace ${actualWorkspaceId} for user ${userId}`);
      }
    } else {
      // Verify workspace exists and belongs to user
      const workspaceCheck = await pool.request()
        .input('workspaceId', sql.NVarChar, actualWorkspaceId)
        .input('userId', sql.NVarChar, userId)
        .query('SELECT id FROM Workspaces WHERE id = @workspaceId AND ownerId = @userId');
      
      if (workspaceCheck.recordset.length === 0) {
        logger.warn(`Workspace ${actualWorkspaceId} does not exist or doesn't belong to user ${userId}`);
        // Create a default workspace instead
        const defaultWorkspaceId = uuidv4();
        const workspaceResult = await pool.request()
          .input('id', sql.NVarChar, defaultWorkspaceId)
          .input('name', sql.NVarChar, 'Default Workspace')
          .input('description', sql.NVarChar, 'Auto-created default workspace')
          .input('color', sql.NVarChar, '#3B82F6')
          .input('ownerId', sql.NVarChar, userId)
          .query(`
            INSERT INTO Workspaces (id, name, description, color, ownerId, createdAt, updatedAt)
            OUTPUT INSERTED.id
            VALUES (@id, @name, @description, @color, @ownerId, GETUTCDATE(), GETUTCDATE())
          `);
        
        actualWorkspaceId = workspaceResult.recordset[0].id;
        logger.info(`Created default workspace ${actualWorkspaceId} for user ${userId} as fallback`);
      }
    }

    // Get or create chat
    let actualChatId = chatId;
    let chatTitle = 'New Chat';
    if (!actualChatId) {
      // Create new chat
      actualChatId = uuidv4();
      chatTitle = message ? message.substring(0, 100) : defaultTitle; // Use first 100 chars of message as title or default for files
      
      await pool.request()
        .input('id', sql.NVarChar, actualChatId)
        .input('userId', sql.NVarChar, userId)
        .input('workspaceId', sql.NVarChar, actualWorkspaceId)
        .input('title', sql.NVarChar, chatTitle)
        .input('description', sql.NVarChar, 'Auto-generated chat')
        .query(`
          INSERT INTO Chats (id, userId, workspaceId, title, description, messageCount, createdAt, updatedAt)
          VALUES (@id, @userId, @workspaceId, @title, @description, 0, GETUTCDATE(), GETUTCDATE())
        `);
    } else {
      // Get existing chat title
      const chatResult = await pool.request()
        .input('id', sql.NVarChar, actualChatId)
        .input('userId', sql.NVarChar, userId)
        .query('SELECT title FROM Chats WHERE id = @id AND userId = @userId');
      
      if (chatResult.recordset.length > 0) {
        chatTitle = chatResult.recordset[0].title;
      }
    }

    // Prepare user message content
    let userMessageContent = message ? message.trim() : '';
    
    // Validate files array if present
    if (files && !Array.isArray(files)) {
      logger.error('Files property is not an array:', files);
      return res.status(400).json({
        error: 'Invalid files format',
        message: 'Files must be an array of file objects'
      });
    }
    
    // Add file information to the message content if files were sent
    if (files && files.length > 0) {
      try {
        // Import FileAnalysisService to read file content
        const { FileAnalysisService } = require('../services/fileAnalysisService');
        const fileAnalysisService = FileAnalysisService.getInstance();
        
        // Extract file contents for AI analysis
        const fileContents = [];
        for (const file of files) {
          try {
            // Validate that file is an object
            if (!file || typeof file !== 'object') {
              logger.error('Invalid file object in files array:', file);
              throw new Error('Invalid file object');
            }
            
            // Validate required file properties
            if (!file.originalName) {
              logger.error(`File missing originalName property: ${JSON.stringify(file)}`);
              throw new Error('File originalName is missing');
            }
            
            // Log the file object to see what properties it has
            logger.info(`Processing file: ${JSON.stringify(file)}`);
            
            // Extract the blob name - check for various possible property names
            let blobName = file.fileName || file.name || file.blobName;
            
            // If we still don't have a blobName, try to extract it from the URL
            if (!blobName && file.url) {
              try {
                const url = new URL(file.url);
                // Extract the blob name from the URL path
                const pathParts = url.pathname.split('/');
                blobName = pathParts[pathParts.length - 1];
                logger.info(`Extracted blobName from URL: ${blobName}`);
              } catch (urlError) {
                logger.warn('Failed to parse file URL:', urlError);
              }
            }
            
            // Check if blobName is valid
            if (!blobName) {
              logger.warn(`Could not determine blobName for file, using originalName as fallback: ${file.originalName}`);
              // Use the originalName as fallback
              const content = await fileAnalysisService.extractFileContent(file.originalName, file.originalName);
              fileContents.push({
                name: file.originalName,
                content: content.content
              });
              continue;
            }
            
            // Get file content
            const content = await fileAnalysisService.extractFileContent(blobName, file.originalName);
            
            fileContents.push({
              name: file.originalName,
              content: content.content
            });
          } catch (error) {
            logger.warn(`Failed to read content for file ${file.originalName || 'unknown'}:`, error);
            fileContents.push({
              name: file.originalName || 'Unknown File',
              content: `[Content not available: ${error instanceof Error ? error.message : 'Unknown error'}]`
            });
          }
        }
        
        // Format file contents for the AI
        const fileContentSection = fileContents.map(f => 
          `File: ${f.name}
Content:
${f.content}
---
`
        ).join('\n');
        
        if (userMessageContent) {
          userMessageContent += `\n\nAttached Files:\n${fileContentSection}`;
        } else {
          userMessageContent = `Analyze the following files:\n\n${fileContentSection}`;
        }
      } catch (fileProcessingError) {
        logger.error('Error processing files:', fileProcessingError);
        // Continue with the message even if file processing fails
        if (!userMessageContent) {
          userMessageContent = 'User sent files but there was an error processing them.';
        }
      }
    }
    
    // If no message content and no files, return an error
    if (!userMessageContent) {
      return res.status(400).json({
        error: 'Message content or files are required',
        message: 'Please provide a message or attach files to send'
      });
    }

    // Store user message in database
    const userMessageId = uuidv4();
    
    await pool.request()
      .input('id', sql.NVarChar, userMessageId)
      .input('chatId', sql.NVarChar, actualChatId)
      .input('userId', sql.NVarChar, userId)
      .input('content', sql.NVarChar, userMessageContent)
      .input('role', sql.NVarChar, 'user')
      .query(`
        INSERT INTO Messages (id, chatId, userId, content, role, createdAt)
        VALUES (@id, @chatId, @userId, @content, @role, GETUTCDATE())
      `);

    // Get chat history for context
    const historyResult = await pool.request()
      .input('chatId', sql.NVarChar, actualChatId)
      .query('SELECT content, role FROM Messages WHERE chatId = @chatId ORDER BY createdAt ASC');

    // Prepare messages for OpenAI
    const chatHistory = historyResult.recordset.map((msg: any) => ({
      role: msg.role,
      content: msg.content
    }));

    // Get AI response using OpenAI service
    let aiResponseContent = '';
    let openAIError = null;
    
    try {
      // Import OpenAI service
      const { OpenAIService } = require('../services/openai');
      const openAIService = OpenAIService.getInstance();
      
      // Prepare messages with system prompt
      const messages = [
        {
          role: 'system',
          content: openAIService.getSystemPrompt()
        },
        ...chatHistory,
        {
          role: 'user',
          content: userMessageContent
        }
      ];

      // Get AI response
      const aiResponse = await openAIService.getChatCompletion(messages, {
        maxTokens: 1000,
        temperature: 0.7
      });
      
      aiResponseContent = aiResponse.content;
    } catch (error) {
      logger.error('OpenAI API error:', error);
      openAIError = error;
      // We'll handle this error after storing the user message
    }

    // If OpenAI failed, return an appropriate error response
    if (openAIError) {
      // Store a placeholder AI response in database
      const aiMessageId = uuidv4();
      const errorMessage = 'Sorry, I encountered an issue processing your request. Please try again.';
      
      await pool.request()
        .input('id', sql.NVarChar, aiMessageId)
        .input('chatId', sql.NVarChar, actualChatId)
        .input('userId', sql.NVarChar, userId)
        .input('content', sql.NVarChar, errorMessage)
        .input('role', sql.NVarChar, 'assistant')
        .query(`
          INSERT INTO Messages (id, chatId, userId, content, role, createdAt)
          VALUES (@id, @chatId, @userId, @content, @role, GETUTCDATE())
        `);

      // Update chat message count
      await pool.request()
        .input('chatId', sql.NVarChar, actualChatId)
        .query('UPDATE Chats SET messageCount = messageCount + 2, lastMessageAt = GETUTCDATE(), updatedAt = GETUTCDATE() WHERE id = @chatId');

      // Return error response
      return res.status(500).json({
        error: 'Failed to get AI response',
        message: 'Sorry, there was an error processing your message. Please try again.',
        details: openAIError instanceof Error ? openAIError.message : 'Unknown error'
      });
    }

    // Store AI response in database
    const aiMessageId = uuidv4();
    
    await pool.request()
      .input('id', sql.NVarChar, aiMessageId)
      .input('chatId', sql.NVarChar, actualChatId)
      .input('userId', sql.NVarChar, userId)
      .input('content', sql.NVarChar, aiResponseContent)
      .input('role', sql.NVarChar, 'assistant')
      .query(`
        INSERT INTO Messages (id, chatId, userId, content, role, createdAt)
        VALUES (@id, @chatId, @userId, @content, @role, GETUTCDATE())
      `);

    // Update chat message count
    await pool.request()
      .input('chatId', sql.NVarChar, actualChatId)
      .query('UPDATE Chats SET messageCount = messageCount + 2, lastMessageAt = GETUTCDATE(), updatedAt = GETUTCDATE() WHERE id = @chatId');

    // Return both messages with AI response
    res.status(200).json({
      message: 'Message processed successfully',
      chatId: actualChatId,
      userMessage: {
        id: userMessageId,
        content: userMessageContent,
        role: 'user',
        timestamp: new Date().toISOString()
      },
      aiResponse: {
        id: aiMessageId,
        content: aiResponseContent,
        role: 'assistant',
        timestamp: new Date().toISOString()
      }
    });

    logger.info(`Message processed for user ${userId} in chat ${actualChatId}`);
  } catch (error) {
    logger.error('Send message error:', error);
    
    // Return a proper error response instead of a fake success
    res.status(500).json({
      error: 'Failed to process message',
      message: 'Sorry, there was an error processing your message. Please try again.',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Helper function to check if message contains data-related keywords
function containsDataKeywords(message: string): boolean {
  const dataKeywords = [
    'show me', 'what is', 'how many', 'total', 'sum', 'average', 'count',
    'sales', 'revenue', 'profit', 'customers', 'orders', 'products',
    'last month', 'this year', 'trend', 'performance', 'report',
    'data', 'analytics', 'metrics', 'kpi', 'dashboard'
  ];
  
  const lowerMessage = message.toLowerCase();
  return dataKeywords.some(keyword => lowerMessage.includes(keyword));
}

// Helper function to get regular AI response
async function getRegularAIResponse(chatHistory: any[], openAIService: any) {
  const messages = [
    {
      role: 'system',
      content: openAIService.getSystemPrompt()
    },
    ...chatHistory.slice(-10).map((msg: any) => ({
      role: msg.role,
      content: msg.content
    }))
  ];

  return await openAIService.getChatCompletion(messages, {
    maxTokens: 1000,
    temperature: 0.7
  });
}

// Get messages for a specific chat
router.get('/:chatId/messages', validate(schemas.chatIdParam), validate(schemas.pagination), async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user.userId;
    
    const pool = await dbManager.getPool();
    const offset = (Number(page) - 1) * Number(limit);

    // Verify chat belongs to user (basic security check)
    const chatCheck = await pool.request()
      .input('chatId', sql.NVarChar, chatId)
      .input('userId', sql.NVarChar, userId)
      .query('SELECT id FROM Chats WHERE id = @chatId AND userId = @userId');

    if (chatCheck.recordset.length === 0) {
      return res.status(404).json({
        error: 'Chat not found',
        message: 'Chat not found or access denied'
      });
    }

    const result = await pool.request()
      .input('chatId', sql.NVarChar, chatId)
      .input('limit', sql.Int, Number(limit))
      .input('offset', sql.Int, offset)
      .query(`
        SELECT 
          m.*,
          (SELECT COUNT(*) FROM MessageActions WHERE messageId = m.id AND actionType = 'like') as likeCount,
          (SELECT COUNT(*) FROM MessageActions WHERE messageId = m.id AND actionType = 'bookmark') as bookmarkCount
        FROM Messages m
        WHERE m.chatId = @chatId
        ORDER BY m.createdAt ASC
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY
      `);
    
    const countResult = await pool.request()
      .input('chatId', sql.NVarChar, chatId)
      .query('SELECT COUNT(*) as total FROM Messages WHERE chatId = @chatId');
    
    const total = countResult.recordset[0].total;

    res.json({
      message: 'Messages retrieved successfully',
      messages: result.recordset,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    logger.error('Get messages error:', error);
    res.status(500).json({
      error: 'Failed to retrieve messages'
    });
  }
});

// Delete chat
router.delete('/:chatId', validate(schemas.chatIdParam), async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.userId;
    
    const pool = await dbManager.getPool();

    // Verify chat belongs to user
    const chatCheck = await pool.request()
      .input('chatId', sql.NVarChar, chatId)
      .input('userId', sql.NVarChar, userId)
      .query('SELECT id FROM Chats WHERE id = @chatId AND userId = @userId');

    if (chatCheck.recordset.length === 0) {
      return res.status(404).json({
        error: 'Chat not found',
        message: 'Chat not found or access denied'
      });
    }

    // Soft delete the chat
    await pool.request()
      .input('chatId', sql.NVarChar, chatId)
      .query(`
        UPDATE Chats 
        SET isArchived = 1, updatedAt = GETUTCDATE()
        WHERE id = @chatId
      `);
    
    res.json({
      message: 'Chat archived successfully',
      chatId
    });

    logger.info(`Chat deletion requested: ${chatId} by user: ${userId}`);
  } catch (error) {
    logger.error('Delete chat error:', error);
    res.status(500).json({
      error: 'Failed to delete chat'
    });
  }
});

// Message actions (like, bookmark, etc.)
router.post('/:chatId/messages/:messageId/actions', 
  validate(schemas.chatIdParam), 
  validate(schemas.messageIdParam),
  async (req, res) => {
    try {
      const { chatId, messageId } = req.params;
      const { actionType } = req.body;
      const userId = req.user.userId;
      
      if (!['like', 'dislike', 'bookmark', 'star'].includes(actionType)) {
        return res.status(400).json({
          error: 'Invalid action type',
          message: 'Action type must be one of: like, dislike, bookmark, star'
        });
      }
      
      const pool = await dbManager.getPool();
      
      // Verify message belongs to user's chat
      const messageCheck = await pool.request()
        .input('messageId', sql.NVarChar, messageId)
        .input('chatId', sql.NVarChar, chatId)
        .input('userId', sql.NVarChar, userId)
        .query(`
          SELECT m.id FROM Messages m
          JOIN Chats c ON m.chatId = c.id
          WHERE m.id = @messageId AND m.chatId = @chatId AND c.userId = @userId
        `);
      
      if (messageCheck.recordset.length === 0) {
        return res.status(404).json({
          error: 'Message not found',
          message: 'Message not found or access denied'
        });
      }
      
      // Toggle action
      const existingAction = await pool.request()
        .input('messageId', sql.NVarChar, messageId)
        .input('userId', sql.NVarChar, userId)
        .input('actionType', sql.NVarChar, actionType)
        .query(`
          SELECT id FROM MessageActions 
          WHERE messageId = @messageId AND userId = @userId AND actionType = @actionType
        `);
      
      if (existingAction.recordset.length > 0) {
        // Remove action
        await pool.request()
          .input('messageId', sql.NVarChar, messageId)
          .input('userId', sql.NVarChar, userId)
          .input('actionType', sql.NVarChar, actionType)
          .query(`
            DELETE FROM MessageActions 
            WHERE messageId = @messageId AND userId = @userId AND actionType = @actionType
          `);
        
        res.json({ message: 'Action removed', actionType, active: false });
      } else {
        // Add action
        const actionId = uuidv4();
        await pool.request()
          .input('id', sql.NVarChar, actionId)
          .input('messageId', sql.NVarChar, messageId)
          .input('userId', sql.NVarChar, userId)
          .input('actionType', sql.NVarChar, actionType)
          .query(`
            INSERT INTO MessageActions (id, messageId, userId, actionType)
            VALUES (@id, @messageId, @userId, @actionType)
          `);
        
        res.json({ message: 'Action added', actionType, active: true });
      }
    } catch (error) {
      logger.error('Message action error:', error);
      res.status(500).json({
        error: 'Failed to process message action'
      });
    }
  }
);

export { router as chatRoutes };