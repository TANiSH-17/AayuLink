const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  disease: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  riskLevel: {
    type: String,
    required: true,
    enum: ['Low', 'Medium', 'High', 'Critical'],
  },
  // The date we expect the outbreak to spike
  predictedDate: {
    type: Date,
    required: true,
  },
  // The AI's reasoning - this is great for showing judges!
  reasoning: {
    type: String,
    required: true,
  },
  // The date this prediction was generated
  generatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create a compound index to prevent duplicate predictions for the same disease/location/date
predictionSchema.index({ disease: 1, location: 1, predictedDate: 1 }, { unique: true });

module.exports = mongoose.model('Prediction', predictionSchema);