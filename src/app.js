const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');

// Import routes
const routes = require('./routes/index');

// Import error handler middleware
const { globalErrorHandler, notFoundHandler } = require('./middlewares/errorHandler');

const app = express();

// Trust proxy is required for Express to set secure cookies behind a load balancer (like Render)
app.set('trust proxy', 1);

// =============================================================================
// SECURITY MIDDLEWARE
// =============================================================================

// Helmet - Sets various HTTP security headers
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// CORS - Cross-Origin Resource Sharing
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps, curl)
    if (!origin) return callback(null, true);
    if (origin.includes('vercel.app') || origin.includes('localhost')) {
      return callback(null, true);
    }
    return callback(null, false); // Block others
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-cart-session'],
}));

// =============================================================================
// REQUEST PARSING & LOGGING MIDDLEWARE
// =============================================================================

// HTTP request logging (dev format for development)
app.use(morgan('dev'));

// Parse JSON request bodies with a 10MB limit
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Parse cookies
app.use(cookieParser());

// =============================================================================
// ROUTES
// =============================================================================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API v1 routes
app.use('/api/v1', routes);

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// =============================================================================
// ERROR HANDLING
// =============================================================================

// Handle 404 - Route not found
app.use(notFoundHandler);

// Global error handler (must be last middleware)
app.use(globalErrorHandler);

module.exports = app;
