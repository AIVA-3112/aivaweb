// Direct database test script
const sql = require('mssql');

// Database configuration from environment
const config = {
  server: 'aivaserver.database.windows.net',
  database: 'aivadb',
  user: 'aivadbadmin',
  password: 'ravi@0791',
  options: {
    encrypt: true,
    trustServerCertificate: false,
    enableArithAbort: true,
    requestTimeout: 30000,
    connectionTimeout: 15000,
  }
};

async function testDatabaseConnection() {
  let pool;
  
  try {
    console.log('🔍 Testing direct database connection...');
    console.log('Server:', config.server);
    console.log('Database:', config.database);
    console.log('User:', config.user);
    
    // Connect to database
    console.log('\\n🔌 Connecting to database...');
    pool = await sql.connect(config);
    console.log('✅ Connected successfully!');
    
    // Query users table
    console.log('\\n📋 Querying Users table...');
    const result = await pool.request().query('SELECT TOP 10 * FROM Users');
    
    console.log(`Found ${result.recordset.length} users:`);
    result.recordset.forEach((user, index) => {
      console.log(`\\n${index + 1}. ${user.email} (${user.firstName} ${user.lastName})`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Provider: ${user.provider}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Has password: ${!!user.password}`);
      if (user.password) {
        console.log(`   Password hash (first 20 chars): ${user.password.substring(0, 20)}`);
      }
    });
    
    // Test specific email lookup
    console.log('\\n🔍 Testing specific email lookup...');
    const testEmail = 'john.doe@example.com';
    const emailResult = await pool.request()
      .input('email', sql.NVarChar, testEmail)
      .query('SELECT * FROM Users WHERE email = @email');
    
    if (emailResult.recordset.length > 0) {
      console.log(`✅ Found user with email ${testEmail}:`);
      const user = emailResult.recordset[0];
      console.log('User data:', {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        provider: user.provider,
        role: user.role,
        hasPassword: !!user.password
      });
    } else {
      console.log(`❌ No user found with email ${testEmail}`);
    }
    
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.error('Error details:', error);
  } finally {
    if (pool) {
      await pool.close();
      console.log('\\n🔌 Database connection closed');
    }
  }
}

testDatabaseConnection();