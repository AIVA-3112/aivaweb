import sql from 'mssql';
import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob';
import { AppConfigurationClient } from '@azure/app-configuration';
import { DefaultAzureCredential } from '@azure/identity';
import { OpenAIClient, AzureKeyCredential } from '@azure/openai';
import { logger } from '../utils/logger';

// Azure service clients
export let sqlPool: sql.ConnectionPool;
export let blobServiceClient: BlobServiceClient;
export let appConfigClient: AppConfigurationClient;
export let openAIClient: OpenAIClient;

export async function initializeAzureServices() {
  try {
    logger.info('🔄 Initializing Azure services...');

    // Initialize SQL Database
    await initializeSQLDatabase();
    
    // Initialize Blob Storage
    await initializeBlobStorage();
    
    // Initialize App Configuration
    await initializeAppConfiguration();
    
    // Initialize Azure OpenAI
    await initializeOpenAI();

    logger.info('✅ All Azure services initialized successfully');
  } catch (error) {
    logger.error('❌ Failed to initialize Azure services:', error);
    // Don't throw the error, allow the application to continue with mock services
    logger.info('Continuing with available mock services');
  }
}

async function initializeSQLDatabase() {
  try {
    // Always use real Azure SQL Database with dotenv variables, never mock
    logger.info('Using real Azure SQL Database with dotenv configuration');
    
    // Explicitly use only dotenv variables, never KeyVault or other sources
    const config: sql.config = {
      server: process.env.SQL_SERVER || '',
      database: process.env.SQL_DATABASE || '',
      user: process.env.SQL_USERNAME || '',
      password: process.env.SQL_PASSWORD || '',
      options: {
        encrypt: process.env.SQL_ENCRYPT === 'true',
        trustServerCertificate: process.env.SQL_TRUST_SERVER_CERTIFICATE === 'true'
      },
      pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
      }
    };

    // Validate required configuration
    if (!config.server || !config.database || !config.user || !config.password) {
      throw new Error('Missing required SQL database configuration in environment variables');
    }

    sqlPool = new sql.ConnectionPool(config);
    await sqlPool.connect();

    // Create tables if they don't exist
    await createTables();

    logger.info('✅ SQL Database initialized');
  } catch (error) {
    logger.error('❌ Failed to initialize SQL Database:', error);
    throw error; // Don't fallback to mock, fail fast
  }
}

