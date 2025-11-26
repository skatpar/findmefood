import { Restaurant, MenuItem, Location } from '../types';

export class RestaurantService {
  private mockRestaurants: Restaurant[] = [];

  constructor() {
    this.initializeMockData();
  }

  /**
   * Find restaurants near a location
   */
  async findNearbyRestaurants(
    location: Location,
    radiusKm: number = 5
  ): Promise<Restaurant[]> {
    // Filter restaurants within radius
    return this.mockRestaurants
      .map(restaurant => ({
        ...restaurant,
        distance: this.calculateDistance(location, restaurant.location)
      }))
      .filter(restaurant => restaurant.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);
  }

  /**
   * Calculate distance between two locations (Haversine formula)
   */
  private calculateDistance(loc1: Location, loc2: Location): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(loc2.latitude - loc1.latitude);
    const dLon = this.toRad(loc2.longitude - loc1.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(loc1.latitude)) *
      Math.cos(this.toRad(loc2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Initialize mock restaurant data
   * In production, this would fetch from a real database or API
   */
  private initializeMockData(): void {
    this.mockRestaurants = [
      {
        id: '1',
        name: 'Pizza Paradise',
        cuisine: ['Italian', 'Pizza'],
        rating: 4.5,
        distance: 0,
        priceRange: '$$',
        location: { latitude: 0, longitude: 0 },
        isOpen: true,
        deliveryTime: 30,
        menu: [
          {
            id: 'p1',
            name: 'Margherita Pizza',
            description: 'Classic tomato and mozzarella',
            price: 12.99,
            category: 'Pizza',
            cuisine: 'Italian',
            isVegetarian: true
          },
          {
            id: 'p2',
            name: 'Pepperoni Pizza',
            description: 'Loaded with pepperoni',
            price: 14.99,
            category: 'Pizza',
            cuisine: 'Italian'
          },
          {
            id: 'p3',
            name: 'Pasta Carbonara',
            description: 'Creamy pasta with bacon',
            price: 11.99,
            category: 'Pasta',
            cuisine: 'Italian'
          }
        ]
      },
      {
        id: '2',
        name: 'Curry House',
        cuisine: ['Indian', 'Asian'],
        rating: 4.7,
        distance: 0,
        priceRange: '$$',
        location: { latitude: 0.01, longitude: 0.01 },
        isOpen: true,
        deliveryTime: 35,
        menu: [
          {
            id: 'c1',
            name: 'Chicken Tikka Masala',
            description: 'Tender chicken in creamy tomato sauce',
            price: 13.99,
            category: 'Main Course',
            cuisine: 'Indian',
            isSpicy: true
          },
          {
            id: 'c2',
            name: 'Vegetable Biryani',
            description: 'Fragrant rice with mixed vegetables',
            price: 10.99,
            category: 'Main Course',
            cuisine: 'Indian',
            isVegetarian: true
          },
          {
            id: 'c3',
            name: 'Palak Paneer',
            description: 'Spinach curry with cottage cheese',
            price: 11.99,
            category: 'Main Course',
            cuisine: 'Indian',
            isVegetarian: true
          }
        ]
      },
      {
        id: '3',
        name: 'Sushi Master',
        cuisine: ['Japanese', 'Sushi'],
        rating: 4.8,
        distance: 0,
        priceRange: '$$$',
        location: { latitude: 0.02, longitude: -0.01 },
        isOpen: true,
        deliveryTime: 40,
        menu: [
          {
            id: 's1',
            name: 'California Roll',
            description: 'Crab, avocado, cucumber',
            price: 8.99,
            category: 'Sushi',
            cuisine: 'Japanese'
          },
          {
            id: 's2',
            name: 'Salmon Sashimi',
            description: 'Fresh salmon slices',
            price: 15.99,
            category: 'Sashimi',
            cuisine: 'Japanese'
          },
          {
            id: 's3',
            name: 'Ramen Bowl',
            description: 'Rich broth with noodles and toppings',
            price: 12.99,
            category: 'Noodles',
            cuisine: 'Japanese'
          }
        ]
      },
      {
        id: '4',
        name: 'Burger Joint',
        cuisine: ['American', 'Fast Food'],
        rating: 4.3,
        distance: 0,
        priceRange: '$',
        location: { latitude: -0.01, longitude: 0.02 },
        isOpen: true,
        deliveryTime: 25,
        menu: [
          {
            id: 'b1',
            name: 'Classic Cheeseburger',
            description: 'Beef patty with cheese, lettuce, tomato',
            price: 9.99,
            category: 'Burgers',
            cuisine: 'American'
          },
          {
            id: 'b2',
            name: 'Chicken Wings',
            description: 'Crispy wings with choice of sauce',
            price: 8.99,
            category: 'Sides',
            cuisine: 'American'
          },
          {
            id: 'b3',
            name: 'Loaded Fries',
            description: 'Fries with cheese, bacon, and sour cream',
            price: 6.99,
            category: 'Sides',
            cuisine: 'American'
          }
        ]
      },
      {
        id: '5',
        name: 'Thai Spice',
        cuisine: ['Thai', 'Asian'],
        rating: 4.6,
        distance: 0,
        priceRange: '$$',
        location: { latitude: 0.015, longitude: 0.015 },
        isOpen: true,
        deliveryTime: 35,
        menu: [
          {
            id: 't1',
            name: 'Pad Thai',
            description: 'Stir-fried noodles with shrimp',
            price: 11.99,
            category: 'Noodles',
            cuisine: 'Thai'
          },
          {
            id: 't2',
            name: 'Green Curry',
            description: 'Spicy coconut curry with vegetables',
            price: 12.99,
            category: 'Curry',
            cuisine: 'Thai',
            isSpicy: true,
            isVegetarian: true
          },
          {
            id: 't3',
            name: 'Tom Yum Soup',
            description: 'Hot and sour soup with seafood',
            price: 9.99,
            category: 'Soup',
            cuisine: 'Thai',
            isSpicy: true
          }
        ]
      },
      {
        id: '6',
        name: 'Healthy Bowl',
        cuisine: ['Healthy', 'Salads'],
        rating: 4.4,
        distance: 0,
        priceRange: '$$',
        location: { latitude: -0.015, longitude: -0.015 },
        isOpen: true,
        deliveryTime: 20,
        menu: [
          {
            id: 'h1',
            name: 'Buddha Bowl',
            description: 'Quinoa, roasted vegetables, tahini',
            price: 10.99,
            category: 'Bowls',
            cuisine: 'Healthy',
            isVegetarian: true
          },
          {
            id: 'h2',
            name: 'Grilled Chicken Salad',
            description: 'Mixed greens with grilled chicken',
            price: 11.99,
            category: 'Salads',
            cuisine: 'Healthy'
          },
          {
            id: 'h3',
            name: 'Smoothie Bowl',
            description: 'Acai bowl with fruits and granola',
            price: 8.99,
            category: 'Breakfast',
            cuisine: 'Healthy',
            isVegetarian: true
          }
        ]
      }
    ];
  }
}
