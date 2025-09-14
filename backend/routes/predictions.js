const express = require('express');
const Prediction = require('../models/Prediction');
const router = express.Router();

// GET /api/predictions
// Fetches the latest predictions to show on the dashboard
router.get('/', async (req, res) => {
    try {
        const forecasts = await Prediction.find({
            predictedDate: { $gte: new Date() } // Only get upcoming predictions
        }).sort({ location: 1 });

        res.status(200).json(forecasts);
    } catch (error) {
        console.error("Error fetching predictions:", error);
        res.status(500).json({ message: "Failed to fetch predictions." });
    }
});

module.exports = router;