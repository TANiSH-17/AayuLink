const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Patient = require('../models/patient');
const MedicalRecord = require('../models/medicalRecord');

const router = express.Router();

// --- AI Model Initialization ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// --- MOCK DATA AND SEEDER HAVE BEEN MOVED TO /routes/seedDB.js ---


// --- DATABASE-CONNECTED ROUTES ---

// --- UPDATED: This route now correctly assembles the patientData object from the DB ---
router.post('/fetch-records', async (req, res) => {
  try {
    const { abhaId } = req.body;
    if (!abhaId) return res.status(400).json({ error: 'ABHA ID is required.' });

    const patient = await Patient.findOne({ abhaId: abhaId });
    if (!patient) return res.status(404).json({ error: 'Patient with that ABHA ID not found.' });

    const medicalHistory = await MedicalRecord.find({ patient: abhaId }).sort({ date: -1 });

    // --- THIS IS THE FIX ---
    // We now pass the entire personalInfo object from the database directly,
    // ensuring all nested fields like name, bloodType, and emergencyContact are all included.
    const patientData = {
      abhaId: patient.abhaId,
      personalInfo: patient.personalInfo, // This correctly passes the entire nested object
      criticalInfo: {
        allergies: patient.allergies,
        chronicConditions: patient.chronicConditions,
        currentMedications: patient.currentMedications
      },
      medicalHistory: medicalHistory
    };
    res.status(200).json(patientData);

  } catch (error) {
    console.error("Error in /fetch-records:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// This route correctly looks up a patient's name and personal phone number.
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


// --- AI Routes (These will now receive the correct, live data) ---

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

router.post('/chat', async (req, res) => {
  const { medicalRecords, question } = req.body;
  if (!medicalRecords || !question) return res.status(400).json({ error: 'Records and question are required.' });
  const recordsText = medicalRecords.map(r => `On ${r.date}, a ${r.recordType} stated: "${r.details}"`).join('\n');
  const prompt = `Answer the question based only on these records. If the answer isn't present, say so. Records:\n${recordsText}\n\nQuestion: "${question}"`;
  try {
    const result = await model.generateContent(prompt);
    res.status(200).json({ answer: result.response.text() });
  } catch (error) {
    console.error("Error in AI chat:", error);
    res.status(500).json({ error: 'Failed to get answer.' });
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

