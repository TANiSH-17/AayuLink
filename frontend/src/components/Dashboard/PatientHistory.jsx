import React, { useMemo } from 'react';
import MedicalRecordCard from '../MedicalRecordCard'; // This path assumes MedicalRecordCard.jsx is in the parent components folder
import { Heart, Brain, Activity, PersonStanding } from 'lucide-react';

// --- DYNAMIC Health Visualizer Component (Now with safety checks) ---
function HealthVisualizer({ medicalHistory }) {
  const healthFlags = useMemo(() => {
    // --- THIS IS THE FIX ---
    // This now safely filters out any records that might be missing data.
    // The `?.` (optional chaining) and `|| ''` (default value) prevent crashes.
    const historyText = medicalHistory
      .map(r => (r.details?.toLowerCase() || '') + (r.recordType?.toLowerCase() || ''))
      .join(' ');

    const flags = { cardiovascular: 'ok', respiratory: 'ok', mental: 'ok', lifestyle: 'ok' };

    if (/heart|blood pressure|cholesterol|angina|cardio/.test(historyText)) flags.cardiovascular = 'concern';
    if (/asthma|respiratory|breathing|lungs|bronchitis/.test(historyText)) flags.respiratory = 'concern';
    if (/anxiety|mental|counseling|migraine|headache|stress|depression/.test(historyText)) flags.mental = 'concern';
    if (/fracture|injury|sprain|physiotherapy|sedentary/.test(historyText)) flags.lifestyle = 'concern';

    return flags;
  }, [medicalHistory]);

  const getStatusColor = (status) => {
    if (status === 'concern') return 'bg-yellow-100 text-yellow-800 ring-yellow-300';
    return 'bg-green-100 text-green-800 ring-green-300';
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">AI-Powered Health Visualizer</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className={`p-3 rounded-lg ring-2 ${getStatusColor(healthFlags.cardiovascular)}`}><Heart className="mx-auto h-8 w-8" /><p className="mt-2 text-xs font-semibold">Cardio</p></div>
        <div className={`p-3 rounded-lg ring-2 ${getStatusColor(healthFlags.respiratory)}`}><Activity className="mx-auto h-8 w-8" /><p className="mt-2 text-xs font-semibold">Respiratory</p></div>
        <div className={`p-3 rounded-lg ring-2 ${getStatusColor(healthFlags.mental)}`}><Brain className="mx-auto h-8 w-8" /><p className="mt-2 text-xs font-semibold">Mental</p></div>
        <div className={`p-3 rounded-lg ring-2 ${getStatusColor(healthFlags.lifestyle)}`}><PersonStanding className="mx-auto h-8 w-8" /><p className="mt-2 text-xs font-semibold">Lifestyle</p></div>
      </div>
    </div>
  );
}

// --- Main Patient History Page ---
export default function PatientHistory({ patientData }) {
  // Correctly destructure personalInfo from patientData to access nested details
  const { personalInfo, medicalHistory, abhaId } = patientData;

  return (
    <div className="space-y-8">
      {/* Patient Info Card */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">{personalInfo.name}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div><strong className="block text-gray-500">Age:</strong> {personalInfo.age}</div>
          <div><strong className="block text-gray-500">Gender:</strong> {personalInfo.gender}</div>
          <div><strong className="block text-gray-500">Blood Type:</strong> <span className="font-mono text-red-600 font-bold">{personalInfo.bloodType}</span></div>
          <div><strong className="block text-gray-500">ABHA ID:</strong> {abhaId}</div>
        </div>
      </div>

      {/* Health Visualizer */}
      <HealthVisualizer medicalHistory={medicalHistory} />

      {/* Medical History Timeline */}
      <div>
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Complete Medical History</h3>
        <div className="space-y-4">
          {medicalHistory.map(record => (
            <MedicalRecordCard key={record._id || record.recordId} record={record} />
          ))}
        </div>
      </div>
    </div>
  );
}

