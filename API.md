# 🔌 FindMeFood API Documentation

Complete REST API reference for the FindMeFood backend.

## Base URL

```
http://localhost:3001/api
```

## Authentication

Currently no authentication required. Future versions will implement JWT tokens.

## Endpoints

### Health Check

Check if the API server is running.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-26T12:00:00.000Z"
}
```

---

### Upload Order History

Upload order history file (CSV or JSON format).

**Endpoint:** `POST /upload-history`

**Content-Type:** `multipart/form-data`

**Parameters:**
- `file` (File, required): CSV or JSON file containing order history

**CSV Format:**
```csv
Date,Time,Restaurant,Items,Total Amount
2024-01-20,19:30,Pizza Paradise,"Margherita Pizza, Garlic Bread",25.50
```

**JSON Format:**
```json
[
  {
    "restaurant": "Pizza Paradise",
    "items": ["Margherita Pizza", "Garlic Bread"],
    "date": "2024-01-20",
    "time": "19:30",
    "totalAmount": 25.50
  }
]
```

**Response:**
```json
{
  "success": true,
  "orderHistory": [
    {
      "restaurant": "Pizza Paradise",
      "items": ["Margherita Pizza", "Garlic Bread"],
      "date": "2024-01-20",
      "time": "19:30",
      "totalAmount": 25.50,
      "cuisine": "Italian"
    }
  ],
  "preferences": {
    "favoriteCuisines": ["Italian", "Indian", "Japanese"],
    "favoriteRestaurants": ["Pizza Paradise", "Curry House"],
    "commonItems": ["Margherita Pizza", "Naan", "Garlic Bread"],
    "preferredTimes": ["dinner", "lunch"]
  },
  "totalOrders": 1
}
```

**Error Responses:**
- `400` - No file uploaded or invalid format
- `500` - Server error processing file

---

### Parse Order History

Parse order history from text content (alternative to file upload).

**Endpoint:** `POST /parse-history`

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "content": "[{\"restaurant\":\"Pizza Paradise\",\"items\":[\"Pizza\"],\"date\":\"2024-01-20\",\"time\":\"19:30\"}]",
  "format": "json"
}
```

**Parameters:**
- `content` (string, required): Order history content
- `format` (string, required): Either "csv" or "json"

**Response:**
Same as `/upload-history`

---

### Get Weather

Fetch current weather for a location.

**Endpoint:** `POST /weather`

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

**Parameters:**
- `latitude` (number, required): Latitude coordinate
- `longitude` (number, required): Longitude coordinate

**Response:**
```json
{
  "weather": {
    "temperature": 22,
    "condition": "Clear",
    "humidity": 65,
    "description": "clear sky"
  }
}
```

**Error Responses:**
- `400` - Missing latitude or longitude
- `500` - Weather API error (returns default weather)

---

### Find Nearby Restaurants

Get restaurants near a location.

**Endpoint:** `POST /restaurants`

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "radius": 5
}
```

**Parameters:**
- `latitude` (number, required): Latitude coordinate
- `longitude` (number, required): Longitude coordinate
- `radius` (number, optional): Search radius in km (default: 5)

**Response:**
```json
{
  "restaurants": [
    {
      "id": "1",
      "name": "Pizza Paradise",
      "cuisine": ["Italian", "Pizza"],
      "rating": 4.5,
      "distance": 1.2,
      "priceRange": "$$",
      "location": {
        "latitude": 40.7128,
        "longitude": -74.0060
      },
      "isOpen": true,
      "deliveryTime": 30,
      "menu": [
        {
          "id": "p1",
          "name": "Margherita Pizza",
          "description": "Classic tomato and mozzarella",
          "price": 12.99,
          "category": "Pizza",
          "cuisine": "Italian",
          "isVegetarian": true
        }
      ]
    }
  ],
  "count": 1
}
```

---

### Get Recommendations

Generate personalized food recommendations.

**Endpoint:** `POST /recommendations`

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060
  },
  "orderHistory": [
    {
      "restaurant": "Pizza Paradise",
      "items": ["Margherita Pizza"],
      "date": "2024-01-20",
      "time": "19:30"
    }
  ],
  "limit": 10
}
```

**Parameters:**
- `location` (object, required):
  - `latitude` (number)
  - `longitude` (number)
- `orderHistory` (array, required): Array of past orders
- `limit` (number, optional): Max recommendations (default: 10)

