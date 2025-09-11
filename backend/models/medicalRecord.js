const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  recordId: { type: String, required: true, unique: true },
  patient: { 
    type: String, 
    ref: 'Patient',
    required: true 
  },
  date: { type: Date, required: true },
  recordType: {
    type: String,
    required: true,
    // --- FIX: Added 'Sports Injury' to the list of allowed values ---
    enum: [
      'Birth Record', 'Vaccination', 'Pediatric Visit', 'Injury', 'Lab Report',
      'Dental', 'Emergency Visit', 'Hospitalization', 'Vision Check', 'Childhood Illness',
      'Mental Health', 'Gynecology Visit', 'Nutrition Counseling', 'Neurology Visit',
      'e-Prescription Issued',
      'Sports Injury' // <-- The new value is now allowed
    ]
  },
  hospitalName: { type: String, required: true },
  doctor: { type: String, required: true },
  details: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);

