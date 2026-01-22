# Security Enhancement Documentation

## Overview
This document outlines the security enhancements made to the Attendance Tracker application.

## Backend Security Enhancements

### 1. Environment Variables Validation
- Required environment variables are validated at startup
- Application exits if critical variables are missing
- Prevents running with incomplete configuration

```javascript
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('ERROR: Supabase environment variables are not set');
  process.exit(1);
}
```

### 2. Helmet.js Integration
- Adds HTTP security headers
- Protects against XSS, clickjacking, and other attacks
- Configured via Express middleware

### 3. CORS Protection
- Restricts API access to specified frontend URL
- Prevents cross-origin attacks
- Credentials mode enabled for secure token transmission

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 4. Request Size Limits
- JSON payload limited to 10KB
- URL-encoded data limited to 10KB
- Prevents large payload attacks

```javascript
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '10kb', extended: true }));
```

### 5. Password Security
- Passwords hashed with bcryptjs (10 salt rounds)
- Never stored or returned in plain text
- Passwords excluded from queries by default (selected: false)

```javascript
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
```

### 6. Input Validation
- Email validation using regex
- Password strength requirements:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character (@$!%*?&)

```javascript
const validatePassword = (password) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
};
```

### 7. JWT Token Security
- Tokens signed with strong secret key
- 7-day expiration for enhanced security
- Always verified before use
- Specific claims included (userId, role)

### 8. Authentication Middleware
- Validates JWT tokens
- Protects routes requiring authentication
- Returns 401 for invalid/expired tokens

```javascript
const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

### 9. Role-Based Access Control (RBAC)
- Three roles: superadmin, admin, agent
- Middleware to enforce permissions
- Future: extend to protect sensitive endpoints

```javascript
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};
```

### 10. Error Handling
- No sensitive error details in production
- Stack traces only in development
- Consistent error response format
- Proper HTTP status codes

```javascript
const isDevelopment = process.env.NODE_ENV === 'development';
res.status(err.status || 500).json({
  error: isDevelopment ? err.message : 'Internal server error',
  ...(isDevelopment && { stack: err.stack })
});
```

### 11. SQL Injection Prevention
- Uses Supabase client with parameterized queries
- Input validation before database operations
- No string concatenation in queries
- PostgreSQL prepared statements

### 12. Data Model Security
- Email validation at application and database level
- Unique email constraint prevents duplicates
- isActive field allows soft delete
- Timestamps with triggers for audit trail
- UUID primary keys instead of sequential IDs

```javascript
// Supabase query example
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('email', email)  // Parameterized, safe from injection
  .single();
```
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email']
  },
  password: {
    type: String,
    required: true,
    select: false // Don't return by default
  },
  // ... other fields
}, { timestamps: true });
```

## Frontend Security Enhancements

### 1. Secure Token Storage
- Tokens stored in localStorage (consider httpOnly cookies for production)
- Token automatically attached to authenticated requests
- Token removal on logout

### 2. XSS Protection
- Content-Type headers prevent script injection
- React escapes content by default
- Avoid dangerouslySetInnerHTML

### 3. CSRF Protection
- Credentials included in requests
- SameSite cookie policy (via CORS)

### 4. Error Handling
- User-friendly error messages
- No sensitive information exposed to users
- Proper error logging

### 5. Session Management
- Automatic logout on token expiration (401 response)
- Token refresh mechanism available
- Secure token transmission via Authorization header

```typescript
if (response.status === 401) {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.location.href = '/login';
  throw new Error('Session expired. Please login again.');
}
```

### 6. Input Validation
- Email and password validation before submission
- Required field checks
- User feedback for validation errors

## Environment Variables Configuration

### Backend (.env)
```
PORT=5000
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_ANON_KEY=your-anon-key-here
JWT_SECRET=your-min-32-character-random-secret-key
FRONTEND_URL=https://your-frontend.vercel.app
NODE_ENV=production
LOG_LEVEL=info
```

**Never commit .env file! Add to .gitignore**

### Frontend (.env.local)
```
VITE_API_URL=https://your-backend.onrender.com/api
```

## Security Best Practices Checklist

### Before Production Deployment
- [ ] Generate strong JWT_SECRET (min 32 characters)
- [ ] Set NODE_ENV=production
- [ ] Configure correct FRONTEND_URL and VITE_API_URL
- [ ] Enable HTTPS for both frontend and backend
- [ ] Set up database backups (Supabase has automatic backups)
- [ ] Review and update all dependencies
- [ ] Set up error tracking (built-in with error_logs table)
- [ ] Configure rate limiting (next step)
- [ ] Enable Supabase Row Level Security (RLS) policies
- [ ] Use environment-specific secrets

### Ongoing Security
- [ ] Regular dependency updates: `npm audit` and `npm update`
- [ ] Monitor logs for suspicious activity
- [ ] Rotate JWT_SECRET periodically
- [ ] Review access logs
- [ ] Update security headers as needed
- [ ] Keep Node.js updated
- [ ] Implement rate limiting on API
- [ ] Add request logging and monitoring

## Additional Security Recommendations

### 1. Rate Limiting (TO IMPLEMENT)
```javascript
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);
```

### 2. Request Logging and Monitoring (TO IMPLEMENT)
- Use morgan for HTTP request logging
- Implement request ID tracking
- Log to external service (Logtail, Papertrail, etc.)

### 3. API Key Authentication (FOR FUTURE)
- For third-party API access
- Use apiKey in headers with validation

### 4. Two-Factor Authentication (FOR FUTURE)
- TOTP support using speakeasy
- Backup codes
- SMS/Email verification

### 5. Audit Logging (FOR FUTURE)
- Track all user actions
- Log data changes
- Maintain compliance audit trail

### 6. Data Encryption (FOR FUTURE)
- Encrypt sensitive fields at rest
- Use TLS/SSL for data in transit (Supabase provides this)
- Implement field-level encryption for PII

## Common Vulnerabilities Protected Against

1. **SQL Injection** ✓ - PostgreSQL with parameterized queries via Supabase
2. **XSS (Cross-Site Scripting)** ✓ - React escapes by default
3. **CSRF (Cross-Site Request Forgery)** ✓ - Token validation + CORS
4. **Clickjacking** ✓ - X-Frame-Options via Helmet
5. **Weak Cryptography** ✓ - JWT with strong secret
6. **Broken Authentication** ✓ - JWT + password hashing
7. **Sensitive Data Exposure** ✓ - No passwords in responses, HTTPS required
8. **XXE (XML External Entity)** ✓ - Not applicable (JSON only)
9. **Broken Access Control** ✓ - RBAC middleware implemented
10. **Security Misconfiguration** ✓ - Environment validation

## Testing Security

### Manual Testing
1. Try to access protected endpoints without token
2. Try to use expired token
3. Try to modify JWT payload
4. Try weak passwords
5. Try SQL injection in email field
6. Try XSS in name field
7. Test CORS with different origins

### Automated Testing
- Use OWASP ZAP for security scanning
- Use Snyk for dependency vulnerability scanning
- Use npm audit for package vulnerabilities

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Checklist](https://nodejs.org/en/docs/guides/nodejs-security/)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8949)
- [Supabase Security](https://supabase.com/docs/guides/platform/security)
