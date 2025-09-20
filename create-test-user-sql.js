import sql from 'mssql';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const config = {
  server: 'aivaserver.database.windows.net',
  database: 'aivadb',
  user: 'aivadbadmin',
  password: 'ravi@0791',
  options: {
    encrypt: true,
    trustServerCertificate: false,
    enableArithAbort: true,
    requestTimeout: 60000,
    connectionTimeout: 60000,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
    acquireTimeoutMillis: 60000,
  }
};

async function createTestUser() {
  try {
    console.log('Connecting to Azure SQL Database...');
    const pool = new sql.ConnectionPool(config);
    await pool.connect();
    
    // Create a test user
    const email = 'test@example.com';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const userId = uuidv4();
    
    console.log('Creating test user...');
    
    // Check if user already exists
    const existingUser = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM Users WHERE email = @email');
    
    if (existingUser.recordset.length > 0) {
      console.log('Test user already exists with email:', email);
      console.log('User data:', existingUser.recordset[0]);
    } else {
      // Create new user
      const result = await pool.request()
        .input('id', sql.NVarChar, userId)
        .input('firstName', sql.NVarChar, 'Test')
        .input('lastName', sql.NVarChar, 'User')
        .input('email', sql.NVarChar, email)
        .input('password', sql.NVarChar, hashedPassword)
        .input('provider', sql.NVarChar, 'local')
        .input('role', sql.NVarChar, 'user')
        .query(`
          INSERT INTO Users (id, firstName, lastName, email, password, provider, role)
          OUTPUT INSERTED.*
          VALUES (@id, @firstName, @lastName, @email, @password, @provider, @role)
        `);
      
      console.log('Test user created successfully:');
      console.log('Email:', email);
      console.log('Password:', password);
      console.log('User ID:', userId);
    }
    
    // List all users in the table
    console.log('\nAll users in database:');
    const allUsers = await pool.request().query('SELECT id, firstName, lastName, email, provider, role, createdAt FROM Users');
    console.table(allUsers.recordset);
    
    await pool.close();
    console.log('Database connection closed.');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

createTestUser();