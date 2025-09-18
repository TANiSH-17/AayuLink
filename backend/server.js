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
const patientRoutes = require('./routes/patient'); // ✅ 1. Import the new patient route file
const { runPredictionModel } = require('./services/predictionService');

const app = express();

// Configure CORS to trust your frontend domains
const corsOptions = {
  origin: [
    'https://sih-2025-pi-seven.vercel.app', // Your live Vercel URL
    'http://localhost:5173'                 // Your local development URL
  ],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));


app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] Incoming Request: ${req.method} ${req.originalUrl}`);
  next();
});

app.use('/uploads', express.static('uploads'));

// --- Tell Express to Use the Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes); // ✅ 2. Use the new patient routes
app.use('/api/translate', translatorRoutes);
app.use('/api/prescription', prescriptionRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/predictions', predictionRoutes);
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
      setInterval(runPredictionModel, 3600000); // Runs every hour
    });
  })
  .catch(err => {
    console.error('---!! DATABASE CONNECTION FAILED !!---');
    console.error(err);
    process.exit(1);
  });