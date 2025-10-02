const mongoose = require('mongoose');

const personalInfoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  bloodType: { type: String, required: true },
  emergencyContact: { type: String, required: true },
  personalNumber: { type: String, required: true }
}, { _id: false });

/**
 * Report / Scan subdocument
 * Notes:
 * - We keep your original fields (fileName, format, textContent, filePath) so the frontend doesn’t break.
 * - We add Cloudinary fields (fileUrl, filePublicId, fileMimeType).
 * - `filePath` will be set to the same value as Cloudinary `secure_url` so existing UI that reads `filePath` continues to work.
 */
const reportSchema = new mongoose.Schema({
  type:        { type: String, required: true },
  date:        { type: Date,   required: true },

  // metadata you already had / are using
  fileName:    { type: String, required: true },
  format:      { type: String, required: true },  // e.g., 'pdf', 'png'
  textContent: { type: String, default: '' },

  // legacy/front-end compatibility: keep this but store Cloudinary URL in it
  filePath:    { type: String, required: true },

  // Cloudinary fields (NEW)
  fileUrl:      { type: String },     // same as filePath, for clarity going forward
  filePublicId: { type: String },     // needed for deletes/updates
  fileMimeType: { type: String },     // e.g., 'application/pdf'
}, { timestamps: true }); // keep _id enabled so reports can be referenced by id

const patientSchema = new mongoose.Schema({
  abhaId: { type: String, required: true, unique: true },
  personalInfo: { type: personalInfoSchema, required: true },
  registeredAtHospital: { type: String, required: false },
  allergies: [{ type: String }],
  chronicConditions: [{ type: String }],
  currentMedications: [{
    name: { type: String, required: true },
    dosage: { type: String, required: true }
  }],

  // reports & scans
  reportsAndScans: [reportSchema]
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);
