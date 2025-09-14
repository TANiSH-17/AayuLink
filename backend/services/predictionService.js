const axios = require('axios');
const Prediction = require('../models/Prediction');
const MedicalRecord = require('../models/medicalRecord');

// IMPORTANT: Sign up for a FREE API key at https://openweathermap.org/
const WEATHER_API_KEY = process.env.OPENWEATHER_API_KEY; 

// A simple rule-based AI to generate predictions
async function generatePrediction(disease, location, lat, lon) {
  try {
    // 1. Fetch live weather data for the location
    const weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`);
    const humidity = weatherResponse.data.main.humidity; // e.g., 85
    const temp = weatherResponse.data.main.temp;         // e.g., 29.5

    // 2. Simulate fetching and analyzing internal health data
    // In a real system, this would be a complex database query. We'll simulate it.
    const recentSymptomCount = await MedicalRecord.countDocuments({
        details: { $regex: /fever|dengue/i }, // A simple search for keywords
        createdAt: { $gte: new Date(new Date() - 7 * 24 * 60 * 60 * 1000) } // in the last 7 days
    });
    const symptomSpike = recentSymptomCount > 10; // Simple threshold for spike

    // 3. The "AI" Logic: A simple but effective rule set
    let riskLevel = 'Low';
    let reasoning = `Normal environmental and symptom levels. Current Temp: ${temp}°C, Humidity: ${humidity}%.`;

    if (disease === 'Dengue' && humidity > 75 && temp > 28 && symptomSpike) {
        riskLevel = 'High';
        reasoning = `High Risk detected due to a combination of factors: high humidity (${humidity}%), warm temperatures (${temp}°C), and a recent spike in reported fever symptoms.`;
    } else if (disease === 'Dengue' && humidity > 70) {
        riskLevel = 'Medium';
        reasoning = `Elevated risk detected. Conditions are favorable for mosquito breeding with high humidity (${humidity}%).`;
    }

    // 4. Create or update the prediction in the database
    const predictionDate = new Date();
    predictionDate.setDate(predictionDate.getDate() + 7); // Predict 7 days into the future

    const prediction = await Prediction.findOneAndUpdate(
        { disease, location, predictedDate: { $gte: new Date() } }, // Find an existing prediction for today or future
        {
            riskLevel,
            reasoning,
            predictedDate: predictionDate,
            generatedAt: new Date()
        },
        { upsert: true, new: true } // `upsert: true` creates a new one if none is found
    );

    console.log(`[Prediction Service] Generated forecast for ${disease} in ${location}: ${riskLevel}`);
    return prediction;

  } catch (error) {
    console.error(`[Prediction Service] Failed to generate prediction for ${location}:`, error.message);
  }
}

// Function to run the prediction model for multiple cities
async function runPredictionModel() {
    console.log('[Prediction Service] Running hourly prediction model...');
    // In a real app, you'd have a list of cities from a database
    await generatePrediction('Dengue', 'New Delhi, IN', 28.6139, 77.2090);
    await generatePrediction('Dengue', 'Mumbai, IN', 19.0760, 72.8777);
    await generatePrediction('Dengue', 'Chennai, IN', 13.0827, 80.2707);
}

module.exports = { runPredictionModel };