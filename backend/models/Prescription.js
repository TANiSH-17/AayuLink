const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  duration: { type: String},
});

const prescriptionSchema = new mongoose.Schema({
  patientName: { type: String, required: true },
  patientAbhaId: { type: String, required: true },
  doctorName: { type: String, required: true },
  hospitalName: { type: String, required: true },
  medications: [medicationSchema],
  token: { type: String, required: true, unique: true },
  status: {
    type: String,
    enum: ['Pending', 'Fulfilled', 'Expired'],
    default: 'Pending',
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Prescription', prescriptionSchema);
