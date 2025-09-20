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

async function testWorkspaceCreation() {
  let pool;
  try {
    console.log('Testing database connection...');
    console.log('Server:', process.env.SQL_SERVER);
    console.log('Database:', process.env.SQL_DATABASE);
    console.log('User:', process.env.SQL_USERNAME);
    
    // Connect to database
    pool = await new sql.ConnectionPool(config).connect();
    console.log('Connected to database successfully');

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
      
      console.log('Default workspace created successfully for user:', userId);
    } else {
      console.log(`Found ${count} existing workspaces for user. No need to create default workspace.`);
      
      // List existing workspaces
      const existingWorkspaces = await pool.request()
        .input('userId', sql.NVarChar, userId)
        .query('SELECT id, name FROM Workspaces WHERE ownerId = @userId');
      
      console.log('Existing workspaces:');
      existingWorkspaces.recordset.forEach(ws => {
        console.log(`  - ${ws.id}: ${ws.name}`);
      });
    }

    // Close connection
    await pool.close();
    console.log('Connection closed');
  } catch (error) {
    console.error('Error:', error.message);
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

testWorkspaceCreation();