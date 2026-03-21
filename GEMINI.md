# Attendance Tracker App - Gemini AI Context

> **Project Context for AI Assistants**  
> This document provides essential context about the Attendance Tracker application for AI-assisted development.

## Project Overview

**Name:** Attendance Tracker App  
**Framework:** React + Vite + Tailwind CSS  
**Backend:** Supabase (PostgreSQL + Auth)  
**Type:** Web Application

## Project Purpose

A web-based attendance tracking application that:
- Tracks employee/student attendance records
- Provides real-time attendance status
- Generates attendance reports
- Integrates with Supabase for backend services

## Key Technologies

| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| Vite | Build tool |
| Tailwind CSS | Styling |
| Supabase | Backend (Auth + Database) |
| TypeScript | Type safety |

## Directory Structure

```
Attendance Tracker App/
├── src/
│   ├── components/     # React components
│   ├── pages/         # Page components
│   ├── services/      # API services
│   └── utils/         # Utility functions
├── Attendance_Tracker-backend/  # Backend code
├── docs/              # Documentation
├── vite.config.ts     # Vite configuration
├── tailwind.config.js # Tailwind configuration
└── index.html         # Entry point
```

## Build Commands

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build
```

## Key Files

- [SUPABASE_SETUP_GUIDE.md](SUPABASE_SETUP_GUIDE.md) - Database setup guide
- [QUICK_SETUP.md](QUICK_SETUP.md) - Quick start guide
- [vite.config.ts](vite.config.ts) - Build configuration
