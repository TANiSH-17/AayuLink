const express = require('express');
const router = express.Router();

const Patient = require('../models/patient');
const { protect, admin } = require('../middleware/authMiddleware');
const dbConnect = require('../lib/dbConnect');

// Mark MDR status
// POST /api/mdr/:abhaId/mark
// body: { status, pathogen, detectedAt }
router.post('/:abhaId/mark', protect, admin, async (req, res) => {
  try {
    await dbConnect();
    const { abhaId } = req.params;
    const { status, pathogen, detectedAt } = req.body;

    if (!['unknown','suspected','positive','negative'].includes(status)) {
      return res.status(400).json({ message: 'Invalid MDR status' });
    }

    const patient = await Patient.findOneAndUpdate(
      { abhaId },
      { 
        $set: { 
          'mdr.status': status, 
          'mdr.pathogen': pathogen || '', 
          'mdr.detectedAt': detectedAt ? new Date(detectedAt) : new Date()
        } 
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

// Log movement
// POST /api/mdr/:abhaId/movement
// body: { hospitalId, ward, bed?, start, end? }
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
      { $push: { movements: { hospitalId, ward, bed, start: new Date(start), end: end ? new Date(end) : null } } },
      { new: true }
    );
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    res.json({ ok: true, movements: patient.movements });
  } catch (err) {
    console.error('Movement error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add screening
// POST /api/mdr/:abhaId/screening
// body: { date?, type?, result? }
router.post('/:abhaId/screening', protect, admin, async (req, res) => {
  try {
    await dbConnect();
    const { abhaId } = req.params;
    const { date, type, result } = req.body;

    if (result && !['pending','negative','positive'].includes(result)) {
      return res.status(400).json({ message: 'Invalid screening result' });
    }

    const screening = {
      date: date ? new Date(date) : new Date(),
      type: type || 'swab',
      result: result || 'pending'
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

// Compute exposures (same-ward time overlap within windowDays)
// GET /api/mdr/:abhaId/exposures?windowDays=7
router.get('/:abhaId/exposures', protect, admin, async (req, res) => {
  try {
    await dbConnect();
    const { abhaId } = req.params;
    const windowDays = Math.max(1, parseInt(req.query.windowDays || '7', 10));
    const now = new Date();
    const windowStart = new Date(now.getTime() - windowDays * 24 * 60 * 60 * 1000);

    const indexPatient = await Patient.findOne({ abhaId });
    if (!indexPatient) return res.status(404).json({ message: 'Patient not found' });

    // Filter index movements within window
    const idxMoves = (indexPatient.movements || []).filter(m => {
      const mStart = new Date(m.start);
      const mEnd = m.end ? new Date(m.end) : now;
      return mEnd >= windowStart && mStart <= now;
    });

    if (idxMoves.length === 0) {
      return res.json({ exposures: [] });
    }

    // Fetch potential contacts in same hospital(s) / ward(s) in one go (broad filter)
    const hospitals = [...new Set(idxMoves.map(m => m.hospitalId))];
    const wards     = [...new Set(idxMoves.map(m => m.ward))];

    const candidates = await Patient.find({
      abhaId: { $ne: abhaId },
      'movements.hospitalId': { $in: hospitals },
      'movements.ward': { $in: wards },
      // coarse time window filter (exact overlap calc below)
      'movements.start': { $lte: now },
      $or: [
        { 'movements.end': { $gte: windowStart } },
        { 'movements.end': { $exists: false } },
        { 'movements.end': null }
      ]
    }, { abhaId: 1, personalInfo: 1, movements: 1 });

    const exposuresMap = new Map();

    const overlapMinutes = (aStart, aEnd, bStart, bEnd) => {
      const start = new Date(Math.max(+aStart, +bStart));
      const end   = new Date(Math.min(+aEnd, +bEnd));
      const diff = (end - start) / (60 * 1000);
      return diff > 0 ? { start, end, minutes: Math.round(diff) } : null;
    };

    for (const other of candidates) {
      for (const im of idxMoves) {
        const ia = new Date(im.start);
        const ib = im.end ? new Date(im.end) : now;

        for (const om of (other.movements || [])) {
          if (om.hospitalId !== im.hospitalId || om.ward !== im.ward) continue;
          const oa = new Date(om.start);
          const ob = om.end ? new Date(om.end) : now;

          const hit = overlapMinutes(ia, ib, oa, ob);
          if (hit) {
            if (!exposuresMap.has(other.abhaId)) {
              exposuresMap.set(other.abhaId, {
                abhaId: other.abhaId,
                name: other.personalInfo?.name || '',
                details: [], // list of overlaps
                totalMinutes: 0
              });
            }
            const rec = exposuresMap.get(other.abhaId);
            rec.details.push({
              hospitalId: im.hospitalId,
              ward: im.ward,
              overlapStart: hit.start,
              overlapEnd: hit.end,
              minutes: hit.minutes
            });
            rec.totalMinutes += hit.minutes;
          }
        }
      }
    }

    const exposures = Array.from(exposuresMap.values())
      .sort((a, b) => b.totalMinutes - a.totalMinutes);

    res.json({ exposures });
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
