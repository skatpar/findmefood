# 🚀 FindMeFood Setup Guide

Complete step-by-step guide to get FindMeFood running on your machine.

## Prerequisites

### Required Software
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** - [Download](https://git-scm.com/)

### API Keys
- **OpenWeatherMap API Key** (Required for weather features)
  - Sign up at https://openweathermap.org/api
  - Free tier includes 60 calls/minute
  - No credit card required

## Step-by-Step Installation

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd findmefood

# Install all dependencies (root, backend, and frontend)
npm install
```

### 2. Configure Backend

```bash
# Navigate to backend
cd backend

# Copy environment template
cp .env.example .env

# Edit .env file
nano .env  # or use your preferred editor
```

Add your API keys to `.env`:
```env
PORT=3001
OPENWEATHER_API_KEY=your_actual_api_key_here
NODE_ENV=development
```

### 3. Configure Frontend

```bash
# Navigate to frontend
cd ../frontend

# Copy environment template
cp .env.example .env

# For local development, default values should work
# Edit if you changed backend port
nano .env
```

Default `.env`:
```env
VITE_API_URL=http://localhost:3001/api
```

### 4. Start the Application

```bash
# From the root directory
cd ..

# Start both backend and frontend
npm run dev
```

This command will:
- Start backend API on http://localhost:3001
- Start frontend on http://localhost:3000
- Open browser automatically

## Verify Installation

### 1. Check Backend
Open http://localhost:3001/api/health in your browser.

You should see:
```json
{
  "status": "ok",
  "timestamp": "2024-01-26T..."
}
```

### 2. Check Frontend
Open http://localhost:3000 in your browser.

You should see the FindMeFood homepage with:
- Upload section
- Location button
- Beautiful gradient background

### 3. Test with Sample Data
1. Click "Use Sample Data" button
2. Click "Get My Location" and allow browser access
3. Click "Find Me Food!"
4. View personalized recommendations

## Development Workflow

### Running Individual Services

**Backend only:**
```bash
npm run dev:backend
```

**Frontend only:**
```bash
npm run dev:frontend
```

### Building for Production

**Build everything:**
```bash
npm run build
```

**Build backend only:**
```bash
cd backend
npm run build
```

**Build frontend only:**
```bash
cd frontend
npm run build
```

### Starting Production Build

```bash
# Start backend in production mode
cd backend
npm start
```

Frontend build will be in `frontend/dist/` - serve with any static file server.

## Troubleshooting

### Port Already in Use

If port 3001 or 3000 is already in use:

**Backend:**
Edit `backend/.env`:
```env
PORT=3002  # or any available port
```

**Frontend:**
Edit `frontend/vite.config.ts`:
```typescript
server: {
  port: 3001,  // change to available port
  // ...
}
```

### OpenWeather API Not Working

**Check your API key:**
1. Log in to https://openweathermap.org/
2. Go to API keys section
3. Verify key is active (can take 10-120 minutes after creation)
4. Copy exact key to `.env`

**API returns 401 Unauthorized:**
- Wait 2 hours after creating new key
- Check for extra spaces in `.env` file
- Verify `.env` is in `/backend` directory

### Location Permission Denied

Enable location in your browser:
- **Chrome**: Click lock icon → Site settings → Location → Allow
- **Firefox**: Click lock icon → Permissions → Access Your Location → Allow
- **Safari**: Safari menu → Preferences → Websites → Location

### Cannot Upload Files

**Check file format:**
- Must be `.csv` or `.json`
- File size under 5MB
- Valid CSV/JSON structure

**Uploads directory:**
```bash
# Ensure uploads directory exists
mkdir -p backend/uploads
chmod 755 backend/uploads
```

### Module Not Found Errors

```bash
# Clean install
rm -rf node_modules package-lock.json
rm -rf backend/node_modules backend/package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json

# Reinstall
npm install
```

### TypeScript Errors

```bash
# Rebuild TypeScript
cd backend
npm run build

cd ../frontend
npm run build
```

## Testing API Endpoints

Use curl or Postman to test:

### Health Check
```bash
curl http://localhost:3001/api/health
```

### Parse Order History
```bash
curl -X POST http://localhost:3001/api/parse-history \
  -H "Content-Type: application/json" \
  -d '{
    "content": "[{\"restaurant\":\"Test\",\"items\":[\"Pizza\"],\"date\":\"2024-01-01\",\"time\":\"19:00\"}]",
    "format": "json"
  }'
```

### Get Weather
```bash
curl -X POST http://localhost:3001/api/weather \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 40.7128,
    "longitude": -74.0060
  }'
```

## Browser Compatibility

Supported browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Required features:
- ES2020 support
- Geolocation API
- Fetch API
- File API

## Performance Tips

### Development
- Use `npm run dev` for hot reloading
- Keep DevTools open for debugging
- Use React DevTools extension

### Production
- Always run `npm run build` before deploying
- Enable gzip compression on server
- Use CDN for static assets
- Set appropriate cache headers

## Database Setup (Future)

Currently uses in-memory mock data. To add a real database:

1. Install database driver:
```bash
cd backend
npm install pg  # PostgreSQL
# or
npm install mongodb  # MongoDB
```

2. Add connection string to `.env`:
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/findmefood
```

3. Update `restaurantService.ts` to fetch from database

## Getting Help

### Check Logs

**Backend logs:**
```bash
# Terminal running backend will show:
# - API requests
# - Errors
# - Weather API calls
```

**Frontend logs:**
```bash
# Open browser DevTools (F12)
# Check Console tab for errors
```

### Common Commands

```bash
# Check Node version
node --version  # Should be 18+

# Check npm version
npm --version

# List running processes
lsof -i :3000  # Frontend
lsof -i :3001  # Backend

# Kill process on port
kill -9 $(lsof -t -i:3001)
```

## Next Steps

1. ✅ Get the app running
2. 📊 Try sample data
3. 📋 Export your real foodpanda history
4. 🔑 Get OpenWeather API key
5. 🚀 Deploy to production
6. 🎨 Customize restaurant data
7. 🤖 Enhance recommendation algorithm

## Need More Help?

- Check README.md for feature documentation
- Open an issue on GitHub
- Review error messages in console
- Check API documentation

---

Happy coding! 🍕