**Response:**
```json
{
  "recommendations": [
    {
      "restaurant": {
        "id": "1",
        "name": "Pizza Paradise",
        "cuisine": ["Italian", "Pizza"],
        "rating": 4.5,
        "distance": 1.2,
        "priceRange": "$$",
        "location": {
          "latitude": 40.7128,
          "longitude": -74.0060
        },
        "isOpen": true,
        "deliveryTime": 30,
        "menu": []
      },
      "menuItem": {
        "id": "p1",
        "name": "Margherita Pizza",
        "description": "Classic tomato and mozzarella",
        "price": 12.99,
        "category": "Pizza",
        "cuisine": "Italian",
        "isVegetarian": true
      },
      "score": 85,
      "reasons": [
        "Very close (1.2km away)",
        "Highly rated (4.5⭐)",
        "You love Italian food",
        "Similar to your previous orders"
      ]
    }
  ],
  "context": {
    "weather": {
      "temperature": 22,
      "condition": "Clear",
      "humidity": 65,
      "description": "clear sky"
    },
    "timeOfDay": "19:30",
    "dayOfWeek": "Friday",
    "nearbyRestaurants": 6
  }
}
```

**Error Responses:**
- `400` - Missing or invalid location/order history
- `500` - Server error generating recommendations

## Data Models

### OrderHistoryItem

```typescript
{
  restaurant: string;
  items: string[];
  date: string;
  time: string;
  totalAmount?: number;
  cuisine?: string;
}
```

### Location

```typescript
{
  latitude: number;
  longitude: number;
  address?: string;
}
```

### Weather

```typescript
{
  temperature: number;  // Celsius
  condition: string;    // Clear, Rain, Snow, etc.
  humidity: number;     // Percentage
  description: string;  // Detailed description
}
```

### Restaurant

```typescript
{
  id: string;
  name: string;
  cuisine: string[];
  rating: number;       // 0-5
  distance: number;     // km
  priceRange: string;   // $, $$, $$$
  location: Location;
  menu: MenuItem[];
  isOpen: boolean;
  deliveryTime?: number; // minutes
}
```

### MenuItem

```typescript
{
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  cuisine: string;
  isVegetarian?: boolean;
  isSpicy?: boolean;
}
```

### Recommendation

```typescript
{
  restaurant: Restaurant;
  menuItem: MenuItem;
  score: number;        // 0-100
  reasons: string[];    // Human-readable reasons
}
```

## Rate Limits

Currently no rate limits. Production deployment should implement:
- 100 requests per minute per IP
- 1000 requests per hour per IP

## Error Handling

All errors return:

```json
{
  "error": "Error message description"
}
```

HTTP Status Codes:
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (future auth)
- `404` - Not Found
- `500` - Internal Server Error

## CORS

CORS is enabled for all origins in development. Production should restrict to:
```javascript
{
  origin: ['https://yourdomain.com'],
  credentials: true
}
```

## Request Examples

### cURL

```bash
# Upload CSV file
curl -X POST http://localhost:3001/api/upload-history \
  -F "file=@orders.csv"

# Get weather
curl -X POST http://localhost:3001/api/weather \
  -H "Content-Type: application/json" \
  -d '{"latitude":40.7128,"longitude":-74.0060}'

# Get recommendations
curl -X POST http://localhost:3001/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "location": {"latitude":40.7128,"longitude":-74.0060},
    "orderHistory": [{"restaurant":"Test","items":["Pizza"],"date":"2024-01-20","time":"19:30"}],
    "limit": 5
  }'
```

### JavaScript (Fetch)

```javascript
// Upload file
const formData = new FormData();
formData.append('file', file);

const response = await fetch('http://localhost:3001/api/upload-history', {
  method: 'POST',
  body: formData
});

const data = await response.json();

// Get recommendations
const response = await fetch('http://localhost:3001/api/recommendations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    location: { latitude: 40.7128, longitude: -74.0060 },
    orderHistory: [...],
    limit: 10
  })
});

const data = await response.json();
```

### Python (Requests)

```python
import requests

# Upload file
with open('orders.csv', 'rb') as f:
    response = requests.post(
        'http://localhost:3001/api/upload-history',
        files={'file': f}
    )

# Get weather
response = requests.post(
    'http://localhost:3001/api/weather',
    json={'latitude': 40.7128, 'longitude': -74.0060}
)

# Get recommendations
response = requests.post(
    'http://localhost:3001/api/recommendations',
    json={
        'location': {'latitude': 40.7128, 'longitude': -74.0060},
        'orderHistory': [...],
        'limit': 10
    }
)
```

## Webhooks (Future)

Future versions will support webhooks for:
- New restaurant additions
- Menu updates
- Price changes

## Pagination (Future)

For large result sets, pagination will be:

```
GET /restaurants?page=1&limit=20
```

Response:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

For more information, see the main README.md
