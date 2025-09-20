// backend/server.js  — APP ENTRY (do NOT put route handlers here)
const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

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

// CORS (allow your FE origins)
const corsOptions = {
  origin: [
    'https://sih-2025-pi-seven.vercel.app',
    'https://sih-2025-aayulink.vercel.app', 
    'http://localhost:5173'
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  allowedHeaders: ['authorization', 'content-type'],
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
};
app.use(cors(corsOptions));

// Body parser
app.use(express.json());

// Simple request logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// ✅ Serve uploaded PDFs statically
// http://localhost:8000/uploads/<filename>.pdf  -> backend/uploads/<filename>.pdf
const uploadsDir = path.join(__dirname, 'uploads');
console.log('Serving uploads from:', uploadsDir);
app.use('/uploads', express.static(uploadsDir));

// ✅ Mount routes (keep exactly one mount per router)
app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/translate', translatorRoutes);
app.use('/api/prescription', prescriptionRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api', apiRoutes); // <-- This includes your /chat route

// Health check
app.get('/', (_req, res) => {
  res.status(200).send('AayuLink Backend is running!');
});

// --- Start server after DB connects ---
const PORT = process.env.PORT || 8000;
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error('---!! DATABASE CONNECTION FAILED !!--- No MONGO_URI/MONGODB_URI found.');
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully.');

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);

      // Start prediction service
      try {
        runPredictionModel();
        setInterval(runPredictionModel, 3600000); // hourly
      } catch (e) {
        console.error('Prediction service error:', e);
      }
    });
  })
  .catch(err => {
    console.error('---!! DATABASE CONNECTION FAILED !!---');
    console.error(err);
    process.exit(1);
  });
// add once in server.js for debugging
app.get('/__uploads_probe/:name', (req, res) => {
  const fs = require('fs');
  const p = path.join(__dirname, 'uploads', req.params.name);
  res.json({ path: p, exists: fs.existsSync(p) });
});
