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

const app = express();
app.use(cors());
app.use(express.json());

// Simple Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] Incoming Request: ${req.method} ${req.originalUrl}`);
  next();
});

// --- Tell Express to Use the Routes ---
// The order is important. More specific routes must come before general ones.
app.use('/api/auth', authRoutes);
app.use('/api/translate', translatorRoutes);
app.use('/api/prescription', prescriptionRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api', apiRoutes);

// --- Health Check Endpoint ---
app.get('/', (req, res) => {
  res.status(200).send('AarogyaAI Backend is running!');
});

const PORT = process.env.PORT || 8000;

// --- Database Connection & Server Start ---
// This is the definitive fix. We connect to the database FIRST.
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully.');
    
    // --- THEN, we start the server ---
    // This guarantees the server will not accept requests until the database is ready.
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log('NOTE: To reset the database, run "npm run seed" in a separate terminal.');
    });
  })
  .catch(err => {
    console.error('---!! DATABASE CONNECTION FAILED !!---');
    console.error(err);
    process.exit(1); // Exit the process with an error code
  });

