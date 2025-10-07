const Patient = require('../models/patient');

const WEIGHTS = {
  DURATION: 0.7,
  VULNERABILITY: 0.3,
};

const getVulnerabilityScore = (patient) => {
  const age = patient.personalInfo?.age;
  if ((age && age > 65) || patient.isImmunocompromised) {
    return 1.0;
  }
  return 0.5;
};

const generateRecommendation = (exposure) => {
  const { riskScore } = exposure;
  if (riskScore > 75) {
    return { level: 'CRITICAL', action: 'ISOLATE', message: `Critical risk (${riskScore}%). Recommend immediate isolation and priority screening.` };
  }
  if (riskScore > 50) {
    return { level: 'HIGH', action: 'PRIORITY_SCREENING', message: `High risk (${riskScore}%). Schedule a priority screening within 24 hours.` };
  }
  if (riskScore > 25) {
    return { level: 'MEDIUM', action: 'MONITOR', message: `Medium risk (${riskScore}%). Monitor patient for symptoms.` };
  }
  return null;
};

const calculateExposureRisk = async (indexPatient, windowDays) => {
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowDays * 24 * 60 * 60 * 1000);
  const { abhaId } = indexPatient;

  const idxMoves = (indexPatient.movements || []).filter(m => {
    const mStart = new Date(m.start);
    const mEnd = m.end ? new Date(m.end) : now;
    return mEnd >= windowStart && mStart <= now;
  });

  if (idxMoves.length === 0) return [];

  const hospitals = [...new Set(idxMoves.map(m => m.hospitalId))];
  const wards = [...new Set(idxMoves.map(m => m.ward))];

  const candidates = await Patient.find({
    abhaId: { $ne: abhaId },
    'movements.hospitalId': { $in: hospitals },
    'movements.ward': { $in: wards },
    'movements.start': { $lte: now },
    $or: [{ 'movements.end': { $gte: windowStart } }, { 'movements.end': null }]
  }, { abhaId: 1, personalInfo: 1, movements: 1, isImmunocompromised: 1 });

  const exposuresMap = new Map();

  const getOverlap = (moveA, moveB) => {
    const startA = new Date(moveA.start), endA = moveA.end ? new Date(moveA.end) : now;
    const startB = new Date(moveB.start), endB = moveB.end ? new Date(moveB.end) : now;
    const overlapStart = new Date(Math.max(startA, startB));
    const overlapEnd = new Date(Math.min(endA, endB));
    const minutes = (overlapEnd - overlapStart) / (1000 * 60);
    return minutes > 0 ? { start: overlapStart, end: overlapEnd, minutes: Math.round(minutes) } : null;
  };

  for (const otherPatient of candidates) {
    for (const idxMove of idxMoves) {
      for (const otherMove of (otherPatient.movements || [])) {
        if (idxMove.ward !== otherMove.ward) continue;
        const overlap = getOverlap(idxMove, otherMove);
        if (overlap) {
          if (!exposuresMap.has(otherPatient.abhaId)) {
            exposuresMap.set(otherPatient.abhaId, {
              abhaId: otherPatient.abhaId,
              name: otherPatient.personalInfo?.name || 'N/A',
              totalMinutes: 0,
              riskScore: 0,
              vulnerability: getVulnerabilityScore(otherPatient),
              details: []
            });
          }
          const rec = exposuresMap.get(otherPatient.abhaId);
          rec.totalMinutes += overlap.minutes;
          rec.details.push({ ward: idxMove.ward, ...overlap });
        }
      }
    }
  }

  for (const [abhaId, exposure] of exposuresMap.entries()) {
    const maxDurationForScore = 240;
    const normalizedDuration = Math.min(exposure.totalMinutes / maxDurationForScore, 1.0);
    const score = (normalizedDuration * WEIGHTS.DURATION) + (exposure.vulnerability * WEIGHTS.VULNERABILITY);
    exposure.riskScore = Math.round(score * 100);
    exposure.recommendation = generateRecommendation(exposure);
  }

  return Array.from(exposuresMap.values()).sort((a, b) => b.riskScore - a.riskScore);
};

module.exports = { calculateExposureRisk };