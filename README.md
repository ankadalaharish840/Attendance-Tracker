# 📋 Attendance Tracker App

> A modern, full-stack attendance tracking application with real-time monitoring, error tracking, and comprehensive user management.

**Tech Stack**: React + TypeScript + Vite | Node.js + Express | Supabase (PostgreSQL)

---

## 🚀 Quick Start

**New to this project?** Start here: **[QUICK_SETUP.md](QUICK_SETUP.md)** (15 minutes)

### Prerequisites
- Node.js 16+
- A Supabase account (free tier works)

### Quick Commands
```bash
# Backend
cd "Attendance_Tracker-backend"
npm install
npm run dev

# Frontend (new terminal)
npm install
npm run dev
```

Visit http://localhost:5173 and login with:
- Email: `admin@attendance.com`
- Password: `Admin@123` (change immediately!)

---

## 📚 Documentation

### Essential Guides
- **[QUICK_SETUP.md](QUICK_SETUP.md)** - 15-minute setup guide ⭐ START HERE
- **[MIGRATION_AND_ERROR_TRACKING_README.md](MIGRATION_AND_ERROR_TRACKING_README.md)** - Complete feature guide
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Technical implementation details
- **[docs/INDEX.md](docs/INDEX.md)** - Complete documentation index

### Organized Documentation
```
docs/
├── frontend/          # Frontend-specific documentation
│   ├── API_REFERENCE.md
│   ├── FRONTEND_README.md
│   ├── TESTING_CHECKLIST.md
│   └── TESTING_GUIDE.md
├── backend/           # Backend-specific documentation
│   ├── SUPABASE_MIGRATION_GUIDE.md
│   ├── BACKEND_IMPLEMENTATION_REPORT.md
│   └── CODE_VALIDATION_REPORT.md
└── ...                # General documentation
    ├── DEPLOYMENT_GUIDE.md
    ├── SECURITY.md
    └── QUICK_REFERENCE.md
```

---

## ✨ Features

### Core Functionality
- ✅ **Time Tracking**: Clock in/out with precise timestamps
- ✅ **Break Management**: Track breaks with reasons
- ✅ **Leave Requests**: Submit and manage leave requests
- ✅ **Time Change Requests**: Request modifications to logged times
- ✅ **Attendance Calendar**: View historical attendance data

### User Management
- ✅ **Multi-role System**: Super Admin, Admin, Agent roles
- ✅ **User Assignment**: Admins manage assigned agents
- ✅ **Impersonation**: Super admins can view as other users
- ✅ **Team Management**: Organize users by teams

### Error Tracking & Debugging
- ✅ **Frontend Error Tracking**: Automatic error capture with ErrorBoundary
- ✅ **Backend Error Logging**: Winston logger + database logging
- ✅ **Error Download**: Export error logs for debugging
- ✅ **Health Monitoring**: Real-time system health checks

### Security
- ✅ **JWT Authentication**: Secure token-based auth
- ✅ **Role-based Access Control**: Granular permissions
- ✅ **Input Validation**: Comprehensive validation
- ✅ **CORS Protection**: Restricted origins
- ✅ **Security Headers**: Helmet.js integration

---

## 🏗️ Architecture

### Frontend
```
src/
├── app/
│   ├── App.tsx                      # Main app component with ErrorBoundary
│   └── components/                  # React components
│       ├── ErrorBoundary.tsx        # Error boundary component
│       ├── LoginPage.tsx
│       ├── SuperAdminDashboard.tsx
│       ├── AdminDashboard.tsx
│       └── AgentDashboard.tsx
├── utils/
│   ├── api.ts                       # API client with error tracking
│   └── errorTracker.ts              # Frontend error tracking utility
└── styles/                          # Stylesheets
```

### Backend
```
Attendance_Tracker-backend/
├── config/
│   └── supabase.js                  # Supabase configuration
├── middleware/
│   ├── auth.js                      # Authentication middleware
│   └── errorTracking.js             # Error tracking middleware
├── routes/
│   ├── auth.js                      # Authentication routes
│   └── attendance.js                # Attendance & user routes
├── utils/
│   └── supabaseHelpers.js           # Database helper functions
├── logs/                            # Error and application logs
├── schema.sql                       # Database schema
└── server.js                        # Express server
```

---

## 🗄️ Database Schema

### Tables (Supabase PostgreSQL)
- `users` - User accounts with roles
- `attendance` - Clock in/out records
- `breaks` - Break tracking
- `time_change_requests` - Time modification requests
- `leave_requests` - Leave applications
- `settings` - Application settings
- `error_logs` - Error tracking (NEW!)
- `health_checks` - System monitoring (NEW!)

**Schema Setup**: Run `Attendance_Tracker-backend/schema.sql` in Supabase SQL Editor

---

## 🔧 Configuration

### Backend Environment Variables
Create `Attendance_Tracker-backend/.env`:
```env
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
JWT_SECRET=your-jwt-secret
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
LOG_LEVEL=info
```

### Frontend Environment Variables
Create `.env.local` (optional):
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🧪 Testing

### View Error Logs
```sql
-- In Supabase SQL Editor
SELECT * FROM error_logs 
ORDER BY created_at DESC 
LIMIT 20;
```

### Backend Logs
```bash
# Error logs
tail -f Attendance_Tracker-backend/logs/error.log

# All logs
tail -f Attendance_Tracker-backend/logs/combined.log
```

### Frontend Error Logs
```javascript
// In browser console
JSON.parse(localStorage.getItem('app_error_logs'))
```

---

## 📦 What's New in Latest Version

### Migration to Supabase
- ✅ Migrated from MongoDB to Supabase (PostgreSQL)
- ✅ Improved performance and scalability
- ✅ Better data relationships and queries
- ✅ Automatic backups and point-in-time recovery

### Error Tracking System
- ✅ Frontend error boundary with graceful error handling
- ✅ Backend Winston logger with file rotation
- ✅ Database error logging for persistent tracking
- ✅ Error download functionality
- ✅ Health check monitoring

---

## 🤝 Contributing

1. Frontend changes: See [docs/frontend/FRONTEND_README.md](docs/frontend/FRONTEND_README.md)
2. Backend changes: See [docs/backend/SUPABASE_MIGRATION_GUIDE.md](docs/backend/SUPABASE_MIGRATION_GUIDE.md)
3. Testing: See [docs/frontend/TESTING_GUIDE.md](docs/frontend/TESTING_GUIDE.md)

---

## 📞 Support

- **Setup Issues**: Check [QUICK_SETUP.md](QUICK_SETUP.md)
- **Error Tracking**: Check `error_logs` table in Supabase
- **Full Documentation**: See [docs/INDEX.md](docs/INDEX.md)

---

## 📄 License

See LICENSE file for details.

---

## 🎯 Project Status

✅ **Production Ready**
- Supabase migration complete
- Error tracking implemented
- Security hardened
- Comprehensive documentation

---

**Made with ❤️ using React, Node.js, and Supabase**
