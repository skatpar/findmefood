export interface OrderHistoryItem {
  restaurant: string;
  items: string[];
  date: string;
  time: string;
  totalAmount?: number;
  cuisine?: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface Weather {
  temperature: number;
  condition: string;
  humidity: number;
  description: string;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string[];
  rating: number;
  distance: number;
  priceRange: string;
  location: Location;
  menu: MenuItem[];
  isOpen: boolean;
  deliveryTime?: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  cuisine: string;
  isVegetarian?: boolean;
  isSpicy?: boolean;
}

export interface Recommendation {
  restaurant: Restaurant;
  menuItem: MenuItem;
  score: number;
  reasons: string[];
}

export interface Preferences {
  favoriteCuisines: string[];
  favoriteRestaurants: string[];
  commonItems: string[];
  preferredTimes: string[];
}
