const express = require('express');
const crypto = require('crypto');
const Prescription = require('../models/Prescription');
const MedicalRecord = require('../models/medicalRecord');
const Patient = require('../models/patient'); 

const router = express.Router();

const logError = (routeName, error) => {
  console.error(`\n--- ERROR in ${routeName} ---`);
  console.error(`[${new Date().toISOString()}]`, error);
  console.error('--- END ERROR ---\n');
};

router.post('/issue', async (req, res) => {
  const { abhaId, medicines } = req.body;

  if (!abhaId || !medicines || !Array.isArray(medicines) || medicines.length === 0) {
    return res.status(400).json({ message: 'Patient ID and at least one medicine are required.' });
  }

  try {
    const patient = await Patient.findOne({ abhaId: abhaId });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found with the provided ABHA ID.' });
    }

    const token = crypto.randomBytes(16).toString('hex');

    const newPrescription = new Prescription({
      patientAbhaId: abhaId,
      patientName: patient.personalInfo.name,
      medications: medicines,
      token: token,
      status: 'Pending',
      doctorName: 'Dr. Aarogya',
      hospitalName: 'AayuLink Digital Clinic',
    });

    await newPrescription.save();

    const medicationSummary = medicines.map(m => `${m.name} (${m.dosage})`).join(', ');
    const historyRecord = new MedicalRecord({
      // ✅ --- THIS IS THE FIX ---
      // We now generate a unique recordId for the medical history entry.
      recordId: `PRE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      patient: abhaId,
      date: new Date(),
      recordType: "e-Prescription Issued",
      hospitalName: newPrescription.hospitalName,
      doctor: newPrescription.doctorName,
      details: `Issued medications: ${medicationSummary}.`
    });
    await historyRecord.save();

    res.status(201).json(newPrescription);

  } catch (error) {
    logError('/issue', error); 
    res.status(500).json({ message: 'Server error while issuing prescription.' });
  }
});


// --- YOUR EXISTING ROUTES (UNCHANGED) ---

router.post('/create', async (req, res) => {
  try {
    const { patientAbhaId, patientName, doctorName, hospitalName, medications, notes } = req.body;
    const validMedications = medications.filter(m => m && m.name && m.name.trim() !== '');
    if (validMedications.length === 0) {
        return res.status(400).json({ error: 'At least one medication with a name is required.' });
    }
    const token = crypto.createHash('sha256').update(`${patientAbhaId}-${Date.now()}-${Math.random()}`).digest('hex');
    const newPrescription = new Prescription({ patientAbhaId, patientName, doctorName, hospitalName, medications: validMedications, notes, token });
    await newPrescription.save();
    console.log(`[SUCCESS] Step 1/2: E-Prescription document created for ${patientName}.`);
    try {
      const medicationSummary = validMedications.map(m => m.name).join(', ');
      const historyRecord = new MedicalRecord({ recordId: `REC-PRE-${Date.now()}`, patient: patientAbhaId, date: new Date(), recordType: "e-Prescription Issued", hospitalName: hospitalName, doctor: doctorName, details: `Issued medications: ${medicationSummary}. Notes: ${notes || 'N/A'}`});
      await historyRecord.save();
      console.log(`[SUCCESS] Step 2/2: Prescription successfully added to patient's main history.`);
    } catch (historyError) {
        logError('/create (History Save Step)', historyError);
    }
    res.status(201).json(newPrescription);
  } catch (error) {
    logError('/create (Main)', error); 
    res.status(500).json({ error: 'Internal server error: Failed to save prescription.' });
  }
});

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