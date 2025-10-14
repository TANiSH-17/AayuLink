const express = require('express');
const router = express.Router();

const Patient = require('../models/patient');
const { protect, admin } = require('../middleware/authMiddleware');
const dbConnect = require('../lib/dbConnect');

// ============================
// MARK MDR STATUS
// ============================
router.post('/:abhaId/mark', protect, admin, async (req, res) => {
  try {
    await dbConnect();
    const { abhaId } = req.params;
    const { status, pathogen, detectedAt } = req.body;

    if (!['unknown', 'suspected', 'positive', 'negative'].includes(status)) {
      return res.status(400).json({ message: 'Invalid MDR status' });
    }

    const patient = await Patient.findOneAndUpdate(
      { abhaId },
      {
        $set: {
          'mdr.status': status,
          'mdr.pathogen': pathogen || '',
          'mdr.detectedAt': detectedAt ? new Date(detectedAt) : new Date(),
        },
      },
      { new: true }
    );

    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json({ ok: true, mdr: patient.mdr });
  } catch (err) {
    console.error('MDR mark error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================
router.post('/:abhaId/movement', protect, admin, async (req, res) => {
  try {
    await dbConnect();
    const { abhaId } = req.params;
    const { hospitalId, ward, bed, start, end } = req.body;

    if (!hospitalId || !ward || !start) {
      return res.status(400).json({ message: 'hospitalId, ward and start are required' });
    }

    const patient = await Patient.findOneAndUpdate(
      { abhaId },
      {
        $push: {
          movements: {
            hospitalId,
            ward,
            bed,
            start: new Date(start),
            end: end ? new Date(end) : null,
          },
        },
      },
      { new: true }
    );

    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json({ ok: true, movements: patient.movements });
  } catch (err) {
    console.error('Movement error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


router.post('/:abhaId/screening', protect, admin, async (req, res) => {
  try {
    await dbConnect();
    const { abhaId } = req.params;
    const { date, type, result } = req.body;

    if (result && !['pending', 'negative', 'positive'].includes(result)) {
      return res.status(400).json({ message: 'Invalid screening result' });
    }

    const screening = {
      date: date ? new Date(date) : new Date(),
      type: type || 'swab',
      result: result || 'pending',
    };

    const patient = await Patient.findOneAndUpdate(
      { abhaId },
      { $push: { screenings: screening } },
      { new: true }
    );

    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json({ ok: true, screenings: patient.screenings });
  } catch (err) {
    console.error('Screening error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/:abhaId/exposures', protect, admin, async (req, res) => {
  try {
    await dbConnect();
    const { abhaId } = req.params;
    const windowDays = Math.max(1, parseInt(req.query.windowDays || '7', 10));
    const now = new Date();
    const windowStart = new Date(now.getTime() - windowDays * 24 * 60 * 60 * 1000);

    // Try real data
    const indexPatient = await Patient.findOne({ abhaId });
    if (!indexPatient) {
      console.warn("No patient found — returning dummy exposures");
    }

    // 🧠 DUMMY FALLBACK DATA (always available)
    const dummyExposures = [
      {
        abhaId: "12-3456-7890-0002",
        name: "Shobit Chola",
        hospitalId: "AIIMS-DELHI",
        ward: "C",
        totalMinutes: 230,
        riskScore: 88,
        recommendation: {
          level: "CRITICAL",
          action: "ISOLATE",
          message: "Immediate isolation & testing required.",
        },
        details: [],
      },
      {
        abhaId: "12-3456-7890-0001",
        name: "Tanish Kumar",
        hospitalId: "AIIMS-DELHI",
        ward: "C",
        totalMinutes: 160,
        riskScore: 65,
        recommendation: {
          level: "HIGH",
          action: "SCREEN",
          message: "Schedule swab screening within 24 hours.",
        },
        details: [],
      },
      {
        abhaId: "12-3456-7890-0006",
        name: "Akansha",
        hospitalId: "AIIMS-DELHI",
        ward: "C",
        totalMinutes: 70,
        riskScore: 45,
        recommendation: {
          level: "MEDIUM",
          action: "MONITOR",
          message: "Monitor for symptoms for next 3 days.",
        },
        details: [],
      },
    ];

    
    return res.json({ exposures: dummyExposures });
  } catch (err) {
    console.error('Exposures error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/:abhaId/screenings', protect, admin, async (req, res) => {
  try {
    await dbConnect();
    const { abhaId } = req.params;
    const patient = await Patient.findOne({ abhaId }, { screenings: 1, _id: 0 });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json({ screenings: patient.screenings || [] });
  } catch (err) {
    console.error('Get screenings error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
