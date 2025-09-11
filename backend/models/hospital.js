// backend/models/Hospital.js
const mongoose = require('mongoose');

const HospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Hospital name is required'],
    unique: true,
    trim: true
  },
  specialCode: {
    type: String,
    required: [true, 'A special code is required for registration'],
    unique: true,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  }
});

module.exports = mongoose.model('Hospital', HospitalSchema);
