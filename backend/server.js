// backend/server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); // Import Mongoose
require('dotenv').config(); // Load environment variables

// Import both of our route files
const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth'); // <-- Import auth routes

// --- Initial Setup ---
const app = express();
const port = process.env.PORT || 8000;

// --- Middleware ---
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Enable parsing of JSON request bodies

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- API Routes ---
// Authentication routes will be prefixed with /api/auth
app.use('/api/auth', authRoutes); // <-- Use auth routes
// All other API routes will be prefixed with /api
app.use('/api', apiRoutes);

// --- Health Check Endpoint ---
// A simple route to check if the server is running
app.get('/', (req, res) => {
  res.status(200).send('AarogyaAI Backend is running!');
});

// --- Start Server ---
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

