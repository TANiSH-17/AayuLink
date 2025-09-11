const express = require('express');
const crypto = require('crypto');
const Prescription = require('../models/Prescription');
const MedicalRecord = require('../models/medicalRecord');

const router = express.Router();

// Helper to log errors clearly
const logError = (routeName, error) => {
  console.error(`\n--- ERROR in ${routeName} ---`);
  console.error(`[${new Date().toISOString()}]`, error);
  console.error('--- END ERROR ---\n');
};

// POST /api/prescription/create - Create a new e-prescription
router.post('/create', async (req, res) => {
  try {
    const { patientAbhaId, patientName, doctorName, hospitalName, medications, notes } = req.body;

    const validMedications = medications.filter(m => m && m.name && m.name.trim() !== '');

    if (validMedications.length === 0) {
        return res.status(400).json({ error: 'At least one medication with a name is required.' });
    }
    
    const token = crypto.createHash('sha256').update(`${patientAbhaId}-${Date.now()}-${Math.random()}`).digest('hex');

    const newPrescription = new Prescription({
      patientAbhaId,
      patientName,
      doctorName,
      hospitalName,
      medications: validMedications,
      notes,
      token
    });

    // Save the prescription (Step 1)
    await newPrescription.save();
    console.log(`[SUCCESS] Step 1/2: E-Prescription document created for ${patientName}.`);
    
    // --- FINAL FIX: Using the correct field names for the MedicalRecord model ---
    try {
      const medicationSummary = validMedications.map(m => m.name).join(', ');
      const historyRecord = new MedicalRecord({
          recordId: `REC-PRE-${Date.now()}`,
          patient: patientAbhaId,       // CORRECTED: from patientAbhaId
          date: new Date(),
          recordType: "e-Prescription Issued", // CORRECTED: from type
          hospitalName: hospitalName,     // CORRECTED: from hospital
          doctor: doctorName,
          details: `Issued medications: ${medicationSummary}. Notes: ${notes || 'N/A'}`
      });
      // Save the history record (Step 2)
      await historyRecord.save();
      console.log(`[SUCCESS] Step 2/2: Prescription successfully added to patient's main history.`);
    } catch (historyError) {
        logError('/create (History Save Step)', historyError);
    }
    
    // --- END FINAL FIX ---

    res.status(201).json(newPrescription);

  } catch (error) {
    logError('/create (Main)', error); 
    res.status(500).json({ error: 'Internal server error: Failed to save prescription.' });
  }
});

// GET /api/prescription/verify/:token
router.get('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const prescription = await Prescription.findOne({ token });
    if (!prescription) return res.status(404).json({ error: 'Invalid token.' });
    res.status(200).json(prescription);
  } catch (error) {
    logError('/verify/:token', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/prescription/fulfill/:token
router.post('/fulfill/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const prescription = await Prescription.findOne({ token });
    if (!prescription) return res.status(404).json({ error: 'Not found.' });
    if (prescription.status === 'Fulfilled') return res.status(409).json({ error: 'Already fulfilled.' });
    
    prescription.status = 'Fulfilled';
    await prescription.save();
    res.status(200).json({ message: 'Success', prescription });
  } catch (error) {
    logError('/fulfill/:token', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/prescription/patient/:abhaId
router.get('/patient/:abhaId', async (req, res) => {
    try {
        const { abhaId } = req.params;
        const prescriptions = await Prescription.find({ patientAbhaId: abhaId }).sort({ createdAt: -1 });
        res.status(200).json(prescriptions);
    } catch (error) {
        logError('/patient/:abhaId', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

module.exports = router;

