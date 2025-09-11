const mongoose = require('mongoose');

const personalInfoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  bloodType: { type: String, required: true },
  emergencyContact: { type: String, required: true }
}, { _id: false });

const patientSchema = new mongoose.Schema({
  abhaId: { type: String, required: true, unique: true },
  personalInfo: { type: personalInfoSchema, required: true },
  
  // --- FIX #1: Changed type from ObjectId to String ---
  // This allows us to store the hospital's name directly.
  registeredAtHospital: { 
    type: String, 
    required: true 
  },
  
  allergies: [{ type: String }],
  chronicConditions: [{ type: String }],
  currentMedications: [{
    name: String,
    dosage: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);
