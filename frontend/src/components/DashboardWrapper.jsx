import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PatientDashboard from './PatientDashboard';
import PatientHistory from './PatientHistory';
import PatientReports from './PatientReports'; // ✅ Import the new component

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function DashboardWrapper() {
  const { abhaId } = useParams();
  const navigate = useNavigate();
  const [patientData, setPatientData] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'history', 'reports' ✅ Add 'reports'
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPatientData = async () => {
      // ... (existing fetch logic remains the same)
    };
    fetchPatientData();
  }, [abhaId]);

  if (isLoading) return <div className="text-center p-8">Loading patient data...</div>;
  if (error) return <div className="text-center p-8 text-red-600">{error}</div>;
  if (!patientData) return <div className="text-center p-8">No patient data available.</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-xl p-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">{patientData.personalInfo.name}</h1>
        <p className="text-gray-600 text-lg mb-6">ABHA ID: {patientData.abhaId}</p>

        <nav className="flex space-x-4 border-b pb-4 mb-6">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`px-4 py-2 rounded-md font-semibold ${activeTab === 'dashboard' ? 'bg-green-600 text-white' : 'text-gray-700 hover:bg-gray-200'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('history')} 
            className={`px-4 py-2 rounded-md font-semibold ${activeTab === 'history' ? 'bg-green-600 text-white' : 'text-gray-700 hover:bg-gray-200'}`}
          >
            Medical History
          </button>
          {/* ✅ New button for Reports */}
          <button 
            onClick={() => setActiveTab('reports')} 
            className={`px-4 py-2 rounded-md font-semibold ${activeTab === 'reports' ? 'bg-green-600 text-white' : 'text-gray-700 hover:bg-gray-200'}`}
          >
            Reports & Analysis
          </button>
        </nav>

        {/* ✅ Conditional rendering for the new tab */}
        {activeTab === 'dashboard' && <PatientDashboard patientData={patientData} />}
        {activeTab === 'history' && <PatientHistory medicalHistory={patientData.medicalHistory} />}
        {activeTab === 'reports' && <PatientReports abhaId={abhaId} reports={patientData.medicalHistory} setPatientData={setPatientData} />} 
        
      </div>
    </div>
  );
}