# Testing & Validation Guide

## Overview
This document provides comprehensive testing and validation procedures for the Attendance Tracker application.

## Prerequisites

### Backend
- Node.js v16+ installed
- npm v8+ installed
- MongoDB instance (local or Atlas)
- Port 5000 available

### Frontend
- Node.js v16+ installed
- npm v8+ installed
- Port 5173 available (Vite default)

## Backend Testing

### Step 1: Verify Dependencies
```bash
cd Attendance_Tracker-backend
npm audit
```

Expected output: "found 0 vulnerabilities"

### Step 2: Configure Environment
```bash
# Copy example file
cp .env.example .env

# Edit .env with your MongoDB URI and JWT secret
# Ensure NODE_ENV is set appropriately
```

**For local MongoDB testing:**
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/attendance_tracker_dev
JWT_SECRET=your_min_32_char_secret_key_here_1234567890ab
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

**For MongoDB Atlas:**
```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/attendance_tracker?retryWrites=true&w=majority
JWT_SECRET=your_min_32_char_secret_key_here_1234567890ab
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### Step 3: Test Backend Startup
```bash
npm start
```

Expected output:
```
MongoDB connected: localhost:27017
Server running on port 5000 in development mode
```

### Step 4: Test API Endpoints (While server is running)

#### Option A: Using PowerShell (Windows)
```powershell
# From backend directory
.\test.ps1
```

#### Option B: Using curl/bash (Linux/Mac)
```bash
# From backend directory
bash test.sh
```

#### Option C: Manual Testing with Browser/Postman

**Test 1: Health Check**
```
GET http://localhost:5000/api/health
Expected: 200 OK
Response:
{
  "status": "ok",
  "message": "Attendance Tracker Backend API",
  "timestamp": "2024-01-19T12:00:00.000Z"
}
```

**Test 2: Root Endpoint**
```
GET http://localhost:5000/
Expected: 200 OK
Response:
{
  "message": "Attendance Tracker API - Backend is running",
  "version": "1.0.0",
  "timestamp": "2024-01-19T12:00:00.000Z"
}
```

**Test 3: User Registration**
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "SecurePass123!",
  "name": "Test User",
  "role": "agent"
}

Expected: 201 Created
Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "65a4b5c6d7e8f9g0h1i2j3k4",
    "email": "test@example.com",
    "role": "agent",
    "name": "Test User",
    "createdAt": "2024-01-19T12:00:00.000Z"
  },
  "message": "User registered successfully"
}
```

**Test 4: User Login**
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "SecurePass123!"
}

Expected: 200 OK
Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "65a4b5c6d7e8f9g0h1i2j3k4",
    "email": "test@example.com",
    "role": "agent",
    "name": "Test User"
  }
}
```

**Test 5: Invalid Password**
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "WrongPassword123!"
}

Expected: 401 Unauthorized
Response:
{
  "error": "Invalid credentials"
}
```

**Test 6: Invalid Email Format**
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "invalid-email",
  "password": "SecurePass123!",
  "name": "Test User"
}

Expected: 400 Bad Request
Response:
{
  "error": "Invalid email format"
}
```

**Test 7: Weak Password**
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "test2@example.com",
  "password": "weak",
  "name": "Test User"
}

Expected: 400 Bad Request
Response:
{
  "error": "Password must be at least 8 characters with uppercase, lowercase, number, and special character"
}
```

**Test 8: Get User Profile (Authenticated)**
```
GET http://localhost:5000/api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

Expected: 200 OK
Response:
{
  "_id": "65a4b5c6d7e8f9g0h1i2j3k4",
  "email": "test@example.com",
  "role": "agent",
  "name": "Test User"
}
```

**Test 9: Invalid Token**
```
GET http://localhost:5000/api/auth/me
Authorization: Bearer invalid_token_here

Expected: 401 Unauthorized
Response:
{
  "error": "Invalid token"
}
```

### Test Results Checklist

- [ ] Health check returns 200 with correct message
- [ ] Root endpoint returns 200 with version info
- [ ] Valid registration creates user and returns token
- [ ] Valid login returns token for registered user
- [ ] Invalid password login returns 401
- [ ] Invalid email format returns 400
- [ ] Weak password returns 400
- [ ] Duplicate email returns 409
- [ ] Authenticated endpoints require valid token
- [ ] Expired/invalid tokens return 401
- [ ] No passwords returned in responses
- [ ] All responses contain proper error messages

## Frontend Testing

### Step 1: Install Dependencies
```bash
cd "Attendance Tracker App"
npm install
```

Check for any vulnerabilities:
```bash
npm audit
```

### Step 2: Configure Environment
```bash
# Copy example file
cp .env.example .env.local

# Update VITE_API_URL to match your backend
# .env.local:
# VITE_API_URL=http://localhost:5000/api
```

### Step 3: Test Development Server
```bash
npm run dev
```

Expected output:
```
VITE v5.0.0  ready in 500 ms
➜  Local:   http://localhost:5173/
```

### Step 4: Test Frontend Features

#### Manual Testing Steps
1. **Open Application**
   - Navigate to http://localhost:5173/
   - Check if page loads without errors
   - Open browser console (F12) for any errors

2. **Test Login Flow**
   - Click login page
   - Enter valid credentials
   - Verify page redirects to dashboard
   - Check if token is stored in localStorage

3. **Test Registration Flow**
   - Click register link
   - Enter new user credentials
   - Verify account is created
   - Verify user is logged in automatically

