# TSamay Sahayak Deployment Guide

This guide provides step-by-step instructions for deploying the Samay Sahayak application to various platforms.

## 🚀 Quick Start

### Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] npm 8+ installed
- [ ] Git repository set up
- [ ] MongoDB Atlas account and database
- [ ] Google Gemini AI API key
- [ ] Clerk account for authentication
- [ ] Domain name (optional but recommended)

### Environment Setup

1. **Clone and prepare the repository**:
   ```bash
   git clone <your-repo-url>
   cd time-ai
   ```

2. **Set up environment variables**:
   ```bash
   # Frontend
   cp .env.example .env.local
   # Edit .env.local with your actual values
   
   # Backend
   cp backend/.env.example backend/.env
   # Edit backend/.env with your actual values
   ```

3. **Test locally**:
   ```bash
   npm run dev:full
   ```

## 📦 Deployment Options

### Option 1: Vercel + Railway (Recommended)

**Frontend (Vercel)**:
1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "New Project"
3. Import your GitHub repository
4. Configure build settings:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`
5. Add environment variables:
   - `NEXT_PUBLIC_API_URL`: Your Railway backend URL
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key
   - `CLERK_SECRET_KEY`: Your Clerk secret key
6. Deploy

**Backend (Railway)**:
1. Go to [railway.app](https://railway.app) and sign up/login
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Set the root directory to `backend`
5. Add environment variables:
   - `GEMINI_API_KEY`: Your Google Gemini API key
   - `MONGODB_URI`: Your MongoDB connection string
   - `NODE_ENV`: `production`
   - `FRONTEND_URL`: Your Vercel frontend URL
6. Deploy

### Option 2: Docker Deployment

1. **Build and run with Docker Compose**:
   ```bash
   # Make sure Docker and Docker Compose are installed
   docker-compose up --build -d
   ```

2. **Access your application**:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

3. **For production deployment**:
   ```bash
   # Update docker-compose.yml with your domain
   # Set environment variables
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Option 3: Manual Server Deployment

**Backend Deployment**:
1. **Set up your server** (Ubuntu 20.04+ recommended):
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js 18+
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2 for process management
   sudo npm install -g pm2
   
   # Install nginx
   sudo apt install nginx -y
   ```

2. **Deploy backend**:
   ```bash
   # Clone repository
   git clone <your-repo-url>
   cd time-ai/backend
   
   # Install dependencies
   npm install --production
   
   # Set environment variables
   cp .env.example .env
   # Edit .env with your production values
   
   # Start with PM2
   pm2 start server.js --name "time-ai-backend"
   pm2 save
   pm2 startup
   ```

3. **Configure nginx**:
   ```bash
   sudo nano /etc/nginx/sites-available/time-ai-backend
   ```

   Add this configuration:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Enable the site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/time-ai-backend /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

**Frontend Deployment**:
1. **Build the application**:
   ```bash
   cd time-ai
   npm install
   npm run build
   ```

2. **Serve with nginx**:
   ```bash
   sudo nano /etc/nginx/sites-available/time-ai-frontend
   ```

   Add this configuration:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /var/www/time-ai/.next;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
       
       location /_next/static {
           alias /var/www/time-ai/.next/static;
           expires 365d;
           access_log off;
       }
   }
   ```

### Option 4: Cloud Platforms

#### Heroku
1. **Backend**:
   ```bash
   cd backend
   heroku create time-ai-backend
   heroku config:set GEMINI_API_KEY=your_key
   heroku config:set MONGODB_URI=your_uri
   git push heroku main
   ```

2. **Frontend**:
   ```bash
   cd ..
   heroku create time-ai-frontend
   heroku config:set NEXT_PUBLIC_API_URL=https://time-ai-backend.herokuapp.com
   git push heroku main
   ```

#### DigitalOcean App Platform
1. Connect your GitHub repository
2. Configure build settings for both frontend and backend
3. Set environment variables
4. Deploy

## 🔧 Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### Backend (.env)
```env
NODE_ENV=production
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
MONGODB_URI=mongodb+srv://...
FRONTEND_URL=https://your-frontend-domain.com
```

## 🔒 Security Checklist

- [ ] Environment variables are set and secure
- [ ] CORS is properly configured
- [ ] HTTPS is enabled
- [ ] API keys are rotated regularly
- [ ] Database has proper access controls
- [ ] Authentication is working correctly
- [ ] Error messages don't expose sensitive information

## 📊 Monitoring and Maintenance

### Health Checks
- Frontend: `https://your-domain.com/api/health`
- Backend: `https://your-backend-domain.com/api/health`

### Logs
- **Vercel**: Check deployment logs in dashboard
- **Railway**: View logs in project dashboard
- **Docker**: `docker-compose logs -f`
- **PM2**: `pm2 logs`

### Performance Monitoring
- Set up Vercel Analytics
- Monitor MongoDB Atlas performance
- Track API response times
- Set up error tracking (Sentry)

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Check CORS configuration in backend
   - Verify frontend URL in environment variables

2. **Database Connection Issues**:
   - Verify MongoDB URI
   - Check network connectivity
   - Ensure IP whitelist includes your server

3. **Authentication Problems**:
   - Verify Clerk configuration
   - Check environment variables
   - Ensure redirect URLs are correct

4. **Build Failures**:
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Review build logs for specific errors

### Debug Commands
```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Test backend locally
cd backend && npm start

# Test frontend locally
npm run dev

# Check Docker containers
docker ps

# View logs
docker-compose logs -f
```

## 📈 Scaling Considerations

1. **Database**: Consider MongoDB Atlas M10+ for production
2. **Caching**: Implement Redis for session storage
3. **CDN**: Use Vercel's edge network or Cloudflare
4. **Load Balancing**: Set up multiple backend instances
5. **Monitoring**: Implement comprehensive logging and monitoring

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run test
      # Add deployment steps for your platform
```

## 📞 Support

If you encounter issues during deployment:

1. Check the troubleshooting section above
2. Review platform-specific documentation
3. Verify all environment variables are set correctly
4. Check logs for specific error messages
5. Ensure all prerequisites are met

## 🎉 Post-Deployment

After successful deployment:

1. Test all features thoroughly
2. Set up monitoring and alerts
3. Configure backups for your database
4. Set up SSL certificates if needed
5. Document your deployment process
6. Share your application with users!

---

**Happy Deploying! 🚀** 