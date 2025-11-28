# Updated Heroku Deployment Instructions

## The Issue
Puppeteer couldn't find Chrome because the buildpack configuration needs to be updated.

## Solution: Use Puppeteer 2.0 Buildpack

The old buildpack is outdated. Use this newer one instead:

### 1. Clear and Add Correct Buildpacks

```bash
# Clear existing buildpacks
heroku buildpacks:clear

# Add the CORRECT Puppeteer buildpack for Heroku-22+
heroku buildpacks:add https://github.com/CoffeeAndCode/puppeteer-heroku-buildpack

# Add Node.js buildpack
heroku buildpacks:add heroku/nodejs

# Verify order
heroku buildpacks
```

**Expected output:**
```
1. https://github.com/CoffeeAndCode/puppeteer-heroku-buildpack
2. heroku/nodejs
```

### 2. Set Config Vars (Important!)

```bash
# Tell Puppeteer where to find Chrome
heroku config:set PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
heroku config:set PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
```

### 3. Deploy

```bash
git pull origin claude/deploy-to-heroku-01G8vjizyQa1ga6BrXNwjzBF
git push heroku claude/deploy-to-heroku-01G8vjizyQa1ga6BrXNwjzBF:main
```

## Alternative: Use puppeteer-core Instead

If the buildpack still doesn't work, we can switch to using Chrome for Testing:

```bash
# This buildpack installs Chrome for Testing
heroku buildpacks:clear
heroku buildpacks:add https://github.com/heroku/heroku-buildpack-google-chrome
heroku buildpacks:add heroku/nodejs

# Set the Chrome path
heroku config:set PUPPETEER_EXECUTABLE_PATH=/app/.chrome-for-testing/chrome-linux64/chrome
```

## Check After Deploy

```bash
# View logs
heroku logs --tail

# Check if Chrome is found
heroku run "ls -la /usr/bin/google-chrome-stable"

# Or check Chrome for Testing
heroku run "ls -la /app/.chrome-for-testing/"
```

## If Still Failing

Make the scraper optional:

```bash
# Set this to disable scraper if it keeps failing
heroku config:set DISABLE_SCRAPER=true
```

Then we can make the scraper endpoints return a friendly error message instead of crashing.

---

Try the first solution (CoffeeAndCode buildpack) - it's the most reliable for Heroku-22 stack.
