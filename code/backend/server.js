// backend/server.js  — APP ENTRY (do NOT put route handlers here)
const path = require('path');
const express = require('express');
const cors = require('cors');
// The main mongoose connection is no longer needed here, but mongoose might be used elsewhere.
const mongoose = require('mongoose'); 
// Tells dotenv to go up one level from 'backend' to find the .env file
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// --- Import ALL Route Files ---
const apiRoutes = require('./routes/api');              
const authRoutes = require('./routes/auth');
const translatorRoutes = require('./routes/translator');
const prescriptionRoutes = require('./routes/prescription');
const otpRoutes = require('./routes/otp');
const predictionRoutes = require('./routes/predictions');
const patientRoutes = require('./routes/patient');
const { runPredictionModel } = require('./services/predictionService');

const app = express();

// CORS (unchanged)
const corsOptions = {
  origin: [
    'https://sih-2025-pi-seven.vercel.app',
    'https://sih-2025-aayulink.vercel.app', 
    'https://sih-2025-bpa576elr-tanish-17s-projects.vercel.app',
    'https://sih-2025-aegr978t0-tanish-17s-projects.vercel.app',
    'http://localhost:5173'
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  allowedHeaders: ['authorization', 'content-type'],
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
};
app.use(cors(corsOptions));

// Body parser (unchanged)
app.use(express.json());

// Simple request logger (unchanged)
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Serve uploaded PDFs statically (unchanged)
const uploadsDir = path.join(__dirname, 'uploads');
console.log('Serving uploads from:', uploadsDir);
app.use('/uploads', express.static(uploadsDir));

// Mount routes (unchanged)
app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/translate', translatorRoutes);
app.use('/api/prescription', prescriptionRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api', apiRoutes);

// Health check (unchanged)
app.get('/', (_req, res) => {
  res.status(200).send('AayuLink Backend is running!');
});

// --- Start server directly ---
const PORT = process.env.PORT || 8000;
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error('---!! FATAL ERROR !!--- No MONGO_URI/MONGODB_URI found in environment variables.');
  process.exit(1);
}

// ✅ REMOVED: The mongoose.connect() block that used to wrap the app.listen() call.
// The connection is now handled on-demand by the dbConnect helper in your routes.

app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
  
  // Note: In a serverless environment, long-running processes like setInterval are not guaranteed to work as expected.
  // For scheduled tasks on Vercel, it is better to use Cron Jobs, which you already configured for keep-warm.
  try {
    runPredictionModel();
    setInterval(runPredictionModel, 3600000); // hourly
  } catch (e) {
    console.error('Prediction service failed to start:', e);
  }
});

// Debugging probe (unchanged)
app.get('/__uploads_probe/:name', (req, res) => {
  const fs = require('fs');
  const p = path.join(__dirname, 'uploads', req.params.name);
  res.json({ path: p, exists: fs.existsSync(p) });
});

// Vercel needs this export to properly handle the express app
module.exports = app;