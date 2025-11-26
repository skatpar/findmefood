import { parse } from 'csv-parse/sync';
import { OrderHistoryItem } from '../types';

export class OrderHistoryParser {
  /**
   * Parse foodpanda order history from CSV format
   * Expected columns: Date, Time, Restaurant, Items, Total Amount
   */
  parseCSV(content: string): OrderHistoryItem[] {
    try {
      const records = parse(content, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });

      return records.map((record: any) => ({
        restaurant: record.Restaurant || record.restaurant || '',
        items: this.parseItems(record.Items || record.items || record.Dishes || ''),
        date: record.Date || record.date || '',
        time: record.Time || record.time || '',
        totalAmount: parseFloat(record['Total Amount'] || record.total || '0'),
        cuisine: this.detectCuisine(record.Items || record.items || '')
      }));
    } catch (error) {
      console.error('Error parsing CSV:', error);
      throw new Error('Failed to parse order history CSV');
    }
  }

  /**
   * Parse foodpanda order history from JSON format
   */
  parseJSON(content: string): OrderHistoryItem[] {
    try {
      const data = JSON.parse(content);

      if (Array.isArray(data)) {
        return data.map(order => ({
          restaurant: order.restaurant || order.vendor?.name || '',
          items: Array.isArray(order.items)
            ? order.items.map((item: any) => item.name || item.title || item)
            : this.parseItems(order.items || ''),
          date: order.date || order.created_at || order.order_date || '',
          time: order.time || order.created_at?.split('T')[1] || '',
          totalAmount: parseFloat(order.total || order.amount || '0'),
          cuisine: order.cuisine || this.detectCuisine(order.items)
        }));
      }

      return [];
    } catch (error) {
      console.error('Error parsing JSON:', error);
      throw new Error('Failed to parse order history JSON');
    }
  }

  private parseItems(itemsString: string): string[] {
    if (Array.isArray(itemsString)) {
      return itemsString;
    }

    // Split by common separators
    return itemsString
      .split(/[,;|]/)
      .map(item => item.trim())
      .filter(item => item.length > 0);
  }

  private detectCuisine(items: string | string[]): string {
    const itemList = Array.isArray(items) ? items.join(' ') : items;
    const itemsLower = itemList.toLowerCase();

    const cuisineKeywords: Record<string, string[]> = {
      'Italian': ['pizza', 'pasta', 'spaghetti', 'lasagna', 'ravioli'],
      'Chinese': ['noodles', 'fried rice', 'dumpling', 'wonton', 'chow mein'],
      'Indian': ['curry', 'biryani', 'naan', 'tandoori', 'masala', 'tikka'],
      'Japanese': ['sushi', 'ramen', 'tempura', 'teriyaki', 'bento'],
      'Mexican': ['taco', 'burrito', 'quesadilla', 'enchilada', 'nachos'],
      'Thai': ['pad thai', 'tom yum', 'green curry', 'massaman'],
      'American': ['burger', 'fries', 'wings', 'sandwich', 'steak'],
      'Fast Food': ['burger', 'fries', 'nuggets', 'cola']
    };

    for (const [cuisine, keywords] of Object.entries(cuisineKeywords)) {
      if (keywords.some(keyword => itemsLower.includes(keyword))) {
        return cuisine;
      }
    }

    return 'Mixed';
  }

  /**
   * Analyze order history to extract preferences
   */
  analyzePreferences(orderHistory: OrderHistoryItem[]): {
    favoriteCuisines: string[];
    favoriteRestaurants: string[];
    commonItems: string[];
    preferredTimes: string[];
  } {
    const cuisineCount = new Map<string, number>();
    const restaurantCount = new Map<string, number>();
    const itemCount = new Map<string, number>();
    const timeSlots = new Map<string, number>();

    orderHistory.forEach(order => {
      // Count cuisines
      if (order.cuisine) {
        cuisineCount.set(order.cuisine, (cuisineCount.get(order.cuisine) || 0) + 1);
      }

      // Count restaurants
      if (order.restaurant) {
        restaurantCount.set(order.restaurant, (restaurantCount.get(order.restaurant) || 0) + 1);
      }

      // Count items
      order.items.forEach(item => {
        itemCount.set(item, (itemCount.get(item) || 0) + 1);
      });

      // Analyze time patterns
      if (order.time) {
        const timeSlot = this.getTimeSlot(order.time);
        timeSlots.set(timeSlot, (timeSlots.get(timeSlot) || 0) + 1);
      }
    });

    return {
      favoriteCuisines: this.getTopN(cuisineCount, 3),
      favoriteRestaurants: this.getTopN(restaurantCount, 5),
      commonItems: this.getTopN(itemCount, 10),
      preferredTimes: this.getTopN(timeSlots, 2)
    };
  }

  private getTimeSlot(time: string): string {
    const hour = parseInt(time.split(':')[0]);

    if (hour >= 6 && hour < 11) return 'breakfast';
    if (hour >= 11 && hour < 15) return 'lunch';
    if (hour >= 15 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'dinner';
    return 'late-night';
  }

  private getTopN<T>(map: Map<T, number>, n: number): T[] {
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(entry => entry[0]);
  }
}
