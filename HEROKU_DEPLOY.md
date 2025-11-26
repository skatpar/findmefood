# Deploying FindMeFood to Heroku

This guide will help you deploy the FindMeFood application to Heroku.

## Prerequisites

1. **Heroku Account**: Sign up at [heroku.com](https://heroku.com)
2. **Heroku CLI**: Install from [devcenter.heroku.com/articles/heroku-cli](https://devcenter.heroku.com/articles/heroku-cli)
3. **Git**: Ensure your code is in a git repository

## Quick Deploy Steps

### 1. Login to Heroku

```bash
heroku login
```

### 2. Create a Heroku App

```bash
heroku create your-app-name
# Or let Heroku generate a random name:
# heroku create
```

### 3. Set Environment Variables

Set the required environment variables for your app:

```bash
# Required
heroku config:set NODE_ENV=production
heroku config:set OPENWEATHER_API_KEY=your_openweather_api_key_here

# Optional (if using)
heroku config:set GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
heroku config:set OPENAI_API_KEY=your_openai_api_key_here
```

To get your API keys:
- **OpenWeather API**: Sign up at [openweathermap.org/api](https://openweathermap.org/api)
- **Google Maps API**: Get from [Google Cloud Console](https://console.cloud.google.com/)
- **OpenAI API**: Get from [platform.openai.com](https://platform.openai.com/)

### 4. Deploy to Heroku

```bash
# Push to Heroku
git push heroku main

# Or if you're on a different branch:
git push heroku your-branch-name:main
```

### 5. Open Your App

```bash
heroku open
```

## What Happens During Deployment

1. **Heroku detects** this is a Node.js app from `package.json`
2. **Install dependencies** for the root, backend, and frontend
3. **Run heroku-postbuild** script which:
   - Installs backend dependencies
   - Installs frontend dependencies
   - Builds the backend (TypeScript → JavaScript)
   - Builds the frontend (React + Vite → static files)
4. **Start the app** using the `Procfile` which runs `npm start`
5. **Backend serves** both API endpoints and the built frontend

## Deployment Architecture

```
Your Heroku App (https://your-app.herokuapp.com)
│
├── Frontend (React SPA)
│   └── Served as static files from /frontend/dist
│
└── Backend (Express API)
    ├── /api/health
    ├── /api/upload-history
    ├── /api/weather
    ├── /api/restaurants
    ├── /api/recommendations
    └── /api/parse-history
```

## Verifying Deployment

1. **Check app status**:
   ```bash
   heroku ps
   ```

2. **View logs**:
   ```bash
   heroku logs --tail
   ```

3. **Test the API**:
   ```bash
   curl https://your-app.herokuapp.com/api/health
   ```

## Updating Your App

When you make changes to your code:

```bash
git add .
git commit -m "Your commit message"
git push heroku main
```

## Troubleshooting

### App Crashes on Startup

Check the logs:
```bash
heroku logs --tail
```

Common issues:
- Missing environment variables
- Build errors (check TypeScript compilation)
- Port configuration (app uses `process.env.PORT`)

### Build Fails

1. Ensure all dependencies are in `package.json`
2. Check that TypeScript compiles locally:
   ```bash
   npm run build
   ```

### API Not Working

1. Verify environment variables:
   ```bash
   heroku config
   ```

2. Check if backend is running:
   ```bash
   curl https://your-app.herokuapp.com/api/health
   ```

### Frontend Not Loading

1. Ensure frontend was built:
   ```bash
   heroku logs --tail | grep "build"
   ```

2. Check that frontend files exist in dist folder after build

## Scaling Your App

### Free Tier
- 550-1000 free dyno hours per month
- App sleeps after 30 minutes of inactivity
- Wakes up on first request (may take a few seconds)

### Upgrade to Hobby ($7/month)
```bash
heroku ps:scale web=1:hobby
```

Benefits:
- No sleeping
- SSL included
- Better performance

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | Set to `production` |
| `PORT` | Auto | Set automatically by Heroku |
| `OPENWEATHER_API_KEY` | Yes | OpenWeather API key for weather data |
| `GOOGLE_MAPS_API_KEY` | Optional | Google Maps API for restaurants |
| `OPENAI_API_KEY` | Optional | OpenAI API for AI recommendations |
| `CORS_ORIGIN` | Optional | CORS origin (defaults to `*`) |

## Adding a Custom Domain

1. Add domain to Heroku:
   ```bash
   heroku domains:add www.yourdomain.com
   ```

2. Configure DNS with your domain registrar
3. Enable SSL (automatic on Heroku)

## Monitoring

### View Real-time Logs
```bash
heroku logs --tail
```

### Add Monitoring
- **Heroku Metrics**: Built-in dashboard
- **Sentry**: Error tracking
- **LogDNA**: Advanced log management

```bash
heroku addons:create logdna:quaco
```

## Database (Optional)

If you need to add a database:

### PostgreSQL
```bash
heroku addons:create heroku-postgresql:mini
```

### Redis
```bash
heroku addons:create heroku-redis:mini
```

## CI/CD with GitHub

1. Go to your Heroku dashboard
2. Select your app
3. Go to "Deploy" tab
4. Connect to GitHub
5. Enable "Automatic Deploys" from main branch

## Need Help?

- [Heroku Dev Center](https://devcenter.heroku.com/)
- [Heroku Support](https://help.heroku.com/)
- Check DEPLOY.md for other deployment options
- See README.md for app documentation

---

## Quick Reference

```bash
# Login
heroku login

# Create app
heroku create findmefood-app

# Set env vars
heroku config:set NODE_ENV=production
heroku config:set OPENWEATHER_API_KEY=your_key

# Deploy
git push heroku main

# Open app
heroku open

# View logs
heroku logs --tail

# Restart app
heroku restart

# Run bash
heroku run bash
```
