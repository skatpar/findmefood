import { useState, useRef } from 'react';
import './App.css';
import {
  uploadOrderHistory,
  getRecommendations,
  parseOrderHistory,
} from './api';
import {
  OrderHistoryItem,
  Location,
  Recommendation,
  Preferences,
  Weather,
} from './types';

function App() {
  const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[]>([]);
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [context, setContext] = useState<{
    weather: Weather;
    timeOfDay: string;
    dayOfWeek: string;
    nearbyRestaurants: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const result = await uploadOrderHistory(file);
      setOrderHistory(result.orderHistory);
      setPreferences(result.preferences);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload order history');
    } finally {
      setLoading(false);
    }
  };

  const handleGetLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLoading(false);
      },
      () => {
        setError('Failed to get your location. Please enable location services.');
        setLoading(false);
      }
    );
  };

  const handleGetRecommendations = async () => {
    if (!location || !orderHistory.length) {
      setError('Please upload order history and enable location first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getRecommendations(location, orderHistory, 10);
      setRecommendations(result.recommendations);
      setContext(result.context);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to get recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSampleData = async () => {
    setLoading(true);
    setError(null);

    try {
      const sampleData = [
        {
          restaurant: 'Pizza Paradise',
          items: ['Margherita Pizza', 'Garlic Bread'],
          date: '2024-01-15',
          time: '19:30',
          totalAmount: 25.5,
        },
        {
          restaurant: 'Curry House',
          items: ['Chicken Tikka Masala', 'Naan', 'Rice'],
          date: '2024-01-10',
          time: '20:00',
          totalAmount: 18.99,
        },
        {
          restaurant: 'Sushi Master',
          items: ['California Roll', 'Salmon Sashimi'],
          date: '2024-01-08',
          time: '13:00',
          totalAmount: 32.5,
        },
        {
          restaurant: 'Burger Joint',
          items: ['Cheeseburger', 'Fries', 'Cola'],
          date: '2024-01-05',
          time: '21:00',
          totalAmount: 15.99,
        },
        {
          restaurant: 'Pizza Paradise',
          items: ['Pepperoni Pizza'],
          date: '2024-01-03',
          time: '19:00',
          totalAmount: 14.99,
        },
      ];

      const result = await parseOrderHistory(JSON.stringify(sampleData), 'json');
      setOrderHistory(result.orderHistory);
      setPreferences(result.preferences);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load sample data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>🍕 FindMeFood</h1>
          <p>AI-powered food recommendations based on your history, location & weather</p>
        </header>

        {error && <div className="error">{error}</div>}

        <div className="card upload-section">
          <h2>📋 Step 1: Upload Your Order History</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Upload your foodpanda order history (CSV or JSON format)
          </p>
          <input
            type="file"
            ref={fileInputRef}
            className="file-input"
            accept=".csv,.json"
            onChange={handleFileUpload}
          />
          <button
            className="upload-button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Choose File'}
          </button>
          <button
            className="sample-data-button"
            onClick={handleLoadSampleData}
            disabled={loading}
          >
            Or Use Sample Data
          </button>
          {orderHistory.length > 0 && (
            <div className="file-info">
              ✅ {orderHistory.length} orders loaded successfully
            </div>
          )}
        </div>

        {preferences && (
          <div className="card">
            <h2>📊 Your Food Preferences</h2>
            <div className="preferences-grid">
              <div className="preference-box">
                <h3>Favorite Cuisines</h3>
                <ul>
                  {preferences.favoriteCuisines.map((cuisine, idx) => (
                    <li key={idx}>{cuisine}</li>
                  ))}
                </ul>
              </div>
              <div className="preference-box">
                <h3>Favorite Restaurants</h3>
                <ul>
                  {preferences.favoriteRestaurants.map((restaurant, idx) => (
                    <li key={idx}>{restaurant}</li>
                  ))}
                </ul>
              </div>
              <div className="preference-box">
                <h3>Common Items</h3>
                <ul>
                  {preferences.commonItems.slice(0, 5).map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="preference-box">
                <h3>Preferred Times</h3>
                <ul>
                  {preferences.preferredTimes.map((time, idx) => (
                    <li key={idx}>{time}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="card location-section">
          <h2>📍 Step 2: Share Your Location</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            We need your location to find nearby restaurants
          </p>
          <button
            className="location-button"
            onClick={handleGetLocation}
            disabled={loading}
          >
            {loading ? 'Getting Location...' : 'Get My Location'}
          </button>
          {location && (
            <div className="location-info">
              ✅ Location obtained: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </div>
          )}
        </div>

        {orderHistory.length > 0 && location && (
          <div className="card">
            <h2>🎯 Step 3: Get Personalized Recommendations</h2>
            <button
              className="get-recommendations-button"
              onClick={handleGetRecommendations}
              disabled={loading}
            >
              {loading ? 'Generating Recommendations...' : 'Find Me Food!'}
            </button>
          </div>
        )}

        {loading && !error && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Analyzing your preferences...</p>
          </div>
        )}

        {context && (
          <div className="card">
            <h2>🌤️ Current Context</h2>
            <div className="context-info">
              <div className="context-card">
                <div className="icon">🌡️</div>
                <div className="label">Temperature</div>
                <div className="value">{context.weather.temperature}°C</div>
              </div>
              <div className="context-card">
                <div className="icon">☁️</div>
                <div className="label">Weather</div>
                <div className="value">{context.weather.condition}</div>
              </div>
              <div className="context-card">
                <div className="icon">🕐</div>
                <div className="label">Time</div>
                <div className="value">{context.timeOfDay}</div>
              </div>
              <div className="context-card">
                <div className="icon">📅</div>
                <div className="label">Day</div>
                <div className="value">{context.dayOfWeek}</div>
              </div>
            </div>
          </div>
        )}

        {recommendations.length > 0 && (
          <div className="card">
            <h2>✨ Your Personalized Recommendations</h2>
            <div className="recommendations-grid">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="recommendation-card">
                  <div className="recommendation-header">
                    <div className="recommendation-title">
                      <h3>{rec.menuItem.name}</h3>
                      <p className="restaurant-name">
                        {rec.restaurant.name} • {rec.restaurant.distance.toFixed(1)}km away
                      </p>
                    </div>
                    <div className="recommendation-score">{rec.score}</div>
                  </div>

                  <div className="menu-item-info">
                    <p className="description">{rec.menuItem.description}</p>
                    <div className="item-details">
                      <span className="detail-badge price">${rec.menuItem.price}</span>
                      <span className="detail-badge">{rec.menuItem.cuisine}</span>
                      <span className="detail-badge">⭐ {rec.restaurant.rating}</span>
                      {rec.menuItem.isVegetarian && (
                        <span className="detail-badge">🌱 Vegetarian</span>
                      )}
                      {rec.menuItem.isSpicy && (
                        <span className="detail-badge">🌶️ Spicy</span>
                      )}
                    </div>
                  </div>

                  {rec.reasons.length > 0 && (
                    <div className="reasons">
                      <h4>Why we recommend this:</h4>
                      <ul>
                        {rec.reasons.map((reason, ridx) => (
                          <li key={ridx}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
