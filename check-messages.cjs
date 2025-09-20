const sql = require('mssql');

const config = {
  server: 'aivaserver.database.windows.net',
  database: 'aivadb',
  user: 'aivadbadmin',
  password: 'ravi@0791',
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

async function checkMessages() {
  try {
    await sql.connect(config);
    const result = await sql.query('SELECT TOP 5 * FROM Messages ORDER BY createdAt DESC');
    console.log('Recent messages:', result.recordset);
    await sql.close();
  } catch (err) {
    console.error('Database error:', err);
  }
}

checkMessages();