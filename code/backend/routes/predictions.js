const express = require('express');
const router = express.Router();
const Prediction = require('../models/Prediction');
const dbConnect = require('../lib/dbConnect');

// --- NEW IMPORTS for the Ward Prediction Route ---
const { protect, admin } = require('../middleware/authMiddleware');
const { generateWardForecast } = require('../services/predictionService');


// GET /api/predictions
// Fetches the latest predictions to show on the dashboard (Existing route, unchanged)
router.get('/', async (req, res) => {
    try {
        await dbConnect();

        const forecasts = await Prediction.find({
            predictedDate: { $gte: new Date() } // Only get upcoming predictions
        }).sort({ location: 1 });

        res.status(200).json(forecasts);
    } catch (error) {
        console.error("Error fetching predictions:", error);
        res.status(500).json({ message: "Failed to fetch predictions." });
    }
});


// --- NEW ROUTE for Ward Outbreak Forecast ---
// GET /api/predictions/ward/:hospitalId/:wardName
router.get('/ward/:hospitalId/:wardName', protect, admin, async (req, res) => {
  try {
    await dbConnect();
    const { hospitalId, wardName } = req.params;

    // The service currently uses dummy data, but it's ready for real data
    const forecastData = await generateWardForecast(hospitalId, wardName);
    
    res.json(forecastData);

  } catch (err) {
    console.error('Ward prediction error:', err);
    res.status(500).json({ message: 'Server error while generating forecast.' });
  }
});


module.exports = router;