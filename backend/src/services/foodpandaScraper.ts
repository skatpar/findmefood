import puppeteer, { Browser, Page } from 'puppeteer';
import * as cheerio from 'cheerio';
import { OrderHistoryItem } from '../types';

export interface FoodpandaRestaurant {
  name: string;
  url: string;
  cuisine: string[];
  rating?: number;
  deliveryTime?: string;
  minimumOrder?: string;
  deliveryFee?: string;
  image?: string;
}

export interface FoodpandaMenuItem {
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: string;
}

export class FoodpandaScraper {
  private browser: Browser | null = null;

  async initBrowser(): Promise<void> {
    if (!this.browser) {
      const launchOptions: any = {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
      };

      // Use Heroku buildpack's Chromium if available
      if (process.env.PUPPETEER_EXECUTABLE_PATH) {
        launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
      }

      this.browser = await puppeteer.launch(launchOptions);
    }
  }

  async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Scrape order history from Foodpanda
   * Note: This requires authentication cookies from the user
   */
  async scrapeOrderHistory(cookies?: string): Promise<OrderHistoryItem[]> {
    await this.initBrowser();
    if (!this.browser) throw new Error('Failed to initialize browser');

    const page = await this.browser.newPage();

    try {
      // Set cookies if provided
      if (cookies) {
        const cookieArray = this.parseCookies(cookies);
        await page.setCookie(...cookieArray);
      }

      // Navigate to orders page
      await page.goto('https://www.foodpanda.pk/new/orders', {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      // Wait for orders to load
      await page.waitForSelector('[data-testid="order-card"], .order-item, .order-card', {
        timeout: 10000,
      }).catch(() => {
        console.log('No orders found or page structure changed');
      });

      // Extract order data
      const orders = await page.evaluate(() => {
        const orderElements = document.querySelectorAll('[data-testid="order-card"], .order-item, .order-card');
        const extractedOrders: any[] = [];

        orderElements.forEach((orderEl) => {
          try {
            const restaurantName = orderEl.querySelector('.restaurant-name, [data-testid="restaurant-name"]')?.textContent?.trim() || 'Unknown';
            const dateStr = orderEl.querySelector('.order-date, [data-testid="order-date"]')?.textContent?.trim() || '';
            const totalStr = orderEl.querySelector('.order-total, [data-testid="order-total"]')?.textContent?.trim() || '0';

            // Extract items
            const itemElements = orderEl.querySelectorAll('.order-item-name, [data-testid="item-name"]');
            const items: string[] = [];
            itemElements.forEach((item) => {
              const itemName = item.textContent?.trim();
              if (itemName) items.push(itemName);
            });

            // Parse price (remove currency symbols and convert to number)
            const total = parseFloat(totalStr.replace(/[^0-9.]/g, '')) || 0;

            extractedOrders.push({
              restaurantName,
              date: dateStr,
              items,
              total,
            });
          } catch (err) {
            console.error('Error parsing order:', err);
          }
        });

        return extractedOrders;
      });

      // Transform to OrderHistoryItem format
      const orderHistory: OrderHistoryItem[] = orders.map((order, index) => ({
        restaurantName: order.restaurantName,
        cuisine: this.inferCuisine(order.restaurantName, order.items),
        items: order.items.map((item: string) => ({ name: item, price: 0 })),
        total: order.total,
        date: this.parseDate(order.date),
        timeOfDay: this.inferTimeOfDay(order.date),
        dayOfWeek: this.parseDayOfWeek(order.date),
      }));

      return orderHistory;
    } catch (error: any) {
      console.error('Error scraping order history:', error);
      throw new Error(`Failed to scrape order history: ${error.message}`);
    } finally {
      await page.close();
    }
  }

  /**
   * Scrape restaurants from Foodpanda
   */
  async scrapeRestaurants(latitude: number, longitude: number): Promise<FoodpandaRestaurant[]> {
    await this.initBrowser();
    if (!this.browser) throw new Error('Failed to initialize browser');

    const page = await this.browser.newPage();

    try {
      const url = `https://www.foodpanda.pk/restaurants/new?lng=${longitude}&lat=${latitude}&vertical=restaurants`;

      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      // Wait for restaurant cards to load
      await page.waitForSelector('[data-testid="restaurant-card"], .restaurant-card, .vendor-tile', {
        timeout: 10000,
      }).catch(() => {
        console.log('No restaurants found or page structure changed');
      });

      // Scroll to load more restaurants
      await this.autoScroll(page);

      // Extract restaurant data
      const restaurants = await page.evaluate(() => {
        const restaurantElements = document.querySelectorAll('[data-testid="restaurant-card"], .restaurant-card, .vendor-tile');
        const extractedRestaurants: any[] = [];

        restaurantElements.forEach((restaurantEl) => {
          try {
            const name = restaurantEl.querySelector('.restaurant-name, [data-testid="restaurant-name"], h3, h4')?.textContent?.trim() || 'Unknown';
            const urlLink = restaurantEl.querySelector('a')?.getAttribute('href') || '';
            const cuisineStr = restaurantEl.querySelector('.cuisine, [data-testid="cuisine-list"]')?.textContent?.trim() || '';
            const ratingStr = restaurantEl.querySelector('.rating, [data-testid="rating"]')?.textContent?.trim() || '';
            const deliveryTime = restaurantEl.querySelector('.delivery-time, [data-testid="delivery-time"]')?.textContent?.trim() || '';
            const minimumOrder = restaurantEl.querySelector('.minimum-order, [data-testid="minimum-order"]')?.textContent?.trim() || '';
            const deliveryFee = restaurantEl.querySelector('.delivery-fee, [data-testid="delivery-fee"]')?.textContent?.trim() || '';
            const image = restaurantEl.querySelector('img')?.getAttribute('src') || '';

            const cuisine = cuisineStr.split(',').map(c => c.trim()).filter(c => c);
            const rating = parseFloat(ratingStr) || undefined;

            extractedRestaurants.push({
              name,
              url: urlLink.startsWith('http') ? urlLink : `https://www.foodpanda.pk${urlLink}`,
              cuisine,
              rating,
              deliveryTime,
              minimumOrder,
              deliveryFee,
              image,
            });
          } catch (err) {
            console.error('Error parsing restaurant:', err);
          }
        });

        return extractedRestaurants;
      });

      return restaurants;
    } catch (error: any) {
      console.error('Error scraping restaurants:', error);
      throw new Error(`Failed to scrape restaurants: ${error.message}`);
    } finally {
      await page.close();
    }
  }

  /**
   * Scrape menu from a specific restaurant
   */
  async scrapeRestaurantMenu(restaurantUrl: string): Promise<FoodpandaMenuItem[]> {
    await this.initBrowser();
    if (!this.browser) throw new Error('Failed to initialize browser');

    const page = await this.browser.newPage();

    try {
      await page.goto(restaurantUrl, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      // Wait for menu items to load
      await page.waitForSelector('[data-testid="menu-item"], .menu-item, .dish-card', {
        timeout: 10000,
      }).catch(() => {
        console.log('No menu items found or page structure changed');
      });

      // Extract menu data
      const menuItems = await page.evaluate(() => {
        const itemElements = document.querySelectorAll('[data-testid="menu-item"], .menu-item, .dish-card');
        const extractedItems: any[] = [];

        itemElements.forEach((itemEl) => {
          try {
            const name = itemEl.querySelector('.item-name, [data-testid="item-name"], h3, h4')?.textContent?.trim() || 'Unknown';
            const description = itemEl.querySelector('.item-description, [data-testid="item-description"], p')?.textContent?.trim() || '';
            const priceStr = itemEl.querySelector('.item-price, [data-testid="item-price"], .price')?.textContent?.trim() || '0';
            const category = itemEl.closest('[data-testid="menu-category"], .menu-category')?.querySelector('h2, h3')?.textContent?.trim() || 'Other';
            const image = itemEl.querySelector('img')?.getAttribute('src') || '';

            // Parse price (remove currency symbols and convert to number)
            const price = parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;

            extractedItems.push({
              name,
              description,
              price,
              category,
              image,
            });
          } catch (err) {
            console.error('Error parsing menu item:', err);
          }
        });

        return extractedItems;
      });

      return menuItems;
    } catch (error: any) {
      console.error('Error scraping menu:', error);
      throw new Error(`Failed to scrape menu: ${error.message}`);
    } finally {
      await page.close();
    }
  }

  // Helper methods

  private parseCookies(cookieString: string): any[] {
    return cookieString.split(';').map(cookie => {
      const [name, value] = cookie.trim().split('=');
      return {
        name: name.trim(),
        value: value?.trim() || '',
        domain: '.foodpanda.pk',
      };
    });
  }

  private async autoScroll(page: Page): Promise<void> {
    await page.evaluate(async () => {
      await new Promise<void>((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= scrollHeight || totalHeight > 3000) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });
  }

  private inferCuisine(restaurantName: string, items: string[]): string {
    const cuisineKeywords: { [key: string]: string[] } = {
      'Pakistani': ['biryani', 'karahi', 'nihari', 'haleem', 'pulao', 'kebab'],
      'Chinese': ['fried rice', 'noodles', 'chowmein', 'manchurian'],
      'Italian': ['pizza', 'pasta', 'lasagna'],
      'Fast Food': ['burger', 'fries', 'sandwich', 'nuggets'],
      'Dessert': ['cake', 'ice cream', 'brownie', 'cookie'],
    };

    const restaurantLower = restaurantName.toLowerCase();
    const itemsLower = items.join(' ').toLowerCase();

    for (const [cuisine, keywords] of Object.entries(cuisineKeywords)) {
      for (const keyword of keywords) {
        if (restaurantLower.includes(keyword) || itemsLower.includes(keyword)) {
          return cuisine;
        }
      }
    }

    return 'Other';
  }

  private parseDate(dateStr: string): string {
    // Try to parse the date string
    // Foodpanda might use different formats
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    } catch (err) {
      // Fallback to current date
    }
    return new Date().toISOString();
  }

  private inferTimeOfDay(dateStr: string): string {
    try {
      const date = new Date(dateStr);
      const hours = date.getHours();

      if (hours >= 5 && hours < 12) return 'morning';
      if (hours >= 12 && hours < 17) return 'afternoon';
      if (hours >= 17 && hours < 21) return 'evening';
      return 'night';
    } catch (err) {
      return 'unknown';
    }
  }

  private parseDayOfWeek(dateStr: string): string {
    try {
      const date = new Date(dateStr);
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return days[date.getDay()];
    } catch (err) {
      return 'Unknown';
    }
  }
}
