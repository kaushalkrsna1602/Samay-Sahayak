# Time AI - AI-Powered Time Management Application

Time AI is a modern web application that helps users create personalized timetables using AI. Built with Next.js, Express.js, MongoDB, and Google Gemini AI.

## Features

- 🔐 **Authentication**: Secure user authentication with Clerk
- 🤖 **AI-Powered Scheduling**: Generate personalized timetables using Google Gemini AI
- 📊 **Analytics**: Track your productivity and time management
- 🎯 **Task Management**: Organize and prioritize your tasks
- ⚡ **Productivity Techniques**: Choose from various time management techniques
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile

## Tech Stack

### Frontend
- **Next.js 15** (App Router, TypeScript)
- **React 19** with Redux Toolkit
- **Tailwind CSS** for styling
- **Clerk** for authentication
- **Lucide React** for icons

### Backend
- **Express.js** server
- **MongoDB Atlas** for database
- **Google Gemini AI** for timetable generation
- **Mongoose** for MongoDB ODM

## Prerequisites

Before deploying, make sure you have:

1. **Node.js 18+** and **npm 8+**
2. **MongoDB Atlas** account and database
3. **Google Gemini AI** API key
4. **Clerk** account for authentication
5. **Git** for version control

## Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

### Backend (.env)
```env
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
MONGODB_URI=your_mongodb_connection_string
```

## Deployment Options

### Option 1: Vercel (Recommended for Frontend)

1. **Prepare your repository**:
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Connect your GitHub repository
   - Set environment variables in Vercel dashboard
   - Deploy

3. **Configure environment variables in Vercel**:
   - `NEXT_PUBLIC_API_URL`: Your backend URL
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key
   - `CLERK_SECRET_KEY`: Your Clerk secret key

### Option 2: Railway (Full Stack)

1. **Deploy to Railway**:
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub repository
   - Add environment variables
   - Deploy both frontend and backend

### Option 3: Docker Deployment

1. **Build and run with Docker Compose**:
   ```bash
   # Build and start services
   docker-compose up --build
   
   # Run in background
   docker-compose up -d --build
   ```

2. **Individual Docker builds**:
   ```bash
   # Frontend
   docker build -t time-ai-frontend .
   docker run -p 3000:3000 time-ai-frontend
   
   # Backend
   cd backend
   docker build -t time-ai-backend .
   docker run -p 5000:5000 time-ai-backend
   ```

### Option 4: Manual Deployment

1. **Deploy Backend**:
   ```bash
   cd backend
   npm install --production
   npm start
   ```

2. **Deploy Frontend**:
   ```bash
   npm install
   npm run build
   npm start
   ```

## Development Setup

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd time-ai
   ```

2. **Install dependencies**:
   ```bash
   # Frontend dependencies
   npm install
   
   # Backend dependencies
   cd backend
   npm install
   cd ..
   ```

3. **Set up environment variables**:
   - Copy `.env.example` to `.env.local` (frontend)
   - Copy `backend/.env.example` to `backend/.env` (backend)
   - Fill in your actual API keys and URLs

4. **Run development servers**:
   ```bash
   # Run both frontend and backend
   npm run dev:full
   
   # Or run separately
   npm run dev          # Frontend
   npm run backend      # Backend
   ```

## API Endpoints

### Timetable Management
- `POST /api/generate-timetable` - Generate AI timetable
- `GET /api/timetables` - Get user timetables
- `POST /api/timetables` - Save timetable
- `DELETE /api/timetables/:id` - Delete timetable

### Analytics
- `GET /api/analytics` - Get user analytics

## Project Structure

```
time-ai/
├── src/
│   ├── app/                 # Next.js app router pages
│   ├── components/          # React components
│   ├── services/           # API services
│   └── store/              # Redux store and slices
├── backend/
│   ├── models/             # MongoDB models
│   └── server.js           # Express server
├── public/                 # Static assets
└── Dockerfile              # Docker configuration
```

## Security Considerations

1. **Environment Variables**: Never commit sensitive keys to version control
2. **CORS**: Configure CORS properly for production
3. **Authentication**: Use Clerk's secure authentication
4. **Database**: Use MongoDB Atlas with proper security settings
5. **API Keys**: Rotate API keys regularly

## Performance Optimization

1. **Next.js**: Uses standalone output for better performance
2. **Images**: Optimized with Next.js Image component
3. **Caching**: Implement proper caching strategies
4. **Database**: Use MongoDB indexes for better query performance

## Monitoring and Logging

1. **Error Tracking**: Implement error tracking (e.g., Sentry)
2. **Performance Monitoring**: Use Vercel Analytics or similar
3. **Logging**: Implement proper logging for debugging

## Support

For issues and questions:
1. Check the documentation
2. Review environment variable configuration
3. Ensure all dependencies are properly installed
4. Verify API keys and database connections

## License

MIT License - see LICENSE file for details
