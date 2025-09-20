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

async function checkDatabase() {
  try {
    console.log('Connecting to database...');
    
    // Connect to database
    await sql.connect(config);
    console.log('✅ Connected to database successfully');
    
    // Check users
    const userResult = await sql.query('SELECT COUNT(*) as count FROM Users');
    const userCount = userResult.recordset[0].count;
    console.log(`Users: ${userCount}`);
    
    if (userCount > 0) {
      const users = await sql.query('SELECT TOP 3 id, email, firstName, lastName FROM Users');
      console.log('User details:');
      users.recordset.forEach(user => {
        console.log(`  - ${user.firstName} ${user.lastName} (${user.email}) - ID: ${user.id}`);
      });
    }
    
    // Check workspaces
    const workspaceResult = await sql.query('SELECT COUNT(*) as count FROM Workspaces');
    const workspaceCount = workspaceResult.recordset[0].count;
    console.log(`Workspaces: ${workspaceCount}`);
    
    // Close connection
    await sql.close();
    console.log('Connection closed');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

checkDatabase();