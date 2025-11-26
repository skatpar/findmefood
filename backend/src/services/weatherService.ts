import axios from 'axios';
import { Weather, Location } from '../types';

export class WeatherService {
  private apiKey: string;
  private baseUrl = 'https://api.openweathermap.org/data/2.5/weather';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getWeather(location: Location): Promise<Weather> {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          lat: location.latitude,
          lon: location.longitude,
          appid: this.apiKey,
          units: 'metric'
        }
      });

      const data = response.data;
      return {
        temperature: Math.round(data.main.temp),
        condition: data.weather[0].main,
        humidity: data.main.humidity,
        description: data.weather[0].description
      };
    } catch (error) {
      console.error('Error fetching weather:', error);
      // Return default weather if API fails
      return {
        temperature: 25,
        condition: 'Clear',
        humidity: 50,
        description: 'clear sky'
      };
    }
  }

  getWeatherPreferences(weather: Weather): string[] {
    const preferences: string[] = [];

    if (weather.temperature < 15) {
      preferences.push('hot', 'soup', 'warm', 'comfort food');
    } else if (weather.temperature > 30) {
      preferences.push('cold', 'refreshing', 'salad', 'light');
    }

    if (weather.condition === 'Rain') {
      preferences.push('comfort food', 'hot', 'soup', 'warm');
    }

    return preferences;
  }
}
