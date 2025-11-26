# 🚀 Deploy FindMeFood to Heroku - Step by Step

Your app is now **fully configured** for Heroku deployment! All the necessary files have been created and committed. Follow these steps on your local machine to deploy.

## ✅ What's Already Done

- ✅ Procfile created
- ✅ Backend configured to serve frontend
- ✅ Build scripts configured
- ✅ CORS settings updated
- ✅ API client configured for production
- ✅ All changes committed to `claude/deploy-to-heroku-01G8vjizyQa1ga6BrXNwjzBF`

## 📋 Deployment Steps (Run on Your Local Machine)

### Step 1: Install Heroku CLI

**macOS:**
```bash
brew tap heroku/brew && brew install heroku
```

**Ubuntu/Debian:**
```bash
curl https://cli-assets.heroku.com/install-ubuntu.sh | sh
```

**Windows:**
Download installer from: https://devcenter.heroku.com/articles/heroku-cli

### Step 2: Login to Heroku

```bash
heroku login
```

This will open your browser for authentication.

### Step 3: Navigate to Your Project

```bash
cd /path/to/findmefood
git checkout claude/deploy-to-heroku-01G8vjizyQa1ga6BrXNwjzBF
```

### Step 4: Create Heroku App

```bash
# Create with a custom name
heroku create findmefood-yourname

# OR let Heroku generate a random name
heroku create
```

Save the app URL that Heroku provides (e.g., `https://findmefood-yourname.herokuapp.com`)

### Step 5: Set Environment Variables

**Required:**
```bash
heroku config:set NODE_ENV=production
heroku config:set OPENWEATHER_API_KEY=your_key_here
```

**Optional (if you have these):**
```bash
heroku config:set GOOGLE_MAPS_API_KEY=your_key_here
heroku config:set OPENAI_API_KEY=your_key_here
```

**Get API Keys:**
- OpenWeather: https://openweathermap.org/api (Free tier available)
- Google Maps: https://console.cloud.google.com/ (Optional)
- OpenAI: https://platform.openai.com/ (Optional)

### Step 6: Deploy to Heroku

```bash
# Deploy from your current branch
git push heroku claude/deploy-to-heroku-01G8vjizyQa1ga6BrXNwjzBF:main
```

**What happens during deployment:**
1. Heroku receives your code
2. Detects Node.js project
3. Installs dependencies
4. Runs `heroku-postbuild` script:
   - Builds backend (TypeScript → JavaScript)
   - Builds frontend (React → static files)
5. Starts app with `npm start`

### Step 7: Open Your App

```bash
heroku open
```

Or visit the URL from Step 4.

## 🔍 Verify Deployment

### Check if app is running:
```bash
heroku ps
```

Should show: `web.1: up`

### View logs:
```bash
heroku logs --tail
```

### Test the API:
```bash
curl https://your-app-name.herokuapp.com/api/health
```

Should return: `{"status":"ok","timestamp":"..."}`

## 🐛 Troubleshooting

### Issue: App crashes on startup

**Check logs:**
```bash
heroku logs --tail
```

**Common fixes:**
- Verify all environment variables are set: `heroku config`
- Ensure OPENWEATHER_API_KEY is set
- Check for build errors in logs

### Issue: "Application Error" page

**Restart the app:**
```bash
heroku restart
```

**Check dyno status:**
```bash
heroku ps
```

### Issue: Frontend loads but API doesn't work

**Verify environment variables:**
```bash
heroku config
```

**Test API endpoint:**
```bash
curl https://your-app.herokuapp.com/api/health
```

### Issue: Build fails

**Local test first:**
```bash
npm run build
```

If it fails locally, fix the errors before deploying.

## 📊 Monitor Your App

### View real-time logs:
```bash
heroku logs --tail
```

### Check app metrics:
```bash
heroku ps
```

### Access Heroku Dashboard:
https://dashboard.heroku.com/apps/your-app-name

## 💰 Heroku Free Tier

- **550-1000 free dyno hours/month**
- App sleeps after 30 min of inactivity
- Wakes up on first request (~5-10 seconds)
- No credit card required

### Upgrade to Hobby ($7/month):
```bash
heroku ps:scale web=1:hobby
```

Benefits:
- No sleeping
- Better performance
- SSL included

## 🔄 Updating Your App

After making changes:

```bash
git add .
git commit -m "Your changes"
git push heroku claude/deploy-to-heroku-01G8vjizyQa1ga6BrXNwjzBF:main
```

## 🌐 Add Custom Domain (Optional)

```bash
heroku domains:add www.yourdomain.com
```

Then update your DNS records with your domain registrar.

## 📱 One-Click Deploy Alternative

If you prefer not to use the CLI, you can also:

1. Fork this repo to your GitHub account
2. Go to https://dashboard.heroku.com/new
3. Connect your GitHub repository
4. Add environment variables in Heroku dashboard
5. Click "Deploy Branch"

## 🆘 Need Help?

- Heroku Dev Center: https://devcenter.heroku.com/
- Heroku Support: https://help.heroku.com/
- See HEROKU_DEPLOY.md for detailed guide
- Check logs: `heroku logs --tail`

## ✅ Quick Command Reference

```bash
# Login
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set OPENWEATHER_API_KEY=your_key

# Deploy
git push heroku claude/deploy-to-heroku-01G8vjizyQa1ga6BrXNwjzBF:main

# Open app
heroku open

# View logs
heroku logs --tail

# Restart app
heroku restart

# Check status
heroku ps

# View config
heroku config

# Run bash on Heroku
heroku run bash
```

---

**Your app is ready to deploy!** Just follow the steps above on your local machine. 🎉
