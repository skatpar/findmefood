import { format, getHours, getDay } from 'date-fns';
import {
  Recommendation,
  RecommendationContext,
  Restaurant,
  MenuItem,
  OrderHistoryItem
} from '../types';
import { WeatherService } from './weatherService';
import { OrderHistoryParser } from './orderHistoryParser';

export class RecommendationEngine {
  private weatherService: WeatherService;
  private orderParser: OrderHistoryParser;

  constructor(weatherService: WeatherService) {
    this.weatherService = weatherService;
    this.orderParser = new OrderHistoryParser();
  }

  /**
   * Generate personalized food recommendations
   */
  async generateRecommendations(
    context: RecommendationContext,
    restaurants: Restaurant[],
    limit: number = 10
  ): Promise<Recommendation[]> {
    const preferences = this.orderParser.analyzePreferences(context.orderHistory);
    const weatherPrefs = this.weatherService.getWeatherPreferences(context.weather);

    const recommendations: Recommendation[] = [];

    // Score each menu item from each restaurant
    for (const restaurant of restaurants) {
      for (const menuItem of restaurant.menu) {
        const score = this.calculateScore(
          restaurant,
          menuItem,
          context,
          preferences,
          weatherPrefs
        );

        const reasons = this.generateReasons(
          restaurant,
          menuItem,
          context,
          preferences,
          weatherPrefs
        );

        recommendations.push({
          restaurant,
          menuItem,
          score,
          reasons
        });
      }
    }

    // Sort by score and return top N
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Calculate recommendation score for a menu item
   */
  private calculateScore(
    restaurant: Restaurant,
    menuItem: MenuItem,
    context: RecommendationContext,
    preferences: any,
    weatherPrefs: string[]
  ): number {
    let score = 50; // Base score

    // Restaurant rating (0-25 points)
    score += restaurant.rating * 5;

    // Distance factor (closer is better, 0-15 points)
    if (restaurant.distance < 1) score += 15;
    else if (restaurant.distance < 2) score += 10;
    else if (restaurant.distance < 3) score += 5;

    // Cuisine preference (0-20 points)
    if (preferences.favoriteCuisines.includes(menuItem.cuisine)) {
      const index = preferences.favoriteCuisines.indexOf(menuItem.cuisine);
      score += 20 - (index * 5); // First choice gets 20, second 15, third 10
    }

    // Restaurant preference (0-15 points)
    if (preferences.favoriteRestaurants.includes(restaurant.name)) {
      const index = preferences.favoriteRestaurants.indexOf(restaurant.name);
      score += 15 - (index * 3);
    }

    // Similar items from history (0-15 points)
    const similarityScore = this.calculateSimilarity(
      menuItem.name,
      preferences.commonItems
    );
    score += similarityScore * 15;

    // Time of day matching (0-10 points)
    const timeScore = this.getTimeScore(menuItem, context.timeOfDay);
    score += timeScore;

    // Weather matching (0-10 points)
    const weatherScore = this.getWeatherScore(menuItem, context.weather, weatherPrefs);
    score += weatherScore;

    // Day of week patterns (0-5 points)
    const dayScore = this.getDayScore(context.dayOfWeek, context.orderHistory);
    score += dayScore;

    // Delivery time (0-5 points)
    if (restaurant.deliveryTime && restaurant.deliveryTime < 30) {
      score += 5;
    } else if (restaurant.deliveryTime && restaurant.deliveryTime < 45) {
      score += 2;
    }

    return Math.round(score);
  }

  /**
   * Calculate similarity between item and user's past orders
   */
  private calculateSimilarity(itemName: string, commonItems: string[]): number {
    const itemLower = itemName.toLowerCase();
    const words = itemLower.split(' ');

    let matchScore = 0;
    for (const commonItem of commonItems) {
      const commonLower = commonItem.toLowerCase();

      // Exact match
      if (itemLower === commonLower) {
        matchScore = 1;
        break;
      }

      // Partial match
      if (itemLower.includes(commonLower) || commonLower.includes(itemLower)) {
        matchScore = Math.max(matchScore, 0.7);
      }

      // Word overlap
      const commonWords = commonLower.split(' ');
      const overlap = words.filter(w => commonWords.includes(w)).length;
      if (overlap > 0) {
        matchScore = Math.max(matchScore, overlap / Math.max(words.length, commonWords.length));
      }
    }

    return matchScore;
  }

  /**
   * Score based on time of day
   */
  private getTimeScore(menuItem: MenuItem, timeOfDay: string): number {
    const category = menuItem.category.toLowerCase();
    const name = menuItem.name.toLowerCase();

    const timeMapping: Record<string, string[]> = {
      breakfast: ['breakfast', 'pancake', 'omelette', 'toast', 'coffee', 'smoothie'],
      lunch: ['sandwich', 'salad', 'bowl', 'wrap', 'burger'],
      afternoon: ['snack', 'coffee', 'cake', 'pastry'],
      dinner: ['pizza', 'pasta', 'curry', 'steak', 'sushi', 'ramen'],
      'late-night': ['burger', 'pizza', 'fries', 'wings', 'noodles']
    };

    const keywords = timeMapping[timeOfDay] || [];
    for (const keyword of keywords) {
      if (category.includes(keyword) || name.includes(keyword)) {
        return 10;
      }
    }

    return 0;
  }

  /**
   * Score based on weather conditions
   */
  private getWeatherScore(
    menuItem: MenuItem,
    weather: any,
    weatherPrefs: string[]
  ): number {
    const name = menuItem.name.toLowerCase();
    const description = menuItem.description.toLowerCase();
    const text = `${name} ${description}`;

    let score = 0;

    for (const pref of weatherPrefs) {
      if (text.includes(pref.toLowerCase())) {
        score += 3;
      }
    }

    // Cold weather preferences
    if (weather.temperature < 15) {
      if (menuItem.category.toLowerCase().includes('soup') ||
          text.includes('hot') ||
          text.includes('warm')) {
        score += 5;
      }
    }

    // Hot weather preferences
    if (weather.temperature > 30) {
      if (menuItem.category.toLowerCase().includes('salad') ||
          text.includes('cold') ||
          text.includes('refreshing') ||
          text.includes('smoothie')) {
        score += 5;
      }
    }

    return Math.min(score, 10);
  }

  /**
   * Score based on day of week patterns
   */
  private getDayScore(dayOfWeek: string, orderHistory: OrderHistoryItem[]): number {
    // Analyze if user tends to order certain cuisines on certain days
    // For now, return a small boost on weekends for comfort food
    if (dayOfWeek === 'Saturday' || dayOfWeek === 'Sunday') {
      return 3;
    }
    return 2;
  }

  /**
   * Generate human-readable reasons for recommendation
   */
  private generateReasons(
    restaurant: Restaurant,
    menuItem: MenuItem,
    context: RecommendationContext,
    preferences: any,
    weatherPrefs: string[]
  ): string[] {
    const reasons: string[] = [];

    // Distance
    if (restaurant.distance < 1) {
      reasons.push(`Very close (${restaurant.distance.toFixed(1)}km away)`);
    }

    // Rating
    if (restaurant.rating >= 4.5) {
      reasons.push(`Highly rated (${restaurant.rating}⭐)`);
    }

    // Favorite cuisine
    if (preferences.favoriteCuisines.includes(menuItem.cuisine)) {
      reasons.push(`You love ${menuItem.cuisine} food`);
    }

    // Favorite restaurant
    if (preferences.favoriteRestaurants.includes(restaurant.name)) {
      reasons.push('One of your favorite restaurants');
    }

    // Similar to past orders
    const similarity = this.calculateSimilarity(menuItem.name, preferences.commonItems);
    if (similarity > 0.5) {
      reasons.push('Similar to your previous orders');
    }

    // Weather-appropriate
    if (context.weather.temperature < 15) {
      if (menuItem.category.toLowerCase().includes('soup') ||
          menuItem.name.toLowerCase().includes('hot')) {
        reasons.push('Perfect for cold weather');
      }
    } else if (context.weather.temperature > 30) {
      if (menuItem.category.toLowerCase().includes('salad') ||
          menuItem.name.toLowerCase().includes('cold')) {
        reasons.push('Refreshing for hot weather');
      }
    }

    // Time appropriate
    const hour = parseInt(context.timeOfDay.split(':')[0]);
    if (hour >= 18 && hour < 22) {
      if (['dinner', 'main course'].some(cat =>
          menuItem.category.toLowerCase().includes(cat))) {
        reasons.push('Perfect for dinner time');
      }
    }

    // Fast delivery
    if (restaurant.deliveryTime && restaurant.deliveryTime < 30) {
      reasons.push(`Quick delivery (~${restaurant.deliveryTime} mins)`);
    }

    // Dietary preferences
    if (menuItem.isVegetarian) {
      reasons.push('Vegetarian option');
    }

    return reasons.slice(0, 4); // Return top 4 reasons
  }
}
