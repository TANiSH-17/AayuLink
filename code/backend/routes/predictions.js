const express = require('express');
const Prediction = require('../models/Prediction');
const dbConnect = require('../lib/dbConnect'); // ✅ 1. IMPORT THE DB CONNECTION HELPER
const router = express.Router();

// GET /api/predictions
// Fetches the latest predictions to show on the dashboard
router.get('/', async (req, res) => {
    try {
        await dbConnect(); // ✅ 2. ENSURE DB IS CONNECTED

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