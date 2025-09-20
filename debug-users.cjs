const sql = require('mssql');

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
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
    acquireTimeoutMillis: 60000,
  }
};

async function debugUsers() {
  let pool;
  
  try {
    console.log('Connecting to database...');
    pool = await sql.connect(config);
    console.log('✅ Connected to database');
    
    // List all users
    console.log('\n📋 All users in the database:');
    const allUsersResult = await pool.request().query('SELECT * FROM Users');
    console.log('Total users found:', allUsersResult.recordset.length);
    
    allUsersResult.recordset.forEach((user, index) => {
      console.log(`\n${index + 1}. User ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.firstName} ${user.lastName}`);
      console.log(`   Provider: ${user.provider}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Password hash: ${user.password ? user.password.substring(0, 20) + '...' : 'No password'}`);
      console.log(`   Active: ${user.isActive}`);
      console.log(`   Created: ${user.createdAt}`);
    });
    
    // Test specific email lookup
    const testEmail = 'john.doe@example.com';
    console.log(`\n🔍 Looking up user with email: ${testEmail}`);
    const userResult = await pool.request()
      .input('email', sql.NVarChar, testEmail)
      .query('SELECT * FROM Users WHERE email = @email');
    
    if (userResult.recordset.length > 0) {
      const user = userResult.recordset[0];
      console.log('✅ User found!');
      console.log('User data:', {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        provider: user.provider,
        role: user.role,
        hasPassword: !!user.password,
        passwordLength: user.password ? user.password.length : 0
      });
    } else {
      console.log('❌ User not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    if (pool) {
      await sql.close();
      console.log('\n🔌 Database connection closed');
    }
  }
}

debugUsers();