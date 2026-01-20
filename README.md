
  # Attendance Tracker App

A full-stack attendance tracking application with React (TypeScript) frontend and Express + MongoDB backend.

## Project Structure

This repository contains the **frontend** code. The backend is in a separate git repository at `Attendance_Tracker-backend/`.

### Frontend (This Repository)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with Radix UI components
- **Deployment**: Vercel

### Backend (Separate Repository)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with bcrypt
- **Deployment**: Render

## Quick Start

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file:
```bash
cp .env.example .env.local
```

3. Update `VITE_API_URL` in `.env.local` with your backend URL

4. Run development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

### Backend Setup

Navigate to the backend directory:
```bash
cd Attendance_Tracker-backend
```

Follow the instructions in `Attendance_Tracker-backend/README.md`

## Deployment

### Frontend Deployment (Vercel)

1. Push your code to GitHub
2. Import the repository in Vercel
3. Vercel will auto-detect Vite configuration
4. Add environment variable: `VITE_API_URL` (your Render backend URL)
5. Deploy!

Alternatively, use Vercel CLI:
```bash
npm i -g vercel
vercel
```

### Backend Deployment (Render)

1. Create a new Web Service on Render
2. Connect the backend GitHub repository
3. Set:
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Add environment variables:
   - `MONGO_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your JWT secret key
   - `FRONTEND_URL`: Your Vercel frontend URL
   - `NODE_ENV`: production
5. Deploy!

## Environment Variables

### Frontend (.env.local)
- `VITE_API_URL`: Backend API URL (e.g., https://your-app.onrender.com/api)

### Backend (.env)
- `PORT`: Server port (default: 5000)
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `FRONTEND_URL`: Frontend URL for CORS
- `NODE_ENV`: Environment (development/production)

## Features

- User authentication (login/register)
- Role-based access control (SuperAdmin, Admin, Agent)
- Time tracking
- Attendance calendar
- Leave requests
- Live dashboard
- User management
- Settings panel

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Radix UI
- Material-UI
- Date-fns
- Lucide Icons

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT (jsonwebtoken)
- bcrypt.js
- CORS
- Helmet

## Git Repositories

- **Frontend**: Current repository (for Vercel deployment)
- **Backend**: `Attendance_Tracker-backend/` (separate git repo for Render deployment)

## Support

For issues or questions, please create an issue in the respective repository.

  This is a code bundle for Attendance Tracker App. The original project is available at https://www.figma.com/design/U2PLYHyoqcIaCAORbql71Y/Attendance-Tracker-App.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.
  