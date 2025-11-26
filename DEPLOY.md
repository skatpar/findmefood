# 🚢 Deployment Guide

Guide for deploying FindMeFood to various platforms.

## Quick Deploy Options

### Option 1: Vercel (Frontend) + Railway (Backend)
**Best for:** Quick deployment with minimal configuration
**Cost:** Free tier available

### Option 2: Heroku (Full Stack)
**Best for:** Single platform deployment
**Cost:** ~$7/month

### Option 3: DigitalOcean/AWS (VPS)
**Best for:** Full control and scalability
**Cost:** From $5/month

---

## 🌐 Frontend Deployment

### Vercel (Recommended)

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Build Frontend**
```bash
cd frontend
npm run build
```

3. **Deploy**
```bash
vercel --prod
```

4. **Configure Environment**
In Vercel dashboard:
- Go to Settings → Environment Variables
- Add `VITE_API_URL` = your backend URL

**One-Click Deploy:**
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Netlify

1. **Build**
```bash
cd frontend
npm run build
```

2. **Deploy via Netlify CLI**
```bash
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

Or drag `dist/` folder to https://app.netlify.com/drop

3. **Environment Variables**
- `VITE_API_URL` = your backend URL

### Static Hosting (S3, GitHub Pages, etc.)

```bash
cd frontend
npm run build

# Upload 'dist' folder to your hosting service
```

For GitHub Pages, add to `package.json`:
```json
{
  "homepage": "https://yourusername.github.io/findmefood"
}
```

---

## 🖥️ Backend Deployment

### Railway (Recommended)

1. **Create Railway Account**
   - Sign up at https://railway.app

2. **Deploy via CLI**
```bash
npm i -g @railway/cli
railway login
cd backend
railway init
railway up
```

3. **Add Environment Variables**
```bash
railway variables set OPENWEATHER_API_KEY=your_key
railway variables set NODE_ENV=production
```

4. **Get URL**
```bash
railway domain
# Use this URL for frontend VITE_API_URL
```

### Heroku

1. **Install Heroku CLI**
```bash
npm i -g heroku
heroku login
```

2. **Create App**
```bash
cd backend
heroku create findmefood-api
```

3. **Set Environment Variables**
```bash
heroku config:set OPENWEATHER_API_KEY=your_key
heroku config:set NODE_ENV=production
```

4. **Deploy**
```bash
git push heroku main
```

5. **Get URL**
```bash
heroku domains
```

### DigitalOcean App Platform

1. **Connect GitHub Repository**
   - Go to https://cloud.digitalocean.com/apps
   - Click "Create App"
   - Select GitHub repo

2. **Configure Build**
   - Build Command: `cd backend && npm install && npm run build`
   - Run Command: `cd backend && npm start`
   - HTTP Port: 3001

3. **Environment Variables**
   - Add all variables from `.env.example`

### Docker Deployment

**Backend Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
```

**Build and Run:**
```bash
cd backend
docker build -t findmefood-backend .
docker run -p 3001:3001 \
  -e OPENWEATHER_API_KEY=your_key \
  findmefood-backend
```

**Frontend Dockerfile:**
```dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose (Full Stack)

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - OPENWEATHER_API_KEY=${OPENWEATHER_API_KEY}
      - NODE_ENV=production
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
```

**Deploy:**
```bash
docker-compose up -d
```

---

## 🔧 Production Configuration

### Backend Environment Variables

**Required:**
```env
PORT=3001
OPENWEATHER_API_KEY=your_key
NODE_ENV=production
```

**Optional:**
```env
GOOGLE_MAPS_API_KEY=your_key
OPENAI_API_KEY=your_key
CORS_ORIGIN=https://yourdomain.com
```

### Frontend Environment Variables

**Required:**
```env
VITE_API_URL=https://your-backend-url.com/api
```

### CORS Configuration

Update `backend/src/index.ts`:

```typescript
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
```

### Security Headers

Add to backend:

```typescript
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});
```

---

## 📊 Database Setup (Optional)

### PostgreSQL on Heroku

```bash
heroku addons:create heroku-postgresql:hobby-dev
heroku config:get DATABASE_URL
```

Update backend:
```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
```

### MongoDB Atlas

1. Create cluster at https://www.mongodb.com/cloud/atlas
2. Get connection string
3. Add to environment:
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/findmefood
```

---

## 🔍 Monitoring & Logging

### Error Tracking with Sentry

```bash
npm install @sentry/node
```

```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});
```

### Logging with Winston

```bash
npm install winston
```

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

---

## 🚀 Performance Optimization

### Backend

1. **Enable Compression**
```bash
npm install compression
```

```typescript
import compression from 'compression';
app.use(compression());
```

2. **Rate Limiting**
```bash
npm install express-rate-limit
```

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use('/api/', limiter);
```

3. **Caching**
```bash
npm install node-cache
```

```typescript
import NodeCache from 'node-cache';
const cache = new NodeCache({ stdTTL: 600 });
```

### Frontend

1. **Code Splitting**
Already configured with Vite

2. **CDN for Static Assets**
Update `vite.config.ts`:
```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        }
      }
    }
  }
})
```

3. **Service Worker (PWA)**
```bash
npm install vite-plugin-pwa
```

---

## 🔒 SSL/HTTPS

### Cloudflare (Free)

1. Add site to Cloudflare
2. Update nameservers
3. Enable "Always Use HTTPS"
4. Enable "Auto Minify"

### Let's Encrypt (VPS)

```bash
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## 📈 Scaling

### Horizontal Scaling

**Load Balancer + Multiple Instances**

Nginx config:
```nginx
upstream backend {
  server backend1:3001;
  server backend2:3001;
  server backend3:3001;
}

server {
  listen 80;
  location /api {
    proxy_pass http://backend;
  }
}
```

### Vertical Scaling

**Increase server resources:**
- 1 vCPU, 1GB RAM → 100-500 concurrent users
- 2 vCPU, 2GB RAM → 500-2000 concurrent users
- 4 vCPU, 4GB RAM → 2000+ concurrent users

---

## ✅ Pre-Deployment Checklist

- [ ] Environment variables configured
- [ ] API keys working
- [ ] CORS configured for production domain
- [ ] Database connection tested (if using)
- [ ] Error logging enabled
- [ ] Rate limiting configured
- [ ] HTTPS/SSL enabled
- [ ] Build tested locally
- [ ] Performance tested
- [ ] Security headers added
- [ ] Monitoring set up
- [ ] Backup strategy in place

---

## 🆘 Troubleshooting

### Build Fails

```bash
# Clear build cache
rm -rf dist node_modules
npm install
npm run build
```

### CORS Errors

Check backend CORS origin matches frontend URL exactly.

### Environment Variables Not Working

- Rebuild after changing variables
- Check variable names (VITE_ prefix for frontend)
- Verify on hosting platform dashboard

### 502 Bad Gateway

- Check backend is running
- Verify port configuration
- Check backend logs

---

## 📱 Mobile Deployment (Future)

### React Native

```bash
npx react-native init FindMeFoodMobile
# Convert web components to React Native
```

### Progressive Web App (PWA)

Already configured with Vite. Users can "Add to Home Screen".

---

For more help, see SETUP.md or open an issue on GitHub.
