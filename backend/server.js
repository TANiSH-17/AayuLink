const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

// --- Import ALL Route Files ---
const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth');
const translatorRoutes = require('./routes/translator');
const prescriptionRoutes = require('./routes/prescription');
const otpRoutes = require('./routes/otp');
const predictionRoutes = require('./routes/predictions'); // ✅ 1. IMPORT THE NEW ROUTE
const { runPredictionModel } = require('./services/predictionService');

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] Incoming Request: ${req.method} ${req.originalUrl}`);
  next();
});

app.use('/uploads', express.static('uploads'));

// --- Tell Express to Use the Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/translate', translatorRoutes);
app.use('/api/prescription', prescriptionRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/predictions', predictionRoutes); // ✅ 2. USE THE NEW ROUTE
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.status(200).send('AayuLink Backend is running!');
});

const PORT = process.env.PORT || 8000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully.');
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      
      // --- START THE PREDICTION SERVICE ---
      runPredictionModel();
      setInterval(runPredictionModel, 3600000);
    });
  })
  .catch(err => {
    console.error('---!! DATABASE CONNECTION FAILED !!---');
    console.error(err);
    process.exit(1);
  });