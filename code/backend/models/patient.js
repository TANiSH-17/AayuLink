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
 * Report / Scan subdocument (existing)
 * - We keep your original fields (fileName, format, textContent, filePath)
 * - We add Cloudinary fields (fileUrl, filePublicId, fileMimeType).
 */
const reportSchema = new mongoose.Schema({
  type:        { type: String, required: true },
  date:        { type: Date,   required: true },

  fileName:    { type: String, required: true },
  format:      { type: String, required: true },  // e.g., 'pdf', 'png'
  textContent: { type: String, default: '' },

  // legacy/front-end compatibility: keep this but store Cloudinary URL in it
  filePath:    { type: String, required: true },

  // Cloudinary fields (NEW)
  fileUrl:      { type: String },     // same as filePath, for clarity going forward
  filePublicId: { type: String },     // needed for deletes/updates
  fileMimeType: { type: String },     // e.g., 'application/pdf'
}, { timestamps: true });

/** NEW: MDR sub-objects **/
const movementSchema = new mongoose.Schema({
  hospitalId: { type: String, required: true },
  ward:       { type: String, required: true },
  bed:        { type: String },
  start:      { type: Date,   required: true },
  end:        { type: Date }, // null/undefined means still admitted
}, { _id: false });

const screeningSchema = new mongoose.Schema({
  date:   { type: Date, default: Date.now },
  type:   { type: String, default: 'swab' },              // swab/culture/etc.
  result: { type: String, enum: ['pending','negative','positive'], default: 'pending' }
}, { _id: false });

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

  // NEW: MDR fields (additive, non-breaking)
  mdr: {
    status:     { type: String, enum: ['unknown','suspected','positive','negative'], default: 'unknown' },
    pathogen:   { type: String, default: '' },             // e.g., MRSA/CRE/ESBL
    detectedAt: { type: Date }
  },
  movements:   [movementSchema],
  screenings:  [screeningSchema],

  // existing reports & scans
  reportsAndScans: [reportSchema]
}, { timestamps: true });

// Optional helpful indexes (not required for demo)
// patientSchema.index({ "movements.hospitalId": 1, "movements.ward": 1, "movements.start": 1, "movements.end": 1 });
// patientSchema.index({ "mdr.status": 1 });

module.exports = mongoose.model('Patient', patientSchema);
