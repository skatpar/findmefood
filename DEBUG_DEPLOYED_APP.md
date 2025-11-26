# 🔍 Debugging Your Deployed App

## Quick Diagnosis Steps

Run these commands on your Mac terminal to diagnose the issue:

### 1. Check Heroku Logs (Most Important!)
```bash
heroku logs --tail
```

This will show you real-time logs. Look for:
- ❌ API errors
- ❌ "OPENWEATHER_API_KEY: not configured"
- ❌ Failed API requests
- ❌ 500 errors

### 2. Verify Environment Variables
```bash
heroku config
```

**Required variables:**
- `NODE_ENV=production` ✓
- `OPENWEATHER_API_KEY=your_actual_key` ⚠️ **CRITICAL**

If `OPENWEATHER_API_KEY` is missing or shows "not configured" in logs:

```bash
heroku config:set OPENWEATHER_API_KEY=your_actual_api_key_here
```

Get your API key from: https://openweathermap.org/api

### 3. Test API Endpoints Directly

Replace `your-app-name` with your actual Heroku app name:

**Test health endpoint:**
```bash
curl https://your-app-name.herokuapp.com/api/health
```

Should return: `{"status":"ok","timestamp":"..."}`

**Test weather endpoint (requires API key):**
```bash
curl -X POST https://your-app-name.herokuapp.com/api/weather \
  -H "Content-Type: application/json" \
  -d '{"latitude": 37.7749, "longitude": -122.4194}'
```

If this fails, your API key is missing or invalid.

### 4. Check Browser Console

Open your deployed app in Chrome/Firefox:
1. Press `F12` to open Developer Tools
2. Go to "Console" tab
3. Click "Find Food"
4. Look for:
   - ❌ Network errors (404, 500)
   - ❌ CORS errors
   - ❌ Failed API requests

Go to "Network" tab:
1. Click "Find Food"
2. Check the `/api/recommendations` request
3. Look at the response - what error message do you see?

---

## Common Issues & Fixes

### Issue 1: "OPENWEATHER_API_KEY not configured"

**Fix:**
```bash
# Get free API key from https://openweathermap.org/api
heroku config:set OPENWEATHER_API_KEY=your_actual_key_here
```

Wait ~30 seconds for Heroku to restart, then try again.

### Issue 2: "Failed to get recommendations" or 500 Error

**Check logs:**
```bash
heroku logs --tail
```

Look for the specific error message.

**Common causes:**
- API key invalid/expired
- Weather API quota exceeded
- Network timeout

### Issue 3: CORS Error in Browser

**Fix:**
```bash
heroku config:set CORS_ORIGIN=*
heroku restart
```

### Issue 4: App Not Responding

**Restart the app:**
```bash
heroku restart
```

### Issue 5: "Order history required" Error

Make sure you:
1. Upload a CSV/JSON file with order history, OR
2. Click "Load Sample Data" first
3. Then click "Find Food"

---

## Step-by-Step Testing

1. **Upload Order History or Load Sample Data**
   - Click "Load Sample Data" button
   - Verify you see order history displayed

2. **Enable Location**
   - Click "Get My Location"
   - Allow location access in browser
   - Verify location is detected

3. **Get Recommendations**
   - Click "Find Food"
   - Open browser console (F12)
   - Check for errors

---

## Get More Info

**View all Heroku config:**
```bash
heroku config
```

**Restart app:**
```bash
heroku restart
```

**Open Heroku dashboard:**
```bash
heroku open
```

**Check app status:**
```bash
heroku ps
```

**Check build logs:**
```bash
heroku logs --source app --tail
```

---

## What to Share for Help

If still not working, share:
1. Output of `heroku logs --tail` (last 50 lines)
2. Output of `heroku config` (hide the API key values)
3. Browser console errors (F12 → Console tab)
4. Network request/response (F12 → Network tab → /api/recommendations)

---

## Quick Fix Checklist

- [ ] OPENWEATHER_API_KEY is set: `heroku config | grep OPENWEATHER`
- [ ] App is running: `heroku ps`
- [ ] Logs show no errors: `heroku logs --tail`
- [ ] API health check works: `curl https://your-app.herokuapp.com/api/health`
- [ ] Sample data is loaded in the app
- [ ] Location is enabled in the app
- [ ] Browser console shows no errors (F12)
