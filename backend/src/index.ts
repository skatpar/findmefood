import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { format, getHours, getDay } from 'date-fns';

import { WeatherService } from './services/weatherService';
import { RestaurantService } from './services/restaurantService';
import { OrderHistoryParser } from './services/orderHistoryParser';
import { RecommendationEngine } from './services/recommendationEngine';
import { RecommendationRequest, RecommendationContext } from './types';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.csv', '.json', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV and JSON files are allowed.'));
    }
  }
});

// Initialize services
const weatherService = new WeatherService(process.env.OPENWEATHER_API_KEY || '');
const restaurantService = new RestaurantService();
const orderParser = new OrderHistoryParser();
const recommendationEngine = new RecommendationEngine(weatherService);

// Routes

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Upload and parse order history
app.post('/api/upload-history', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileContent = fs.readFileSync(req.file.path, 'utf-8');
    const ext = path.extname(req.file.originalname).toLowerCase();

    let orderHistory;
    if (ext === '.csv') {
      orderHistory = orderParser.parseCSV(fileContent);
    } else if (ext === '.json') {
      orderHistory = orderParser.parseJSON(fileContent);
    } else {
      return res.status(400).json({ error: 'Unsupported file format' });
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    const preferences = orderParser.analyzePreferences(orderHistory);

    res.json({
      success: true,
      orderHistory,
      preferences,
      totalOrders: orderHistory.length
    });
  } catch (error: any) {
    console.error('Error processing file:', error);
    res.status(500).json({ error: error.message || 'Failed to process order history' });
  }
});

// Get weather for location
app.post('/api/weather', async (req: Request, res: Response) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const weather = await weatherService.getWeather({ latitude, longitude });

    res.json({ weather });
  } catch (error: any) {
    console.error('Error fetching weather:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch weather data' });
  }
});

// Get nearby restaurants
app.post('/api/restaurants', async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, radius = 5 } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const restaurants = await restaurantService.findNearbyRestaurants(
      { latitude, longitude },
      radius
    );

    res.json({ restaurants, count: restaurants.length });
  } catch (error: any) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch restaurants' });
  }
});

// Get personalized recommendations
app.post('/api/recommendations', async (req: Request, res: Response) => {
  try {
    const { location, orderHistory, limit = 10 } = req.body;

    if (!location || !location.latitude || !location.longitude) {
      return res.status(400).json({ error: 'Valid location is required' });
    }

    if (!orderHistory || !Array.isArray(orderHistory) || orderHistory.length === 0) {
      return res.status(400).json({ error: 'Order history is required' });
    }

    // Get current context
    const now = new Date();
    const weather = await weatherService.getWeather(location);
    const restaurants = await restaurantService.findNearbyRestaurants(location, 5);

    const context: RecommendationContext = {
      location,
      weather,
      timeOfDay: format(now, 'HH:mm'),
      dayOfWeek: format(now, 'EEEE'),
      orderHistory
    };

    // Generate recommendations
    const recommendations = await recommendationEngine.generateRecommendations(
      context,
      restaurants,
      limit
    );

    res.json({
      recommendations,
      context: {
        weather,
        timeOfDay: context.timeOfDay,
        dayOfWeek: context.dayOfWeek,
        nearbyRestaurants: restaurants.length
      }
    });
  } catch (error: any) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ error: error.message || 'Failed to generate recommendations' });
  }
});

// Parse order history from text/JSON
app.post('/api/parse-history', async (req: Request, res: Response) => {
  try {
    const { content, format: fileFormat } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    let orderHistory;
    if (fileFormat === 'csv') {
      orderHistory = orderParser.parseCSV(content);
    } else if (fileFormat === 'json') {
      orderHistory = orderParser.parseJSON(content);
    } else {
      return res.status(400).json({ error: 'Format must be csv or json' });
    }

    const preferences = orderParser.analyzePreferences(orderHistory);

    res.json({
      success: true,
      orderHistory,
      preferences,
      totalOrders: orderHistory.length
    });
  } catch (error: any) {
    console.error('Error parsing history:', error);
    res.status(500).json({ error: error.message || 'Failed to parse order history' });
  }
});

// Serve static frontend files in production
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../../frontend/dist');

  // Serve static files
  app.use(express.static(frontendPath));

  // Handle client-side routing - send all non-API requests to index.html
  app.get('*', (req: Request, res: Response) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(frontendPath, 'index.html'));
    }
  });
}

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Error:', err);
  res.status(500).json({
    error: err.message || 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🍕 FindMeFood API server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌤️  OpenWeather API: ${process.env.OPENWEATHER_API_KEY ? 'configured' : 'not configured'}`);
});

export default app;
