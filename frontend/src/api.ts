import axios from 'axios';
import { OrderHistoryItem, Location, Recommendation, Weather, Preferences } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadOrderHistory = async (file: File): Promise<{
  orderHistory: OrderHistoryItem[];
  preferences: Preferences;
  totalOrders: number;
}> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/upload-history', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const parseOrderHistory = async (
  content: string,
  format: 'csv' | 'json'
): Promise<{
  orderHistory: OrderHistoryItem[];
  preferences: Preferences;
  totalOrders: number;
}> => {
  const response = await api.post('/parse-history', { content, format });
  return response.data;
};

export const getWeather = async (location: Location): Promise<Weather> => {
  const response = await api.post('/weather', location);
  return response.data.weather;
};

export const getRecommendations = async (
  location: Location,
  orderHistory: OrderHistoryItem[],
  limit: number = 10
): Promise<{
  recommendations: Recommendation[];
  context: {
    weather: Weather;
    timeOfDay: string;
    dayOfWeek: string;
    nearbyRestaurants: number;
  };
}> => {
  const response = await api.post('/recommendations', {
    location,
    orderHistory,
    limit,
  });

  return response.data;
};

export default api;
