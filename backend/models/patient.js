const mongoose = require('mongoose');

const personalInfoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  bloodType: { type: String, required: true },
  emergencyContact: { type: String, required: true },
  personalNumber: { type: String, required: true }
}, { _id: false });

// --- THIS IS THE FIX (PART 1) ---
// Define the structure for a single report or scan.
const reportSchema = new mongoose.Schema({
    type: { type: String, required: true },
    date: { type: Date, required: true },
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    format: { type: String, required: true },
    textContent: { type: String, default: '' } 
}, { _id: false });


const patientSchema = new mongoose.Schema({
  abhaId: { type: String, required: true, unique: true },
  personalInfo: { type: personalInfoSchema, required: true },
  registeredAtHospital: { 
    type: String, 
    required: true 
  },
  allergies: [{ type: String }],
  chronicConditions: [{ type: String }],
  currentMedications: [{
    name: { type: String, required: true },
    dosage: { type: String, required: true }
  }],
  // --- THIS IS THE FIX (PART 2) ---
  // Add the reportsAndScans array to the schema, using the structure defined above.
  reportsAndScans: [reportSchema]
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);
