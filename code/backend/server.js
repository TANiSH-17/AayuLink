// backend/server.js — APP ENTRY

// --- Core Node.js Modules ---
const path = require('path');
const fs = require('fs'); // Moved from debug probe to top level

// --- Third-party Modules ---
const express = require('express');
const cors = require('cors');
const morgan = require('morgan'); // A professional-grade request logger
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// --- Application Modules ---
const { runPredictionModel } = require('./services/predictionService');
const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth');
const translatorRoutes = require('./routes/translator');
const prescriptionRoutes = require('./routes/prescription');
const otpRoutes = require('./routes/otp');
const predictionRoutes = require('./routes/predictions');
const patientRoutes = require('./routes/patient');
const mdrRoutes = require('./routes/mdr');

// --- Initialization ---
const app = express();

// --- Environment Variable Setup ---
const PORT = process.env.PORT || 8000;
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
const NODE_ENV = process.env.NODE_ENV || 'development';
const ALLOWED_ORIGINS_STR = process.env.ALLOWED_ORIGINS || 'http://localhost:5173';

if (!MONGO_URI) {
  console.error('---!! FATAL ERROR !!--- No MONGO_URI/MONGODB_URI found in environment variables.');
  process.exit(1); // Fail fast if DB connection string is missing
}

// --- Middleware Configuration ---

// 1. CORS (Cross-Origin Resource Sharing)
const allowedOrigins = ALLOWED_ORIGINS_STR.split(',').map(origin => origin.trim());
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  allowedHeaders: ['authorization', 'content-type'],
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
};
app.use(cors(corsOptions));

// 2. Request Body Parser
app.use(express.json());

// 3. HTTP Request Logger
// Use 'dev' format for development for colored status codes, and 'combined' for production
app.use(morgan(NODE_ENV === 'development' ? 'dev' : 'combined'));

// 4. Static File Server for Uploads
const uploadsDir = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsDir));

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/translate', translatorRoutes);
app.use('/api/prescription', prescriptionRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/mdr', mdrRoutes);
app.use('/api', apiRoutes); // General/other API routes

// --- Health Check & Debugging Routes ---

// Health check endpoint for uptime monitoring
app.get('/', (_req, res) => {
  res.status(200).send('AayuLink Backend is running!');
});

// Conditional debugging probe for development environment only
if (NODE_ENV === 'development') {
  app.get('/__uploads_probe/:name', (req, res) => {
    const p = path.join(uploadsDir, req.params.name);
    res.json({ path: p, exists: fs.existsSync(p) });
  });
}

// --- Global Error Handler ---
// Catches errors from async routes
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});


// --- Server Startup ---
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT} in ${NODE_ENV} mode.`);
  console.log('Serving uploads from:', uploadsDir);
  console.log('Allowed CORS origins:', allowedOrigins);

  try {
    // Start the recurring public health prediction model
    runPredictionModel();
    setInterval(runPredictionModel, 3600000); // Runs every hour
  } catch (e) {
    console.error('Prediction service failed to start:', e);
  }
});

module.exports = app;