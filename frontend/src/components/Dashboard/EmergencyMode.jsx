import React from 'react';

export default function EmergencyMode({ patientData }) {
  const { personalInfo, criticalInfo } = patientData;
  return (
    <div>
      <div className="p-4 bg-red-600 rounded-lg text-white text-center mb-8 animate-pulse">
        <h1 className="text-4xl font-bold tracking-wider uppercase">Emergency Mode</h1>
        <p className="mt-2">This information is for immediate medical attention.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-lg">
        <div className="bg-white p-6 rounded-lg border-2 border-red-500">
          <h3 className="text-gray-500 font-bold uppercase tracking-widest">Patient Name</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{personalInfo.name}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border-2 border-red-500">
          <h3 className="text-gray-500 font-bold uppercase tracking-widest">Blood Type</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">{personalInfo.bloodType}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border-2 border-red-500 md:col-span-2">
          <h3 className="text-gray-500 font-bold uppercase tracking-widest">Known Allergies</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">{criticalInfo.allergies.join(', ') || 'None Reported'}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border-2 border-red-500 md:col-span-2">
          <h3 className="text-gray-500 font-bold uppercase tracking-widest">Chronic Conditions</h3>
          <p className="text-2xl font-semibold text-gray-900 mt-2">{criticalInfo.chronicConditions.join(', ') || 'None Reported'}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border-2 border-red-500 md:col-span-2">
          <h3 className="text-gray-500 font-bold uppercase tracking-widest">Emergency Contact</h3>
          <p className="text-2xl font-semibold text-gray-900 mt-2">{personalInfo.emergencyContact}</p>
        </div>
      </div>
    </div>
  );
}
