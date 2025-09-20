const sql = require('mssql');

// Database configuration from environment variables
const config = {
  user: 'aivadbadmin',
  password: 'ravi@0791',
  server: 'aivaserver.database.windows.net',
  database: 'aivadb',
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

async function testDatabase() {
  try {
    console.log('Connecting to database...');
    
    // Connect to database
    await sql.connect(config);
    console.log('✅ Connected to database successfully');
    
    // Test query
    const result = await sql.query('SELECT TOP 1 * FROM Users');
    console.log('✅ Query executed successfully');
    console.log('Found', result.recordset.length, 'users');
    
    // Close connection
    await sql.close();
    console.log('Connection closed');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

testDatabase();