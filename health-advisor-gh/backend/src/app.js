const express = require('express');
const helmet = require('helmet'); // For security headers
const cors = require('cors'); // For Cross-Origin Resource Sharing
const app = express();
const port = process.env.PORT || 3001;
require('dotenv').config();

// Initialize Firebase Admin SDK
const admin = require('./services/firebaseAdmin');

// Database Connection
const connectDB = require('./config/database');
connectDB(); // Establish database connection

// Apply Helmet for security best practices (sets various HTTP headers)
app.use(helmet());

// CORS Configuration
const defaultFrontendDevUrl = 'http://localhost:3000'; // Default React dev port
const allowedOrigins = [
  process.env.FRONTEND_DEV_URL || defaultFrontendDevUrl,
];
if (process.env.FRONTEND_PROD_URL) {
  allowedOrigins.push(process.env.FRONTEND_PROD_URL);
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests) during development,
    // or for specific use cases. For stricter production, you might remove this.
    if (!origin && process.env.NODE_ENV !== 'production') return callback(null, true);
    if (!origin && process.env.NODE_ENV === 'production') return callback(new Error('CORS: Requests with no origin are not allowed in production.'), false);

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `CORS policy: The origin '${origin}' is not allowed to access this resource.`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Specify allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
  credentials: true // If you need to handle cookies or authorization headers
}));

// Middleware to parse JSON bodies
app.use(express.json());

// Simple request logger for development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
  });
}

app.get('/', (req, res) => {
  res.send('Health Advisor Ghana Backend is running!');
});

// User authentication routes
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes); // Prefix all user routes with /api/users

// Symptom checker routes
const symptomRoutes = require('./routes/symptomRoutes');
app.use('/api/symptoms', symptomRoutes); // Prefix all symptom routes with /api/symptoms

// Chatbot routes
const chatbotRoutes = require('./routes/chatbotRoutes');
app.use('/api/chatbot', chatbotRoutes); // Prefix all chatbot routes with /api/chatbot

// Clinic Locator routes
const clinicRoutes = require('./routes/clinicRoutes');
app.use('/api/clinics', clinicRoutes); // Prefix all clinic routes with /api/clinics

// Health Content (Tips & Education) routes
const healthContentRoutes = require('./routes/healthContentRoutes');
app.use('/api/health-content', healthContentRoutes);

// Admin Dashboard routes
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

// Catch-all for 404 API routes - this should be after all API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found.' });
});

// Global Error Handling Middleware
// This must be the last piece of middleware.
// Express identifies it as an error handler by its four arguments.
app.use((err, req, res, next) => {
  console.error(`Global Error Handler: ${err.message}`);
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    console.error(err.stack);
  }

  const statusCode = err.statusCode || err.status || 500; // Use error's status or default to 500
  const responseMessage = err.message || 'An unexpected internal server error occurred.';

  // Avoid sending stack trace in production for security reasons
  const errorResponse = { message: responseMessage };
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    // errorResponse.stack = err.stack; // Optionally send stack in dev, but often just console logging is enough
  }
  if (err.details) { // For validation errors or similar
    errorResponse.details = err.details;
  }


  res.status(statusCode).json(errorResponse);
});


app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
  console.log(`Allowed CORS origins: ${allowedOrigins.join(', ')}`);
  // Firebase status check
  try {
    if (admin.apps.length > 0) {
      console.log('Firebase Admin SDK appears to be initialized.');
    } else {
      console.warn('Firebase Admin SDK does NOT appear to be initialized. Check .env configuration (FIREBASE_SERVICE_ACCOUNT_KEY_PATH or _BASE64).');
    }
  } catch (e) {
    console.error("Error during Firebase status check in app.js startup:", e.message);
  }
});
