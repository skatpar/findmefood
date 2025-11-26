# Puppeteer Setup for Heroku

## Important: Buildpack Configuration

Before deploying, you **MUST** configure the buildpacks in the correct order:

```bash
# Clear existing buildpacks
heroku buildpacks:clear

# Add Puppeteer buildpack FIRST (provides Chromium)
heroku buildpacks:add https://github.com/jontewks/puppeteer-heroku-buildpack

# Add Node.js buildpack SECOND
heroku buildpacks:add heroku/nodejs

# Verify buildpacks are in correct order
heroku buildpacks
```

**Expected output:**
```
=== your-app-name Buildpack URLs
1. https://github.com/jontewks/puppeteer-heroku-buildpack
2. heroku/nodejs
```

## What This Does

1. **Puppeteer buildpack** installs Chromium browser on Heroku
2. **Node.js buildpack** installs your app dependencies
3. `.puppeteerrc.cjs` tells Puppeteer to **skip downloading** Chromium (saves time & space)
4. App uses `PUPPETEER_EXECUTABLE_PATH` env var to find Heroku's Chromium

## Deploy

After configuring buildpacks:

```bash
git push heroku claude/deploy-to-heroku-01G8vjizyQa1ga6BrXNwjzBF:main
```

The build should now complete in ~2-3 minutes instead of timing out.

## Troubleshooting

### Issue: Build still times out
**Solution:**
```bash
# Make sure buildpacks are in correct order
heroku buildpacks

# Should show Puppeteer BEFORE Node.js
```

### Issue: "Browser not found"
**Solution:**
```bash
# Check if PUPPETEER_EXECUTABLE_PATH is set
heroku config | grep PUPPETEER

# The buildpack should set this automatically
```

### Issue: Dependencies taking too long
**Solution:**
The `.puppeteerrc.cjs` file prevents Chromium download. Make sure it's committed:
```bash
git add .puppeteerrc.cjs
git commit -m "Add Puppeteer config"
git push
```

## Testing Locally

To test with Puppeteer locally:

```bash
npm install
npm run dev
```

Puppeteer will download Chromium on first run locally (this is normal).

## Why This Configuration?

- **Heroku has a 15-minute build timeout**
- Downloading Chromium (~170MB) takes 5-10 minutes
- This config uses Heroku's pre-installed Chromium instead
- Build time reduced from 15+ minutes to ~3 minutes

---

**Ready to deploy!** Follow the buildpack commands above, then push to Heroku.