async function createTables() {
  try {
    // Create Users table
    await sqlPool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
      CREATE TABLE Users (
        id NVARCHAR(255) PRIMARY KEY,
        firstName NVARCHAR(100) NOT NULL,
        lastName NVARCHAR(100) NOT NULL,
        email NVARCHAR(255) UNIQUE NOT NULL,
        password NVARCHAR(255),
        provider NVARCHAR(50) NOT NULL DEFAULT 'local',
        providerId NVARCHAR(255),
        avatar NVARCHAR(500),
        preferences NVARCHAR(MAX),
        role NVARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
        isActive BIT DEFAULT 1,
        lastLoginAt DATETIME2,
        createdAt DATETIME2 DEFAULT GETUTCDATE(),
        updatedAt DATETIME2 DEFAULT GETUTCDATE()
      )
    `);

    // Create Workspaces table
    await sqlPool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Workspaces' AND xtype='U')
      CREATE TABLE Workspaces (
        id NVARCHAR(255) PRIMARY KEY,
        name NVARCHAR(200) NOT NULL,
        description NVARCHAR(1000),
        color NVARCHAR(7) DEFAULT '#3B82F6',
        isShared BIT DEFAULT 0,
        ownerId NVARCHAR(255) NOT NULL,
        createdAt DATETIME2 DEFAULT GETUTCDATE(),
        updatedAt DATETIME2 DEFAULT GETUTCDATE(),
        FOREIGN KEY (ownerId) REFERENCES Users(id) ON DELETE CASCADE
      )
    `);

    // Create Chats table
    await sqlPool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Chats' AND xtype='U')
      CREATE TABLE Chats (
        id NVARCHAR(255) PRIMARY KEY,
        title NVARCHAR(500) NOT NULL,
        description NVARCHAR(1000),
        userId NVARCHAR(255) NOT NULL,
        workspaceId NVARCHAR(255),
        messageCount INT DEFAULT 0,
        isArchived BIT DEFAULT 0,
        lastMessageAt DATETIME2,
        createdAt DATETIME2 DEFAULT GETUTCDATE(),
        updatedAt DATETIME2 DEFAULT GETUTCDATE(),
        FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
        FOREIGN KEY (workspaceId) REFERENCES Workspaces(id)
      )
    `);

    // Create Messages table
    await sqlPool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Messages' AND xtype='U')
      CREATE TABLE Messages (
        id NVARCHAR(255) PRIMARY KEY,
        chatId NVARCHAR(255) NOT NULL,
        userId NVARCHAR(255) NOT NULL,
        content NVARCHAR(MAX) NOT NULL,
        role NVARCHAR(50) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
        metadata NVARCHAR(MAX),
        tokens INT DEFAULT 0,
        isEdited BIT DEFAULT 0,
        editedAt DATETIME2,
        createdAt DATETIME2 DEFAULT GETUTCDATE(),
        FOREIGN KEY (chatId) REFERENCES Chats(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES Users(id)
      )
    `);

    // Create MessageActions table for likes, bookmarks, etc.
    await sqlPool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='MessageActions' AND xtype='U')
      CREATE TABLE MessageActions (
        id NVARCHAR(255) PRIMARY KEY,
        messageId NVARCHAR(255) NOT NULL,
        userId NVARCHAR(255) NOT NULL,
        actionType NVARCHAR(50) NOT NULL CHECK (actionType IN ('like', 'dislike', 'bookmark', 'star')),
        createdAt DATETIME2 DEFAULT GETUTCDATE(),
        FOREIGN KEY (messageId) REFERENCES Messages(id),
        FOREIGN KEY (userId) REFERENCES Users(id),
        UNIQUE(messageId, userId, actionType)
      )
    `);

    // Create indexes for better performance
    await sqlPool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Users_Email')
      CREATE INDEX IX_Users_Email ON Users(email)
    `);

    await sqlPool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Chats_UserId')
      CREATE INDEX IX_Chats_UserId ON Chats(userId)
    `);

    await sqlPool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Messages_ChatId')
      CREATE INDEX IX_Messages_ChatId ON Messages(chatId)
    `);

    await sqlPool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Messages_UserId')
      CREATE INDEX IX_Messages_UserId ON Messages(userId)
    `);

    await sqlPool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_MessageActions_MessageId')
      CREATE INDEX IX_MessageActions_MessageId ON MessageActions(messageId)
    `);

    await sqlPool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_MessageActions_UserId')
      CREATE INDEX IX_MessageActions_UserId ON MessageActions(userId)
    `);

    logger.info('✅ Database tables created/verified');
  } catch (error) {
    logger.error('❌ Failed to create tables:', error);
    throw error;
  }
}

async function initializeBlobStorage() {
  try {
    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    
    // Only use mock storage if explicitly requested or if required configuration is missing
    if (!accountName) {
      logger.info('Using mock Blob Storage client - missing configuration');
      // Create a mock client with the necessary methods
      const mockContainerClient = {
        createIfNotExists: async () => ({}),
        getBlockBlobClient: () => ({
          uploadData: async () => ({ etag: 'mock-etag', lastModified: new Date() }),
          delete: async () => ({})
        })
      };
      
      blobServiceClient = {
        getContainerClient: () => mockContainerClient
      } as unknown as BlobServiceClient;
      
      logger.info('✅ Mock Blob Storage initialized');
      return;
    }
    
    // Use connection string if available, otherwise use account key authentication
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (connectionString) {
      logger.info('Using Azure Blob Storage with connection string');
      blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    } else {
      // Use account name and key for authentication (avoiding Key Vault and AAD)
      const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
      if (accountName && accountKey) {
        logger.info('Using Azure Blob Storage with account name and key');
        const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
        blobServiceClient = new BlobServiceClient(
          `https://${accountName}.blob.core.windows.net`,
          sharedKeyCredential
        );
      } else {
        logger.warn('Azure Storage account name or key missing, falling back to mock');
        // Create a mock client with the necessary methods
        const mockContainerClient = {
          createIfNotExists: async () => ({}),
          getBlockBlobClient: () => ({
            uploadData: async () => ({ etag: 'mock-etag', lastModified: new Date() }),
            delete: async () => ({})
          })
        };
        
        blobServiceClient = {
          getContainerClient: () => mockContainerClient
        } as unknown as BlobServiceClient;
        
        logger.info('✅ Mock Blob Storage initialized');
        return;
      }
    }

    // Create container if it doesn't exist
    const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'aiva-files';
    const containerClient = blobServiceClient.getContainerClient(containerName);
    await containerClient.createIfNotExists();

    logger.info('✅ Blob Storage initialized');
  } catch (error) {
    logger.error('❌ Failed to initialize Blob Storage:', error);
    logger.info('Falling back to mock Blob Storage');
    
    // Create a mock client with the necessary methods
    const mockContainerClient = {
      createIfNotExists: async () => ({}),
      getBlockBlobClient: () => ({
        uploadData: async () => ({ etag: 'mock-etag', lastModified: new Date() }),
        delete: async () => ({})
      })
    };
    
    blobServiceClient = {
      getContainerClient: () => mockContainerClient
    } as unknown as BlobServiceClient;
    
    logger.info('✅ Mock Blob Storage initialized as fallback');
  }
}

