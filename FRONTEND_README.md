# Attendance Tracker Frontend

Frontend application for the Attendance Tracker built with React, TypeScript, and Vite.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file based on `.env.example`:
```bash
cp .env.example .env.local
```

3. Update the `.env.local` file with your backend API URL

## Environment Variables

- `VITE_API_URL`: Backend API URL (e.g., http://localhost:5000/api)

## Running the Application

Development mode:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

## Deployment on Vercel

### Option 1: Vercel CLI
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project directory
3. Follow the prompts
4. Set environment variable `VITE_API_URL` in Vercel dashboard

### Option 2: GitHub Integration
1. Push your code to GitHub
2. Import the repository in Vercel dashboard
3. Vercel will auto-detect the Vite configuration
4. Add environment variable `VITE_API_URL` in the project settings
5. Deploy!

## Project Structure

- `/src` - Source code
  - `/app` - Application components
  - `/styles` - CSS files
- `/public` - Static assets
- `index.html` - Entry HTML file
- `vite.config.ts` - Vite configuration
