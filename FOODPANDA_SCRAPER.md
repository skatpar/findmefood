# 🍕 Foodpanda Scraper Feature

The FindMeFood app now includes a web scraper that can automatically import your order history directly from Foodpanda Pakistan!

## ✨ Features

1. **Import Order History** - Scrape your past orders from Foodpanda
2. **Discover Restaurants** - Get restaurants near your location from Foodpanda
3. **View Menus** - Scrape restaurant menus with prices

## 🚀 How to Use

### Import Your Foodpanda Order History

1. **Open the app** and navigate to "Step 1: Upload Your Order History"
2. **Click "🍕 Scrape from Foodpanda"** button
3. **Get your cookies**:
   - Go to [Foodpanda Orders](https://www.foodpanda.pk/new/orders) and log in
   - Press `F12` to open Developer Tools
   - Go to **Application** tab → **Cookies** → **https://www.foodpanda.pk**
   - Copy the cookies (look for session cookies like `session_id`, `auth_token`, etc.)
   - Format: `name1=value1; name2=value2; name3=value3`
4. **Paste cookies** in the textarea
5. **Click "Import Orders from Foodpanda"**
6. Wait for the scraper to fetch your order history

Your orders will be automatically imported and analyzed for preferences!

## 📡 API Endpoints

### 1. Scrape Order History
```
POST /api/scrape/foodpanda/orders
```

**Request Body:**
```json
{
  "cookies": "session_id=abc123; auth_token=xyz789"
}
```

**Response:**
```json
{
  "success": true,
  "orderHistory": [...],
  "preferences": {...},
  "totalOrders": 10,
  "message": "Successfully scraped order history from Foodpanda"
}
```

### 2. Scrape Restaurants
```
POST /api/scrape/foodpanda/restaurants
```

**Request Body:**
```json
{
  "latitude": 33.700414159709915,
  "longitude": 73.03673451876075
}
```

**Response:**
```json
{
  "success": true,
  "restaurants": [
    {
      "name": "Restaurant Name",
      "url": "https://www.foodpanda.pk/restaurant/...",
      "cuisine": ["Pakistani", "Fast Food"],
      "rating": 4.5,
      "deliveryTime": "30-40 min",
      "minimumOrder": "Rs. 249",
      "deliveryFee": "Rs. 49",
      "image": "https://..."
    }
  ],
  "count": 50,
  "message": "Successfully scraped restaurants from Foodpanda"
}
```

### 3. Scrape Restaurant Menu
```
POST /api/scrape/foodpanda/menu
```

**Request Body:**
```json
{
  "restaurantUrl": "https://www.foodpanda.pk/restaurant/..."
}
```

**Response:**
```json
{
  "success": true,
  "menu": [
    {
      "name": "Chicken Biryani",
      "description": "Aromatic rice with tender chicken",
      "price": 450,
      "category": "Main Course",
      "image": "https://..."
    }
  ],
  "count": 25,
  "message": "Successfully scraped menu from Foodpanda restaurant"
}
```

## 🔧 Technical Details

### Technologies Used
- **Puppeteer**: Headless browser automation for scraping JavaScript-rendered pages
- **Cheerio**: HTML parsing and manipulation
- **Express**: API endpoints

### How It Works

1. **Browser Automation**: Puppeteer launches a headless Chrome browser
2. **Cookie Authentication**: User's cookies are set to access authenticated pages
3. **Page Scraping**: The scraper navigates to Foodpanda pages and extracts data
4. **Data Parsing**: HTML is parsed to extract order details, restaurant info, and menu items
5. **Data Transformation**: Raw data is transformed into the app's format

### Heroku Configuration

The scraper works on Heroku with these buildpacks:
```bash
heroku buildpacks:add jontewks/puppeteer
heroku buildpacks:add heroku/nodejs
```

Or configure in your `package.json`:
```json
{
  "puppeteer": {
    "args": [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu"
    ]
  }
}
```

## 🔒 Privacy & Security

### Your Data is Safe
- ✅ Cookies are **never stored** - used only for the scraping session
- ✅ Scraping happens **on your server** - not sent to third parties
- ✅ Browser closes after each scrape - no persistent sessions
- ✅ Data stays in your app - full control over your information

### Cookie Security
- Use cookies only for scraping your own data
- Don't share your cookies with others
- Cookies expire automatically after some time
- The app doesn't log or store cookies

## ⚠️ Important Notes

### Legal Considerations
- This scraper is for **personal use only**
- Use it to access **your own data** from Foodpanda
- Respect Foodpanda's Terms of Service
- Don't abuse or overwhelm Foodpanda's servers
- Consider using official APIs when available

### Limitations
- Requires valid authentication cookies
- Page structure changes may break the scraper
- Scraping may be slower than file upload
- Rate limiting may apply

### When It Might Fail
- Invalid or expired cookies
- Foodpanda changed their page structure
- Network timeouts
- Browser memory issues on limited servers

## 🐛 Troubleshooting

### Issue: "Failed to scrape order history"
**Solutions:**
- Verify you're logged into Foodpanda
- Check cookies are copied correctly (format: `name=value; name=value`)
- Try getting fresh cookies (logout and login again)
- Check if Foodpanda is accessible from your server

### Issue: "Browser failed to launch"
**Solutions:**
- On Heroku: Add puppeteer buildpack
  ```bash
  heroku buildpacks:add jontewks/puppeteer
  ```
- Ensure sufficient memory allocation
- Check Heroku logs: `heroku logs --tail`

### Issue: "No orders found"
**Solutions:**
- Make sure you have orders in your Foodpanda account
- Try manually visiting the orders page to verify
- Check if page structure changed (may need scraper updates)

## 📝 Example: Complete Flow

```javascript
// Frontend usage
import { scrapeFoodpandaOrders } from './api';

// Get cookies from browser
const cookies = "session_id=abc123; auth_token=xyz789";

// Scrape orders
const result = await scrapeFoodpandaOrders(cookies);

console.log(`Imported ${result.totalOrders} orders`);
console.log('Preferences:', result.preferences);
```

## 🚀 Future Enhancements

Planned features:
- [ ] Support for more food delivery platforms (Careem, Bykea Food)
- [ ] Automatic cookie refresh
- [ ] Browser extension for easier cookie extraction
- [ ] Scheduled automatic imports
- [ ] Export scraped data to CSV/JSON
- [ ] Compare prices across platforms

## 🤝 Contributing

Found a bug or want to improve the scraper?
1. Check if Foodpanda's page structure changed
2. Update selectors in `foodpandaScraper.ts`
3. Test locally before deploying
4. Submit a PR with your improvements

## 📞 Support

Having issues?
1. Check browser console for errors (F12)
2. View server logs: `heroku logs --tail`
3. Verify cookies are valid
4. Read the troubleshooting section above
5. Open an issue on GitHub

---

**Happy Scraping! 🎉**

*Note: This feature is experimental and may require updates as Foodpanda changes their website structure.*
