require('dotenv').config({ path: './server/.env' });
const { DatabaseManager } = require('./server/dist/config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function createTestUser() {
  try {
    console.log('🔄 Creating test user...');
    
    const dbManager = DatabaseManager.getInstance();
    const pool = await dbManager.getPool();
    
    // Create a test user with known credentials
    const testPassword = 'password123';
    const hashedPassword = await bcrypt.hash(testPassword, 12);
    
    const userData = {
      id: uuidv4(),
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: hashedPassword,
      provider: 'local',
      role: 'user'
    };
    
    console.log('Creating user with data:', {
      ...userData,
      password: `${hashedPassword.substring(0, 20)}...`
    });
    
    // First, check if user already exists
    const existingUser = await pool.request()
      .input('email', sql.NVarChar, userData.email)
      .query('SELECT * FROM Users WHERE email = @email');
    
    if (existingUser.recordset.length > 0) {
      console.log('❌ User already exists with email:', userData.email);
      console.log('Existing user data:', existingUser.recordset[0]);
      return;
    }
    
    // Import sql module for types
    const sql = require('mssql');
    
    // Insert the user
    const result = await pool.request()
      .input('id', sql.NVarChar, userData.id)
      .input('firstName', sql.NVarChar, userData.firstName)
      .input('lastName', sql.NVarChar, userData.lastName)
      .input('email', sql.NVarChar, userData.email)
      .input('password', sql.NVarChar, userData.password)
      .input('provider', sql.NVarChar, userData.provider)
      .input('providerId', sql.NVarChar, null)
      .input('role', sql.NVarChar, userData.role)
      .input('preferences', sql.NVarChar, null)
      .query(`
        INSERT INTO Users (id, firstName, lastName, email, password, provider, providerId, role, preferences)
        OUTPUT INSERTED.*
        VALUES (@id, @firstName, @lastName, @email, @password, @provider, @providerId, @role, @preferences)
      `);
    
    console.log('✅ Test user created successfully!');
    console.log('User data:', result.recordset[0]);
    console.log('\\n🔑 Login credentials:');
    console.log('Email: test@example.com');
    console.log('Password: password123');
    
    await dbManager.disconnect();
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
  }
}

createTestUser();