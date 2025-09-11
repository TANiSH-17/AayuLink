const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// --- Import Models & The New Seeder Function ---
const Patient = require('./models/patient'); // Needed to check if the DB is empty
const runSeeder = require('./routes/seedDB'); // <-- Import the seeder FUNCTION

const app = express();
app.use(cors());
app.use(express.json());

// Simple Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] Incoming Request: ${req.method} ${req.originalUrl}`);
  next();
});

// --- Database Connection & AUTOMATED Seeding Logic ---
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected successfully.');
    
    // Check if the database has any patients in it
    const patientCount = await Patient.countDocuments();
    if (patientCount === 0) {
      console.log('Database is empty. Running the seeder...');
      await runSeeder(); // Run the seeder function
    } else {
      console.log('Database already contains data. Seeding process skipped.');
    }
  })
  .catch(err => console.error('MongoDB connection error:', err));

// --- Import and Use Route Files ---
// Note that we no longer need to import or use a separate seeder route
const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth');
const translatorRoutes = require('./routes/translator');
const prescriptionRoutes = require('./routes/prescription');

app.use('/api/auth', authRoutes);
app.use('/api/translate', translatorRoutes);
app.use('/api/prescription', prescriptionRoutes);
app.use('/api', apiRoutes); // This handles all routes from api.js

// --- Health Check Endpoint ---
app.get('/', (req, res) => {
  res.status(200).send('AarogyaAI Backend is running!');
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