4. **Test API Connection**
   - Open browser console
   - All network requests should go to correct backend URL
   - No CORS errors should appear
   - All responses should have proper status codes

5. **Test Token Management**
   - Open localStorage in DevTools
   - Verify auth_token is stored after login
   - Verify auth_user contains user data
   - Verify token is removed after logout

6. **Test Error Handling**
   - Try login with wrong password
   - Try login with non-existent email
   - Try registration with invalid email
   - Try registration with weak password
   - Verify error messages are user-friendly

7. **Test Session Management**
   - Login successfully
   - Close and reopen browser
   - Verify user is still logged in (if token valid)
   - Wait for token expiration (7 days)
   - Verify user is redirected to login

### Step 5: Build for Production
```bash
npm run build
```

Check for build errors:
```bash
npm run build 2>&1 | grep -i error
```

Expected: No errors in build output

### Frontend Testing Checklist

- [ ] Dependencies install without vulnerabilities
- [ ] Development server starts without errors
- [ ] Application loads in browser
- [ ] No console errors on page load
- [ ] Login endpoint is called correctly
- [ ] Registration endpoint is called correctly
- [ ] Valid login redirects to dashboard
- [ ] Valid registration auto-logs in user
- [ ] Invalid credentials show error message
- [ ] Token is stored in localStorage
- [ ] Token is sent in Authorization header
- [ ] Session persists across page refreshes
- [ ] Logout clears token and redirects
- [ ] API URL is correct from env variables
- [ ] Build completes without errors
- [ ] Production build runs without errors

## Database Connection Testing

### Test MongoDB Connection

#### Local MongoDB
```bash
# Check if MongoDB is running
mongo --version

# Connect to local database
mongo mongodb://localhost:27017/attendance_tracker_dev

# Check collections
show collections

# Check users
db.users.find()
```

#### MongoDB Atlas
```bash
# Get connection string from Atlas dashboard
mongo "mongodb+srv://username:password@cluster.mongodb.net/attendance_tracker"

# Check if connected
db.version()

# List collections
show collections
```

### Verify Data Storage

After registration/login:
```javascript
// In MongoDB shell or MongoDB Compass
db.users.find()

// Expected output:
{
  "_id": ObjectId("..."),
  "email": "test@example.com",
  "password": "$2a$10$...", // bcrypt hash
  "name": "Test User",
  "role": "agent",
  "isActive": true,
  "createdAt": ISODate("2024-01-19T12:00:00.000Z"),
  "updatedAt": ISODate("2024-01-19T12:00:00.000Z")
}
```

## Security Testing

### Test 1: Password Hashing
Verify that passwords are hashed:
```javascript
// In MongoDB shell
db.users.findOne({email: "test@example.com"})

// The password field should be a bcrypt hash, not plaintext
// Example: $2a$10$dXJ3SW6G7P50eS3...
```

### Test 2: Sensitive Data Exposure
Check that passwords are not returned in API responses:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123!"}'

# Response should NOT contain password field
```

### Test 3: Token Security
Verify token validation:
```bash
# Test with invalid token
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer invalid_token"

# Should return 401 Unauthorized
```

### Test 4: CORS Protection
Test cross-origin requests:
```javascript
// In browser console from different origin
fetch('http://localhost:5000/api/health')
  .then(r => r.json())
  .then(console.log)

// Should fail due to CORS unless origin is in whitelist
```

### Test 5: Input Validation
Attempt injection attacks:
```bash
# SQL-like injection (should be rejected)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com\" OR \"1\"=\"1","password":"test"}'

# Should validate email format and return error
```

## Performance Testing

### Load Testing (Optional)
```bash
# Install artillery
npm install -g artillery

# Create load.yml
# Run load test
artillery quick --count 10 --num 100 http://localhost:5000/api/health
```

## Automated Testing Commands

### Run All Backend Tests
```bash
cd Attendance_Tracker-backend

# On Windows
pwsh -File test.ps1

# On Linux/Mac
bash test.sh
```

### Run Frontend Build Test
```bash
cd "Attendance Tracker App"
npm run build
```

## Troubleshooting

### Backend Issues

**Error: MONGO_URI not set**
- Solution: Ensure .env file exists and has MONGO_URI
- Verify connection string format is correct

**Error: JWT_SECRET not set**
- Solution: Generate a strong secret: `openssl rand -hex 32`
- Add to .env: `JWT_SECRET=<generated_value>`

**Error: Port 5000 already in use**
- Solution: Change PORT in .env or kill process on port 5000
- Windows: `netstat -ano | findstr :5000`

**Error: MongoDB connection timeout**
- Solution: Verify MongoDB is running and accessible
- Check network access in MongoDB Atlas
- Verify credentials in connection string

### Frontend Issues

**Error: API requests failing**
- Solution: Verify VITE_API_URL is correct
- Check if backend is running
- Check CORS settings on backend

**Error: VITE build fails**
- Solution: Run `npm audit` and fix vulnerabilities
- Delete node_modules and package-lock.json, reinstall
- Check TypeScript errors: `npx tsc --noEmit`

## Next Steps

1. Complete all tests above
2. Fix any issues found
3. Set up monitoring and logging
4. Deploy to production environments
5. Set up CI/CD pipeline
6. Implement automated testing in pipeline

## Resources

- [Testing Node.js Applications](https://nodejs.org/en/docs/guides/testing/)
- [MongoDB Testing Practices](https://docs.mongodb.com/manual/reference/)
- [Vite Testing Guide](https://vitejs.dev/)
- [API Testing Best Practices](https://restfulapi.net/testing/)
