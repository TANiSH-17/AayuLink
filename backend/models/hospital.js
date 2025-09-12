const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  // A descriptive name for the hospital, e.g., "Apollo Hospital, Mumbai"
  name: {
    type: String,
    required: [true, 'A hospital name is required for registration.'],
    trim: true
  },
  // The unique code used for admin registration
  code: {
    type: String,
    required: [true, 'A special hospital code is required.'],
    unique: true, // Ensures no two hospitals can have the same code
    trim: true,
    uppercase: true, // Automatically converts codes to uppercase for consistency
  }
}, { timestamps: true });

module.exports = mongoose.model('Hospital', hospitalSchema);

