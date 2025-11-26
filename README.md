# 🍕 FindMeFood - AI-Powered Food Recommendation App

An intelligent web application that analyzes your food ordering history, current location, weather conditions, and time of day to provide personalized restaurant and menu recommendations.

## ✨ Features

- **📋 Order History Analysis**: Upload your foodpanda order history (CSV/JSON) to analyze your food preferences
- **🎯 Smart Recommendations**: AI-powered recommendation engine considers:
  - Your past ordering patterns and favorite cuisines
  - Current weather conditions (hot/cold food for weather)
  - Time of day (breakfast, lunch, dinner preferences)
  - Restaurant proximity and ratings
  - Delivery times
- **📍 Location-Based**: Finds nearby restaurants based on your current location
- **🌤️ Weather Integration**: Suggests appropriate meals based on current weather
- **💡 Personalized Insights**: Shows why each recommendation matches your preferences

## 🏗️ Architecture

### Backend (Node.js + TypeScript + Express)
- **Order History Parser**: Supports CSV and JSON formats
- **Weather Service**: Integrates with OpenWeatherMap API
- **Restaurant Service**: Manages restaurant and menu data
- **Recommendation Engine**: Sophisticated scoring algorithm that considers:
  - Historical preferences
  - Weather conditions
  - Time-based patterns
  - Distance and ratings
  - Similarity to past orders

### Frontend (React + TypeScript + Vite)
- Modern, responsive UI with gradient design
- File upload with drag-and-drop support
- Real-time location detection
- Interactive recommendation cards
- Context-aware displays (weather, time, location)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- OpenWeatherMap API key (free tier available)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd findmefood
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Backend (.env):
```bash
cd backend
cp .env.example .env
# Edit .env and add your API keys:
# OPENWEATHER_API_KEY=your_key_here
```

Frontend (.env):
```bash
cd frontend
cp .env.example .env
# Default settings should work for local development
```

4. **Start the application**
```bash
# From root directory
npm run dev
```

This will start:
- Backend API server on http://localhost:3001
- Frontend dev server on http://localhost:3000

## 📝 Usage

### 1. Prepare Your Order History

#### Option A: Use Sample Data
Click "Use Sample Data" button in the app for instant demo.

#### Option B: Export from Foodpanda
Export your order history from foodpanda in one of these formats:

**CSV Format** (sample_orders.csv):
```csv
Date,Time,Restaurant,Items,Total Amount
2024-01-15,19:30,Pizza Paradise,"Margherita Pizza, Garlic Bread",25.50
2024-01-10,20:00,Curry House,"Chicken Tikka Masala, Naan, Rice",18.99
```

**JSON Format** (sample_orders.json):
```json
[
  {
    "restaurant": "Pizza Paradise",
    "items": ["Margherita Pizza", "Garlic Bread"],
    "date": "2024-01-15",
    "time": "19:30",
    "totalAmount": 25.50
  }
]
```

### 2. Upload Order History
- Click "Choose File" and select your CSV or JSON file
- Or click "Use Sample Data" for a quick demo

### 3. Enable Location
- Click "Get My Location" to allow browser location access
- The app will use your coordinates to find nearby restaurants

### 4. Get Recommendations
- Click "Find Me Food!" to generate personalized recommendations
- View your top recommendations with detailed reasons

## 🔧 API Endpoints

### POST /api/upload-history
Upload order history file (CSV/JSON)

### POST /api/parse-history
Parse order history from text content

### POST /api/weather
Get current weather for a location

### POST /api/restaurants
Find nearby restaurants

### POST /api/recommendations
Generate personalized recommendations

## 🎨 Customization

### Adding More Restaurants
Edit `backend/src/services/restaurantService.ts` and add entries to the `mockRestaurants` array.

### Adjusting Recommendation Algorithm
Modify scoring weights in `backend/src/services/recommendationEngine.ts`:
- Restaurant rating weight
- Distance preferences
- Cuisine matching
- Weather influence
- Time-of-day patterns

### Integrating Real Restaurant APIs
Replace the mock data in `restaurantService.ts` with calls to real restaurant APIs like:
- Google Places API
- Yelp Fusion API
- Uber Eats API
- Custom restaurant database

## 🔐 Environment Variables

### Backend
- `PORT`: API server port (default: 3001)
- `OPENWEATHER_API_KEY`: OpenWeatherMap API key ([Get one free](https://openweathermap.org/api))
- `GOOGLE_MAPS_API_KEY`: (Optional) For enhanced location services
- `OPENAI_API_KEY`: (Optional) For enhanced text analysis
- `NODE_ENV`: development/production

### Frontend
- `VITE_API_URL`: Backend API URL (default: http://localhost:3001/api)

## 📊 How the Recommendation Engine Works

The scoring algorithm (0-100 points) considers:

1. **Restaurant Rating** (0-25 pts): Higher rated restaurants score better
2. **Distance** (0-15 pts): Closer restaurants preferred
3. **Cuisine Preference** (0-20 pts): Matches your favorite cuisines
4. **Restaurant History** (0-15 pts): Boosts your favorite restaurants
5. **Menu Item Similarity** (0-15 pts): Similar to previous orders
6. **Time Matching** (0-10 pts): Appropriate for current meal time
7. **Weather Matching** (0-10 pts): Suits current weather
8. **Day Patterns** (0-5 pts): Considers weekly patterns
9. **Delivery Time** (0-5 pts): Faster delivery scores higher

## 🧪 Sample Data Files

Sample files are available in the `/samples` directory:
- `sample_orders.csv`: Sample CSV format
- `sample_orders.json`: Sample JSON format

## 🚢 Deployment

### Backend Deployment (Heroku, Railway, etc.)
```bash
cd backend
npm run build
npm start
```

### Frontend Deployment (Vercel, Netlify)
```bash
cd frontend
npm run build
# Deploy the 'dist' folder
```

## 🛠️ Development

### Project Structure
```
findmefood/
├── backend/
│   ├── src/
│   │   ├── services/          # Business logic
│   │   ├── types/             # TypeScript types
│   │   └── index.ts           # Express server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx            # Main component
│   │   ├── api.ts             # API client
│   │   └── types.ts           # TypeScript types
│   └── package.json
└── package.json               # Root workspace config
```

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🐛 Known Limitations

- Restaurant data is currently mocked (needs integration with real APIs)
- Limited to browser geolocation (no manual address entry yet)
- Weather API has rate limits on free tier
- No user authentication/profile storage

## 🔮 Future Enhancements

- [ ] User accounts and saved preferences
- [ ] Integration with real restaurant APIs
- [ ] Social features (share recommendations)
- [ ] Dietary restrictions and allergies
- [ ] Price range filters
- [ ] Reservation and ordering integration
- [ ] Mobile app (React Native)
- [ ] Machine learning for better predictions
- [ ] Group ordering recommendations
- [ ] Nutrition information

## 💬 Support

For issues, questions, or suggestions, please open an issue on GitHub.

## 🙏 Acknowledgments

- OpenWeatherMap for weather data
- React and TypeScript communities
- All open-source contributors

---

Made with ❤️ and 🍕 by the FindMeFood team
