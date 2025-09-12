const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Patient = require('../models/patient');
const MedicalRecord = require('../models/medicalRecord');

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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


// --- AI Routes (No changes needed) ---
router.post('/summarize', async (req, res) => { /* ... */ });
router.post('/chat', async (req, res) => { /* ... */ });
router.post('/blueprint', async (req, res) => { /* ... */ });

module.exports = router;

