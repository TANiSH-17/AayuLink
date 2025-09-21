const express = require('express');
const router = express.Router();
const Patient = require('../models/patient');
const User = require('../models/user');
const Hospital = require('../models/hospital');
const dbConnect = require('../lib/dbConnect'); // ✅ 1. IMPORT THE DB CONNECTION HELPER

router.post('/create', async (req, res) => {
  await dbConnect(); // ✅ 2. ENSURE DB IS CONNECTED

  const { abhaId, hospitalCode, personalInfo, criticalInfo } = req.body;

  if (!abhaId || !hospitalCode || !personalInfo) {
    return res.status(400).json({ message: 'Missing required fields for patient creation.' });
  }

  try {
    const hospital = await Hospital.findOne({ code: hospitalCode.toUpperCase() });
    if (!hospital) {
      return res.status(401).json({ message: 'Invalid Hospital Code. You are not authorized.' });
    }

    const existingPatient = await Patient.findOne({ abhaId });
    if (existingPatient) {
      return res.status(400).json({ message: 'A patient with this ABHA ID already exists.' });
    }

    const newPatient = new Patient({
      abhaId,
      personalInfo,
      allergies: criticalInfo.allergies || [],
      chronicConditions: criticalInfo.chronicConditions || [],
      registeredAtHospital: hospital.name 
    });
    await newPatient.save();
    
    res.status(201).json({ message: 'Patient record created successfully!' });

  } catch (error) {
    console.error("Error creating new patient:", error);
    res.status(500).json({ message: 'Server error during patient creation.' });
  }
});

module.exports = router;