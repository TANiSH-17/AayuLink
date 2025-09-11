import React from 'react';
import { X } from 'lucide-react';

export default function EmergencyDetailModal({ patientData, onClose }) {
  if (!patientData) return null;

  const { personalInfo, criticalInfo } = patientData;

  return (
    // This is the full-screen overlay
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      
      {/* This is the main modal content window */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all">
        {/* Red Header */}
        <div className="bg-red-600 p-4 rounded-t-xl text-white flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-wider uppercase">Emergency Details</h1>
            <p className="text-sm text-red-100">This is a summary of critical patient information.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-red-700">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {/* White Content Area */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg">
            <div className="border border-gray-200 p-4 rounded-lg">
              <h3 className="text-gray-500 text-sm font-bold uppercase">Patient Name</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">{personalInfo.name}</p>
            </div>
            <div className="border border-gray-200 p-4 rounded-lg">
              <h3 className="text-gray-500 text-sm font-bold uppercase">Blood Type</h3>
              <p className="text-2xl font-bold text-red-600 mt-1">{personalInfo.bloodType}</p>
            </div>
          </div>
          <div className="border border-gray-200 p-4 rounded-lg">
            <h3 className="text-gray-500 text-sm font-bold uppercase">Known Allergies</h3>
            <p className="text-xl font-semibold text-red-600 mt-1">{criticalInfo.allergies.join(', ') || 'None Reported'}</p>
          </div>
          <div className="border border-gray-200 p-4 rounded-lg">
            <h3 className="text-gray-500 text-sm font-bold uppercase">Chronic Conditions</h3>
            <p className="text-xl font-semibold text-gray-900 mt-1">{criticalInfo.chronicConditions.join(', ') || 'None Reported'}</p>
          </div>
          <div className="border border-gray-200 p-4 rounded-lg">
            <h3 className="text-gray-500 text-sm font-bold uppercase">Emergency Contact</h3>
            <p className="text-xl font-semibold text-gray-900 mt-1">{personalInfo.emergencyContact}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
