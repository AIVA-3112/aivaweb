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

async function testConnection() {
  try {
    console.log('Testing database connection...');
    console.log('Server:', process.env.SQL_SERVER);
    console.log('Database:', process.env.SQL_DATABASE);
    console.log('User:', process.env.SQL_USERNAME);
    
    // Connect to database
    await sql.connect(config);
    console.log('Connected to database successfully');

    // Test query
    const result = await sql.query`SELECT TOP 1 * FROM Workspaces`;
    console.log('Workspaces table query result:', result.recordset);

    // Close connection
    await sql.close();
    console.log('Connection closed');
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
}

testConnection();