async function initializeAppConfiguration() {
  try {
    const connectionString = process.env.AZURE_APP_CONFIG_CONNECTION_STRING;
    const mockAppConfig = process.env.MOCK_APP_CONFIG === 'true';
    
    // Debug logging
    logger.info(`MOCK_APP_CONFIG: ${process.env.MOCK_APP_CONFIG}`);
    logger.info(`MOCK_APP_CONFIG === 'true': ${mockAppConfig}`);
    logger.info(`AZURE_APP_CONFIG_CONNECTION_STRING: ${connectionString ? 'SET' : 'NOT SET'}`);
    
    // Only use mock App Configuration if explicitly requested or if required configuration is missing
    if (mockAppConfig || !connectionString) {
      logger.info('Using mock App Configuration client');
      // Create a mock client with the necessary methods
      appConfigClient = {
        getConfigurationSetting: async () => ({
          value: 'mock-value',
          key: 'mock-key',
          label: 'mock-label',
          contentType: 'application/json',
          lastModified: new Date()
        }),
        listConfigurationSettings: async function* () {
          yield {
            value: 'mock-value',
            key: 'mock-key',
            label: 'mock-label',
            contentType: 'application/json',
            lastModified: new Date()
          };
        }
      } as unknown as AppConfigurationClient;
      logger.info('✅ Mock App Configuration initialized');
      return;
    }
    
    // Use connection string if available, otherwise use DefaultAzureCredential with provided credentials
    if (connectionString) {
      appConfigClient = new AppConfigurationClient(connectionString);
    } else {
      // Use the same DefaultAzureCredential instance
      const credential = new DefaultAzureCredential();
      
      // If you have an App Configuration endpoint URL
      const endpoint = process.env.AZURE_APP_CONFIG_ENDPOINT;
      if (endpoint) {
        appConfigClient = new AppConfigurationClient(endpoint, credential);
      } else {
        logger.warn('No App Configuration connection string or endpoint provided');
        throw new Error('Missing App Configuration connection details');
      }
    }
    logger.info('✅ App Configuration initialized');
  } catch (error) {
    logger.error('❌ Failed to initialize App Configuration:', error);
    logger.info('Falling back to mock App Configuration');
    // Create a mock client with the necessary methods
    appConfigClient = {
      getConfigurationSetting: async () => ({
        value: 'mock-value',
        key: 'mock-key',
        label: 'mock-label',
        contentType: 'application/json',
        lastModified: new Date()
      }),
      listConfigurationSettings: async function* () {
        yield {
          value: 'mock-value',
          key: 'mock-key',
          label: 'mock-label',
          contentType: 'application/json',
          lastModified: new Date()
        };
      }
    } as unknown as AppConfigurationClient;
    logger.info('✅ Mock App Configuration initialized as fallback');
  }
}

async function initializeOpenAI() {
  try {
    // Always use real Azure OpenAI with dotenv variables, never mock
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT || '';
    const apiKey = process.env.AZURE_OPENAI_API_KEY || '';
    
    logger.info('Using real Azure OpenAI with dotenv configuration');
    logger.info(`Endpoint: ${endpoint}`);
    
    // Validate required configuration
    if (!endpoint || !apiKey) {
      throw new Error('Azure OpenAI configuration missing in environment variables');
    }
    
    // Clean up endpoint URL if needed
    let cleanEndpoint = endpoint;
    if (cleanEndpoint.endsWith('/')) {
      cleanEndpoint = cleanEndpoint.slice(0, -1);
    }
    
    openAIClient = new OpenAIClient(cleanEndpoint, new AzureKeyCredential(apiKey));
    
    logger.info('✅ Azure OpenAI initialized');
  } catch (error) {
    logger.error('❌ Failed to initialize Azure OpenAI:', error);
    throw error; // Don't fallback to mock, fail fast
  }
}

