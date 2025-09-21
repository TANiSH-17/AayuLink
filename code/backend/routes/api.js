// backend/routes/api.js
const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdf = require('pdf-parse');

// --- DATABASE MODELS AND CONNECTION HELPER ---
const Patient = require('../models/patient');
const MedicalRecord = require('../models/medicalRecord');
const dbConnect = require('../lib/dbConnect'); // ✅ IMPORT THE DB HELPER

const router = express.Router();

// --- AI Model Initialization ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// --- UPLOADS PATH (absolute) ---
const uploadsDir = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// --- MULTER CONFIGURATION (unchanged) ---
const sanitizeBase = (name) =>
  name
    .replace(/[^a-z0-9-_]+/gi, '_')
    .replace(/_+/g, '_')
    .toLowerCase();

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (_req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = sanitizeBase(path.basename(file.originalname, ext));
    let safe = `${base}${ext}`;
    if (fs.existsSync(path.join(uploadsDir, safe))) {
      safe = `${base}_${Date.now()}${ext}`;
    }
    cb(null, safe);
  }
});
const upload = multer({ storage });

// ------------------------------------
// -------- DATABASE-CONNECTED --------
// ------------------------------------

router.post('/fetch-records', async (req, res) => {
  try {
    await dbConnect(); // ✅ ENSURE DB CONNECTION IS READY
    const { abhaId } = req.body;
    if (!abhaId) return res.status(400).json({ error: 'ABHA ID is required.' });

    const patient = await Patient.findOne({ abhaId });
    if (!patient) return res.status(404).json({ error: 'Patient with that ABHA ID not found.' });

    const medicalHistory = await MedicalRecord.find({ patient: abhaId }).sort({ date: -1 });

    const patientData = {
      abhaId: patient.abhaId,
      personalInfo: patient.personalInfo,
      criticalInfo: {
        allergies: patient.allergies,
        chronicConditions: patient.chronicConditions,
        currentMedications: patient.currentMedications
      },
      medicalHistory,
      reportsAndScans: patient.reportsAndScans || []
    };
    res.status(200).json(patientData);

  } catch (error) {
    console.error("Error in /fetch-records:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

router.post('/patient-lookup', async (req, res) => {
  try {
    await dbConnect(); // ✅ ENSURE DB CONNECTION IS READY
    const { abhaId } = req.body;
    if (!abhaId) return res.status(400).json({ error: 'ABHA ID is required.' });

    const patient = await Patient.findOne({ abhaId });

    if (patient) {
      const phone = patient.personalInfo.personalNumber;
      if (!phone) {
        return res.status(404).json({ error: 'Patient found, but no personal phone number is registered for OTP consent.' });
      }
      res.status(200).json({
        name: patient.personalInfo.name,
        phone: `+91${phone}`
      });
    } else {
      res.status(404).json({ error: 'Patient with that ABHA ID not found.' });
    }
  } catch (error) {
    console.error("Error in /patient-lookup:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// ------------------------------------
// -------- ADMIN WRITE ROUTES --------
// ------------------------------------

router.post('/medical-history/add', async (req, res) => {
  const { abhaId, entry } = req.body;

  if (!abhaId || !entry || !entry.summary) {
    return res.status(400).json({ message: 'ABHA ID and a valid entry object are required.' });
  }

  try {
    await dbConnect(); // ✅ ENSURE DB CONNECTION IS READY
    const newRecord = new MedicalRecord({
      recordId: `REC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      patient: abhaId,
      recordType: entry.type,
      details: entry.summary,
      doctor: entry.doctor,
      hospitalName: entry.hospital,
      date: entry.date,
    });

    await newRecord.save();
    res.status(200).json({ message: 'Medical history updated successfully.', record: newRecord });
  } catch (error) {
    console.error("Error adding medical history:", error);
    res.status(500).json({ message: 'Server error while updating history.', error: error.message });
  }
});

router.post('/reports/upload', upload.single('reportFile'), async (req, res) => {
  const { abhaId, reportType, reportDate } = req.body;
  const file = req.file;

  if (!abhaId || !file) {
    return res.status(400).json({ message: 'ABHA ID and a file are required.' });
  }

  try {
    await dbConnect(); // ✅ ENSURE DB CONNECTION IS READY
    const dataBuffer = fs.readFileSync(path.join(uploadsDir, file.filename));
    const pdfData = await pdf(dataBuffer);

    const newReport = {
      type: reportType || 'General Report',
      date: reportDate || new Date(),
      fileName: file.filename,
      filePath: `uploads/${file.filename}`,
      originalName: file.originalname,
      format: file.mimetype,
      textContent: pdfData.text || '',
    };

    const updatedPatient = await Patient.findOneAndUpdate(
      { abhaId },
      { $push: { reportsAndScans: { $each: [newReport], $position: 0 } } },
      { new: true }
    );

    if (!updatedPatient) {
      return res.status(404).json({ message: 'Patient not found.' });
    }

    res.status(200).json({ message: 'Report uploaded and processed successfully.', patient: updatedPatient });
  } catch (error) {
    console.error("Error uploading and processing report:", error);
    res.status(500).json({ message: 'Server error while processing report.', error: error.message });
  }
});

// -----------------------
// --------  AI  ---------
// -----------------------

router.post('/summarize', async (req, res) => {
  // This route does not access the database, so no dbConnect() is needed.
  const { medicalRecords } = req.body;
  if (!medicalRecords || medicalRecords.length === 0) {
    return res.status(400).json({ error: 'Medical records are required.' });
  }
  const recordsText = medicalRecords
    .map(r => `Date: ${r.date}, Type: ${r.recordType}, Details: ${r.details}`)
    .join('\n---\n');

  const prompt = `Summarize these medical records for a busy doctor:\n${recordsText}`;

  try {
    const result = await model.generateContent(prompt);
    res.status(200).json({ summary: result.response.text() });
  } catch (error) {
    console.error("Error generating summary:", error);
    res.status(500).json({ error: 'Failed to generate summary.' });
  }
});

router.post('/chat', async (req, res) => {
  try {
    await dbConnect(); // ✅ ENSURE DB CONNECTION IS READY (might be needed for fallback)
    const { abhaId, medicalRecords, reportsAndScans, question } = req.body;
    if (!question) return res.status(400).json({ error: 'A question is required.' });

    let records = medicalRecords;
    let reports = reportsAndScans;

    if ((!records || records.length === 0) && abhaId) {
      const patient = await Patient.findOne({ abhaId });
      if (!patient) return res.status(404).json({ error: 'Patient not found.' });

      records = await MedicalRecord.find({ patient: abhaId }).sort({ date: -1 });
      reports = patient.reportsAndScans || [];
    }
    
    // The rest of this function remains unchanged...
    if (!records || records.length === 0) {
      return res.status(400).json({ error: 'No medical records provided or found for this ABHA ID.' });
    }

    const safeReadReportText = async (filePath) => {
      try {
        if (!filePath) return '';
        const filename = path.basename(filePath);
        const abs = path.join(uploadsDir, filename);
        if (!fs.existsSync(abs)) return '';
        const buf = fs.readFileSync(abs);
        const data = await pdf(buf);
        return data.text || '';
      } catch (e) {
        console.warn('PDF parse failed for', filePath, e.message);
        return '';
      }
    };

    const enrichedReports = await Promise.all((reports || []).map(async (r) => {
      if (!r?.filePath) return r;
      if (r.textContent && r.textContent.trim()) return r;
      const text = await safeReadReportText(r.filePath);
      return { ...r, textContent: text };
    }));

    const historyText = records
      .map(r => `On ${new Date(r.date).toLocaleDateString()}, a ${r.recordType} from ${r.hospitalName} stated: "${r.details}"`)
      .join('\n');

    const reportsText = (enrichedReports && enrichedReports.length > 0)
      ? enrichedReports.map(r =>
          `--- START OF REPORT: ${r.type} (${r.fileName || r.filePath}) ---\n` +
          `${r.textContent && r.textContent.trim() ? r.textContent : 'Content could not be extracted.'}\n` +
          `--- END OF REPORT ---`
        ).join('\n\n')
      : 'No reports or scans are available for this patient.';

    const prompt = `
      You are an expert AI medical assistant. Your role is to analyze a patient's complete health record (history and available scans) and provide concise, data-driven insights to a qualified doctor.
      --- PATIENT'S CHRONOLOGICAL MEDICAL HISTORY ---
      ${historyText}
      --- AVAILABLE REPORTS AND SCANS (with content) ---
      ${reportsText}
      --- DOCTOR'S QUESTION ---
      "${question}"
      --- YOUR TASK ---
      Provide: 
      1) Direct Answer, 
      2) Future Outlook (1–2 potential risks with brief reasoning),
      3) Suggested Questions (2 follow-ups).
      Avoid definitive diagnoses; use language like "consider..." or "potential risk of...".
    `;

    const result = await model.generateContent(prompt);
    return res.status(200).json({ answer: result.response.text() });
  } catch (error) {
    console.error('Error in AI chat:', error);
    return res.status(500).json({ error: 'Failed to get answer from the AI.' });
  }
});

router.post('/blueprint', async (req, res) => {
  // This route does not access the database, so no dbConnect() is needed.
  const { medicalRecords } = req.body;
  if (!medicalRecords || medicalRecords.length === 0) {
    return res.status(400).json({ error: 'Medical records are required.' });
  }
  const recordsText = medicalRecords
    .map(r => `On ${r.date}, a ${r.recordType} from ${r.hospitalName} stated: "${r.details}"`)
    .join('\n');

  const prompt = `Analyze the following records. Respond with three headings: "Key Points", "Potential Risks", and "Suggested Questions".\n\nRecords:\n${recordsText}`;

  try {
    const result = await model.generateContent(prompt);
    res.status(200).json({ blueprint: result.response.text() });
  } catch (error) {
    console.error("Error generating blueprint:", error);
    res.status(500).json({ error: 'Failed to generate blueprint.' });
  }
});

module.exports = router;