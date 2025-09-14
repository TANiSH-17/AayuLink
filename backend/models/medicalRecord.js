const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  patient: { 
    type: String, 
    ref: 'Patient',
    required: true 
  },
  date: { type: Date, required: true },
  recordType: {
    type: String,
    required: true,
    enum: [
      'Birth Record', 'Vaccination', 'Pediatric Visit', 'Injury', 'Lab Report',
      'Dental', 'Emergency Visit', 'Hospitalization', 'Vision Check', 'Childhood Illness',
      'Mental Health', 'Gynecology Visit', 'Nutrition Counseling', 'Neurology Visit',
      'e-Prescription Issued',
      'Sports Injury', 'Consultation', 'Diagnosis', 'Procedure', 'Allergy', 'Immunization'
    ]
  },
  hospitalName: { type: String, required: true },
  doctor: { type: String, required: true },
  details: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
