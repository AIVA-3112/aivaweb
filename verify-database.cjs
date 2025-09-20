const sql = require('mssql');
require('dotenv').config({ path: './server/.env' });

// Database configuration
const config = {
  user: process.env.SQL_USERNAME,
  password: process.env.SQL_PASSWORD,
  server: process.env.SQL_SERVER,
  database: process.env.SQL_DATABASE,
  options: {
    encrypt: process.env.SQL_ENCRYPT === 'true',
    trustServerCertificate: process.env.SQL_TRUST_SERVER_CERTIFICATE === 'true'
  }
};

async function verifyDatabase() {
  let pool;
  try {
    console.log('Testing database connection...');
    console.log('Server:', process.env.SQL_SERVER);
    console.log('Database:', process.env.SQL_DATABASE);
    console.log('User:', process.env.SQL_USERNAME);
    
    // Connect to database
    pool = await new sql.ConnectionPool(config).connect();
    console.log('✅ Connected to database successfully');

    // Test query to check if tables exist
    const tablesResult = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE' 
      AND TABLE_NAME IN ('Users', 'Workspaces', 'Chats', 'Messages', 'MessageActions')
    `);
    
    console.log('Existing tables:', tablesResult.recordset.map(r => r.TABLE_NAME));

    // Check if there are any users
    const userResult = await pool.request().query('SELECT TOP 1 id, email FROM Users ORDER BY createdAt');
    
    if (userResult.recordset.length === 0) {
      console.log('No users found in database.');
      await pool.close();
      return;
    }

    const userId = userResult.recordset[0].id;
    const userEmail = userResult.recordset[0].email;
    console.log(`Found user with ID: ${userId}, Email: ${userEmail}`);

    // Check if there are any workspaces for this user
    const workspaceResult = await pool.request()
      .input('userId', sql.NVarChar, userId)
      .query('SELECT COUNT(*) as count FROM Workspaces WHERE ownerId = @userId');
    
    const count = workspaceResult.recordset[0].count;

    if (count === 0) {
      console.log('No workspaces found for user. Creating default workspace...');
      
      // Create default workspace for this user
      const workspaceId = 'ws-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      
      await pool.request()
        .input('id', sql.NVarChar, workspaceId)
        .input('name', sql.NVarChar, 'Personal Projects')
        .input('description', sql.NVarChar, 'Default workspace for personal projects')
        .input('ownerId', sql.NVarChar, userId)
        .input('color', sql.NVarChar, '#3B82F6')
        .query(`
          INSERT INTO Workspaces (id, name, description, ownerId, color)
          VALUES (@id, @name, @description, @ownerId, @color)
        `);
      
      console.log('✅ Default workspace created successfully for user:', userId);
    } else {
      console.log(`✅ Found ${count} existing workspaces for user. No need to create default workspace.`);
      
      // List existing workspaces
      const existingWorkspaces = await pool.request()
        .input('userId', sql.NVarChar, userId)
        .query('SELECT id, name FROM Workspaces WHERE ownerId = @userId');
      
      console.log('Existing workspaces:');
      existingWorkspaces.recordset.forEach(ws => {
        console.log(`  - ${ws.id}: ${ws.name}`);
      });
    }

    // Test inserting a chat
    console.log('\nTesting chat creation...');
    const chatId = 'chat-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    const chatTitle = 'Test Chat';
    
    await pool.request()
      .input('id', sql.NVarChar, chatId)
      .input('title', sql.NVarChar, chatTitle)
      .input('description', sql.NVarChar, 'Test chat for verification')
      .input('userId', sql.NVarChar, userId)
      .input('workspaceId', sql.NVarChar, (await pool.request()
        .input('userId', sql.NVarChar, userId)
        .query('SELECT TOP 1 id FROM Workspaces WHERE ownerId = @userId')).recordset[0].id)
      .query(`
        INSERT INTO Chats (id, title, description, userId, workspaceId)
        VALUES (@id, @title, @description, @userId, @workspaceId)
      `);
    
    console.log('✅ Test chat created successfully');

    // Test inserting a message
    console.log('\nTesting message creation...');
    const messageId = 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    const messageContent = 'This is a test message for verification';
    
    await pool.request()
      .input('id', sql.NVarChar, messageId)
      .input('chatId', sql.NVarChar, chatId)
      .input('userId', sql.NVarChar, userId)
      .input('content', sql.NVarChar, messageContent)
      .input('role', sql.NVarChar, 'user')
      .query(`
        INSERT INTO Messages (id, chatId, userId, content, role)
        VALUES (@id, @chatId, @userId, @content, @role)
      `);
    
    console.log('✅ Test message created successfully');

    // Test message actions
    console.log('\nTesting message action creation...');
    const actionId = 'action-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    const actionType = 'like';
    
    await pool.request()
      .input('id', sql.NVarChar, actionId)
      .input('messageId', sql.NVarChar, messageId)
      .input('userId', sql.NVarChar, userId)
      .input('actionType', sql.NVarChar, actionType)
      .query(`
        INSERT INTO MessageActions (id, messageId, userId, actionType)
        VALUES (@id, @messageId, @userId, @actionType)
      `);
    
    console.log('✅ Test message action created successfully');

    // Verify the data was inserted
    console.log('\nVerifying data...');
    const verifyChat = await pool.request()
      .input('chatId', sql.NVarChar, chatId)
      .query('SELECT * FROM Chats WHERE id = @chatId');
    
    if (verifyChat.recordset.length > 0) {
      console.log('✅ Chat verification successful');
    } else {
      console.log('❌ Chat verification failed');
    }

    const verifyMessage = await pool.request()
      .input('messageId', sql.NVarChar, messageId)
      .query('SELECT * FROM Messages WHERE id = @messageId');
    
    if (verifyMessage.recordset.length > 0) {
      console.log('✅ Message verification successful');
    } else {
      console.log('❌ Message verification failed');
    }

    const verifyAction = await pool.request()
      .input('actionId', sql.NVarChar, actionId)
      .query('SELECT * FROM MessageActions WHERE id = @actionId');
    
    if (verifyAction.recordset.length > 0) {
      console.log('✅ Message action verification successful');
    } else {
      console.log('❌ Message action verification failed');
    }

    // Close connection
    await pool.close();
    console.log('\n✅ All tests completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (pool) {
      try {
        await pool.close();
      } catch (closeError) {
        console.error('Error closing connection:', closeError.message);
      }
    }
    process.exit(1);
  }
}

verifyDatabase();