// Helper functions for database operations
export async function createUser(userData: any) {
  try {
    const request = sqlPool.request();
    const result = await request
      .input('id', sql.NVarChar, userData.id)
      .input('firstName', sql.NVarChar, userData.firstName)
      .input('lastName', sql.NVarChar, userData.lastName)
      .input('email', sql.NVarChar, userData.email)
      .input('password', sql.NVarChar, userData.password || null)
      .input('provider', sql.NVarChar, userData.provider)
      .input('providerId', sql.NVarChar, userData.providerId || null)
      .input('avatar', sql.NVarChar, userData.avatar || null)
      .input('preferences', sql.NVarChar, userData.preferences ? JSON.stringify(userData.preferences) : null)
      .input('role', sql.NVarChar, userData.role || 'user')
      .query(`
        IF NOT EXISTS (SELECT * FROM Users WHERE id = @id)
        BEGIN
          INSERT INTO Users (id, firstName, lastName, email, password, provider, providerId, avatar, preferences, role)
          OUTPUT INSERTED.*
          VALUES (@id, @firstName, @lastName, @email, @password, @provider, @providerId, @avatar, @preferences, @role)
        END
        ELSE
        BEGIN
          UPDATE Users 
          SET firstName = @firstName, lastName = @lastName, email = @email, provider = @provider, 
              providerId = @providerId, avatar = @avatar, preferences = @preferences, role = @role,
              updatedAt = GETUTCDATE()
          OUTPUT INSERTED.*
          WHERE id = @id
        END
      `);
    
    const user = result.recordset[0];
    if (user.preferences) {
      user.preferences = JSON.parse(user.preferences);
    }
    return user;
  } catch (error) {
    logger.error('Error creating user:', error);
    throw error;
  }
}

export async function getUserById(userId: string) {
  try {
    const request = sqlPool.request();
    
    // Get user by ID only
    const result = await request
      .input('id', sql.NVarChar, userId)
      .query('SELECT * FROM Users WHERE id = @id');
    
    if (result.recordset.length === 0) {
      return null;
    }
    
    const user = result.recordset[0];
    if (user.preferences) {
      user.preferences = JSON.parse(user.preferences);
    }
    return user;
  } catch (error) {
    logger.error('Error getting user by ID:', error);
    throw error;
  }
}

export async function getUserByEmail(email: string) {
  try {
    const request = sqlPool.request();
    
    // Get user by email only
    const result = await request
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM Users WHERE email = @email');
    
    if (result.recordset.length === 0) {
      return null;
    }
    
    const user = result.recordset[0];
    if (user.preferences) {
      user.preferences = JSON.parse(user.preferences);
    }
    return user;
  } catch (error) {
    logger.error('Error getting user by email:', error);
    throw error;
  }
}

export async function updateUser(userId: string, updates: any) {
  try {
    const request = sqlPool.request();
    const result = await request
      .input('id', sql.NVarChar, userId)
      .input('firstName', sql.NVarChar, updates.firstName)
      .input('lastName', sql.NVarChar, updates.lastName)
      .input('preferences', sql.NVarChar, updates.preferences ? JSON.stringify(updates.preferences) : null)
      .input('avatar', sql.NVarChar, updates.avatar || null)
      .input('updatedAt', sql.DateTime2, new Date())
      .query(`
        UPDATE Users 
        SET firstName = COALESCE(@firstName, firstName),
            lastName = COALESCE(@lastName, lastName),
            avatar = COALESCE(@avatar, avatar),
            preferences = COALESCE(@preferences, preferences),
            updatedAt = @updatedAt
        OUTPUT INSERTED.*
        WHERE id = @id
      `);
    
    const user = result.recordset[0];
    if (user.preferences) {
      user.preferences = JSON.parse(user.preferences);
    }
    return user;
  } catch (error) {
    logger.error('Error updating user:', error);
    throw error;
  }
}

export async function createChat(chatData: any) {
  try {
    const request = sqlPool.request();
    const result = await request
      .input('id', sql.NVarChar, chatData.id)
      .input('userId', sql.NVarChar, chatData.userId)
      .input('title', sql.NVarChar, chatData.title)
      .input('description', sql.NVarChar, chatData.description)
      .input('workspaceId', sql.NVarChar, chatData.workspaceId || null)
      .input('messageCount', sql.Int, chatData.messageCount || 0)
      .query(`
        INSERT INTO Chats (id, userId, title, description, workspaceId, messageCount)
        OUTPUT INSERTED.*
        VALUES (@id, @userId, @title, @description, @workspaceId, @messageCount)
      `);
    
    return result.recordset[0];
  } catch (error) {
    logger.error('Error creating chat:', error);
    throw error;
  }
}

