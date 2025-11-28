/**
 * Puppeteer configuration for Heroku deployment
 * Skip downloading Chromium - use buildpack's version instead
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  skipDownload: true,
};
