const {join} = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Skip downloading Chromium on install
  // Use Heroku buildpack's Chromium instead
  skipDownload: true,
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
