const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const multer = require('multer');
const path = require('path');
const Patient = require('../models/patient');
const MedicalRecord = require('../models/medicalRecord');

const router = express.Router();

// --- AI Model Initialization ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// --- MULTER CONFIGURATION FOR FILE UPLOADS ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });


// --- DATABASE-CONNECTED ROUTES ---

router.post('/fetch-records', async (req, res) => {
  try {
    const { abhaId } = req.body;
    if (!abhaId) return res.status(400).json({ error: 'ABHA ID is required.' });

    const patient = await Patient.findOne({ abhaId: abhaId });
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
      medicalHistory: medicalHistory,
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
    const { abhaId } = req.body;
    if (!abhaId) return res.status(400).json({ error: 'ABHA ID is required.' });

    const patient = await Patient.findOne({ abhaId: abhaId });

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


// --- NEW ADMIN WRITE ROUTES ---

router.post('/medical-history/add', async (req, res) => {
  const { abhaId, entry } = req.body;

  if (!abhaId || !entry || !entry.summary) {
    return res.status(400).json({ message: 'ABHA ID and a valid entry object are required.' });
  }

  try {
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
    const newReport = {
      type: reportType || 'General Report',
      date: reportDate || new Date(),
      fileName: file.filename,
      filePath: file.path,
      format: file.mimetype,
    };

    const updatedPatient = await Patient.findOneAndUpdate(
      { abhaId: abhaId },
      { $push: { reportsAndScans: { $each: [newReport], $position: 0 } } },
      { new: true }
    );

    if (!updatedPatient) {
      return res.status(404).json({ message: 'Patient not found.' });
    }

    res.status(200).json({ message: 'Report uploaded successfully.', patient: updatedPatient });
  } catch (error) {
    console.error("Error uploading report:", error);
    res.status(500).json({ message: 'Server error while uploading report.', error: error.message });
  }
});


// --- AI Routes ---

router.post('/summarize', async (req, res) => {
  const { medicalRecords } = req.body;
  if (!medicalRecords || medicalRecords.length === 0) return res.status(400).json({ error: 'Medical records are required.' });
  const recordsText = medicalRecords.map(r => `Date: ${r.date}, Type: ${r.recordType}, Details: ${r.details}`).join('\n---\n');
  const prompt = `Summarize these medical records for a busy doctor:\n${recordsText}`;
  try {
    const result = await model.generateContent(prompt);
    res.status(200).json({ summary: result.response.text() });
  } catch (error) {
    console.error("Error generating summary:", error);
    res.status(500).json({ error: 'Failed to generate summary.' });
  }
});

// ✅ --- UPDATED AND IMPROVED AI CHAT ROUTE ---
router.post('/chat', async (req, res) => {
  const { medicalRecords, reportsAndScans, question } = req.body;

  if (!medicalRecords || !question) {
    return res.status(400).json({ error: 'Medical records and a question are required.' });
  }

  const historyText = medicalRecords.map(r => `On ${new Date(r.date).toLocaleDateString()}, a ${r.recordType} from ${r.hospitalName} stated: "${r.details}"`).join('\n');
  
  const reportsText = reportsAndScans && reportsAndScans.length > 0
    ? reportsAndScans.map(r => `- ${r.type} (${r.fileName}) dated ${new Date(r.date).toLocaleDateString()}`).join('\n')
    : "No reports or scans are available for this patient.";

  const prompt = `
    You are an expert AI medical assistant. Your role is to analyze a patient's complete health record (history and available scans) and provide concise, data-driven insights to a qualified doctor.

    --- PATIENT'S CHRONOLOGICAL MEDICAL HISTORY ---
    ${historyText}

    --- AVAILABLE REPORTS AND SCANS ---
    ${reportsText}

    --- DOCTOR'S QUESTION ---
    "${question}"

    --- YOUR TASK ---
    Based on ALL the information above, provide a response with three distinct, clearly labeled sections:
    1.  **Direct Answer:** Directly answer the doctor's question. If the information isn't in the provided text or reports, state that clearly.
    2.  **Future Outlook:** Based on the patient's complete record, identify 1-2 potential future health risks. Briefly state your reasoning in one sentence. (e.g., "Potential risk of developing X due to Y.")
    3.  **Suggested Questions:** List 2 intelligent, open-ended follow-up questions the doctor could ask the patient to get a clearer clinical picture.

    IMPORTANT: You are assisting a medical professional. Do not give a definitive diagnosis. Frame possibilities as "consider..." or "potential risk of...". Keep your response structured, professional, and concise.
  `;

  try {
    const result = await model.generateContent(prompt);
    res.status(200).json({ answer: result.response.text() });
  } catch (error) {
    console.error("Error in AI chat:", error);
    res.status(500).json({ error: 'Failed to get answer from the AI.' });
  }
});

router.post('/blueprint', async (req, res) => {
  const { medicalRecords } = req.body;
  if (!medicalRecords || medicalRecords.length === 0) return res.status(400).json({ error: 'Medical records are required.' });
  const recordsText = medicalRecords.map(r => `On ${r.date}, a ${r.recordType} from ${r.hospitalName} stated: "${r.details}"`).join('\n');
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