export async function getChatsByUserId(userId: string) {
  try {
    const request = sqlPool.request();
    const result = await request
      .input('userId', sql.NVarChar, userId)
      .query('SELECT * FROM Chats WHERE userId = @userId ORDER BY createdAt DESC');
    
    return result.recordset;
  } catch (error) {
    logger.error('Error getting chats:', error);
    throw error;
  }
}

export async function createMessage(messageData: any) {
  try {
    const request = sqlPool.request();
    const result = await request
      .input('id', sql.NVarChar, messageData.id)
      .input('chatId', sql.NVarChar, messageData.chatId)
      .input('userId', sql.NVarChar, messageData.userId)
      .input('content', sql.NVarChar, messageData.content)
      .input('role', sql.NVarChar, messageData.role)
      .query(`
        INSERT INTO Messages (id, chatId, userId, content, role)
        OUTPUT INSERTED.*
        VALUES (@id, @chatId, @userId, @content, @role)
      `);
    
    // Update message count in chat
    await sqlPool.request()
      .input('chatId', sql.NVarChar, messageData.chatId)
      .query(`
        UPDATE Chats 
        SET messageCount = (SELECT COUNT(*) FROM Messages WHERE chatId = @chatId),
            lastMessageAt = GETUTCDATE(),
            updatedAt = GETUTCDATE()
        WHERE id = @chatId
      `);
    
    return result.recordset[0];
  } catch (error) {
    logger.error('Error creating message:', error);
    throw error;
  }
}

export async function getMessagesByChatId(chatId: string) {
  try {
    const request = sqlPool.request();
    const result = await request
      .input('chatId', sql.NVarChar, chatId)
      .query('SELECT * FROM Messages WHERE chatId = @chatId ORDER BY createdAt ASC');
    
    return result.recordset;
  } catch (error) {
    logger.error('Error getting messages:', error);
    throw error;
  }
}

// File operations
export async function createFile(fileData: any) {
  try {
    const request = sqlPool.request();
    const result = await request
      .input('id', sql.NVarChar, fileData.id)
      .input('originalName', sql.NVarChar, fileData.originalName)
      .input('fileName', sql.NVarChar, fileData.fileName)
      .input('mimeType', sql.NVarChar, fileData.mimeType)
      .input('size', sql.BigInt, fileData.size)
      .input('url', sql.NVarChar, fileData.url)
      .input('userId', sql.NVarChar, fileData.userId)
      .input('chatId', sql.NVarChar, fileData.chatId || null)
      .input('messageId', sql.NVarChar, fileData.messageId || null)
      .query(`
        INSERT INTO Files (id, originalName, fileName, mimeType, size, url, userId, chatId, messageId)
        OUTPUT INSERTED.*
        VALUES (@id, @originalName, @fileName, @mimeType, @size, @url, @userId, @chatId, @messageId)
      `);
    
    return result.recordset[0];
  } catch (error) {
    logger.error('Error creating file record:', error);
    throw error;
  }
}

export async function getFilesByUserId(userId: string) {
  try {
    const request = sqlPool.request();
    const result = await request
      .input('userId', sql.NVarChar, userId)
      .query('SELECT * FROM Files WHERE userId = @userId ORDER BY createdAt DESC');
    
    return result.recordset;
  } catch (error) {
    logger.error('Error getting files:', error);
    throw error;
  }
}

export async function getFileById(fileId: string) {
  try {
    const request = sqlPool.request();
    const result = await request
      .input('id', sql.NVarChar, fileId)
      .query('SELECT * FROM Files WHERE id = @id');
    
    if (result.recordset.length === 0) {
      return null;
    }
    
    return result.recordset[0];
  } catch (error) {
    logger.error('Error getting file:', error);
    throw error;
  }
}

export async function deleteFileRecord(fileId: string) {
  try {
    const request = sqlPool.request();
    await request
      .input('id', sql.NVarChar, fileId)
      .query('DELETE FROM Files WHERE id = @id');
  } catch (error) {
    logger.error('Error deleting file record:', error);
    throw error;
  }
}

// openAIClient is already exported at the top of the file