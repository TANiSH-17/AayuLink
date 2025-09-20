import React, { useState, useMemo } from 'react';
// Corrected import paths to be absolute, ensuring the build system finds them.
import MedicalRecordCard from '/src/components/MedicalRecordCard.jsx';
import AddHistoryModal from '/src/components/Dashboard/AddHistoryModal.jsx';
import { Heart, Brain, Activity, PersonStanding, Plus } from 'lucide-react';

// HealthVisualizer component remains the same.
function HealthVisualizer({ medicalHistory }) {
    // ... (no changes inside this component)
    const healthFlags = useMemo(() => {
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
// 1. FIX: Receive `currentUser` prop instead of `userRole`
export default function PatientHistory({ patientData, currentUser, onDataRefresh }) {
  
  // --- DEBUGGING LINE ADDED ---
  console.log('2. Prop received in PatientHistory:', currentUser);

  const { personalInfo, medicalHistory, abhaId } = patientData;
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 2. FIX: Check the role from within the `currentUser` object
  const isAdmin = currentUser?.role === 'admin';

  const handleHistoryAdded = () => {
    onDataRefresh();
    setIsModalOpen(false);
  };

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

      <HealthVisualizer medicalHistory={medicalHistory} />

      <div>
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-semibold text-gray-800">Complete Medical History</h3>
            {/* This button will now correctly appear for admins */}
            {isAdmin && (
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-sm hover:bg-green-700 transition-all duration-200"
                >
                    <Plus size={18} />
                    Add New Entry
                </button>
            )}
        </div>
        <div className="space-y-4">
          {medicalHistory && medicalHistory.length > 0 ? (
            medicalHistory.map(record => (
              <MedicalRecordCard key={record._id || record.recordId} record={record} />
            ))
          ) : (
            <div className="text-center py-10 px-4 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No medical history recorded yet.</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <AddHistoryModal 
            abhaId={abhaId}
            onClose={() => setIsModalOpen(false)}
            onHistoryAdded={handleHistoryAdded}
            // 3. FIX: Pass the hospital name from the currentUser object
            hospitalName={currentUser?.hospitalName}
        />
      )}
    </div>
  );
}
