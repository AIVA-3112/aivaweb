# AIVA Application Setup Instructions

## Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Azure SQL Database access

## Setup Instructions

### 1. Environment Configuration
The application requires several environment variables to be set. These are defined in the [.env](.env) file:

```
# Database Configuration
SQL_SERVER=aivaserver.database.windows.net
SQL_DATABASE=aivadb
SQL_USERNAME=aivadbadmin
SQL_PASSWORD=ravi@0791
SQL_ENCRYPT=true
SQL_TRUST_SERVER_CERTIFICATE=false

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 2. Install Dependencies
Run the following commands to install dependencies for both frontend and backend:

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
```

### 3. Initialize Database
Run the database initialization script to create tables and test users:

```bash
# From the server directory
npm run init-db
```

This will:
- Create all required database tables
- Create test users:
  - Regular user: test@example.com / password123
  - Admin user: admin@example.com / admin123

### 4. Test Authentication
Verify that the authentication system is working correctly:

```bash
# From the server directory
npm run test-auth
```

### 5. Start the Application
Run both frontend and backend servers:

```bash
# Terminal 1: Start backend server
cd server
npm run dev

# Terminal 2: Start frontend server
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

### 6. Login Credentials
Use the following credentials to test the login functionality:

1. Regular User:
   - Email: test@example.com
   - Password: password123

2. Admin User:
   - Email: admin@example.com
   - Password: admin123

## Troubleshooting

### Database Connection Issues
If you encounter database connection issues:

1. Verify that your Azure SQL Database is accessible
2. Check that the firewall rules allow connections from your IP
3. Confirm that the database credentials in [.env](.env) are correct
4. Test connectivity using the test script: `npm run test-auth`

### Frontend-Backend Communication Issues
If the frontend cannot communicate with the backend:

1. Ensure both servers are running
2. Check that the proxy configuration in [vite.config.ts](vite.config.ts) is correct
3. Verify that API calls are being made to `/api/` endpoints
4. Check the browser's developer console for network errors

### Authentication Errors
If login fails with "Invalid email or password":

1. Run `npm run init-db` to ensure test users exist
2. Run `npm run test-auth` to verify database authentication
3. Check that the JWT_SECRET is set in [.env](.env)
4. Verify that the bcrypt hashing is working correctly