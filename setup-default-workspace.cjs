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

async function setupDefaultWorkspace() {
  try {
    // Connect to database
    await sql.connect(config);
    console.log('Connected to database successfully');

    // Check if there are any users
    const userResult = await sql.query`SELECT TOP 1 id FROM Users ORDER BY createdAt`;
    
    if (userResult.recordset.length === 0) {
      console.log('No users found in database. Please create a user first.');
      await sql.close();
      return;
    }

    const userId = userResult.recordset[0].id;
    console.log(`Found user with ID: ${userId}`);

    // Check if there are any workspaces for this user
    const workspaceResult = await sql.query`SELECT COUNT(*) as count FROM Workspaces WHERE ownerId = '${userId}'`;
    const count = workspaceResult.recordset[0].count;

    if (count === 0) {
      // Create default workspace for this user
      const workspaceId = 'ws-' + Date.now(); // Generate unique ID
      
      await sql.query`
        INSERT INTO Workspaces (id, name, description, ownerId, color)
        VALUES ('${workspaceId}', 'Personal Projects', 'Default workspace for personal projects', '${userId}', '#3B82F6')
      `;
      
      console.log('Default workspace created successfully for user:', userId);
    } else {
      console.log(`Found ${count} existing workspaces for user. No need to create default workspace.`);
    }

    // Close connection
    await sql.close();
  } catch (error) {
    console.error('Error setting up default workspace:', error);
    process.exit(1);
  }
}

setupDefaultWorkspace();