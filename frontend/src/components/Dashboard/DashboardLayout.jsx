import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import PatientHistory from './PatientHistory';
import EmergencyMode from './EmergencyMode';
import AIChatPage from './AIChatPage';
import ReportsScans from './ReportsScans';
import EPrescriptionPage from './ePrescriptionPage';

const API_URL = 'http://localhost:8000';

// This component now accepts initialAbhaId and initialView as props from App.jsx
export default function DashboardLayout({ onLogout, initialAbhaId, initialView }) {
  const [activeView, setActiveView] = useState(initialView || 'history');
  const [patientData, setPatientData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // This effect runs when the component loads or when a new patient is selected
  useEffect(() => {
    if (initialAbhaId) {
        fetchRecords(initialAbhaId);
    }
  }, [initialAbhaId]);

  const fetchRecords = async (abhaId) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/fetch-records`, { abhaId });
      setPatientData(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch patient records.');
      setPatientData(null); // Clear old data if the new fetch fails
    } finally {
      setIsLoading(false);
    }
  };
  
  // This function allows child components like the e-prescription page to trigger a data refresh
  const handleDataRefresh = () => {
    console.log("Refreshing patient data...");
    fetchRecords(initialAbhaId);
  };
  
  // This function renders the correct view based on the selection from the sidebar
  const renderActiveView = () => {
    if (isLoading) return <div className="flex-1 p-8 text-center font-semibold text-lg">Loading Patient Data...</div>;
    if (error || !patientData) return <div className="flex-1 p-8 text-center text-red-600 font-semibold text-lg">{error || 'No patient found.'}</div>;

    switch (activeView) {
      case 'history': 
        return <PatientHistory patientData={patientData} />;
      case 'emergency': 
        return <EmergencyMode patientData={patientData} />;
      case 'ai_chat': 
        return <AIChatPage medicalHistory={patientData.medicalHistory} />;
      case 'reports': 
        return <ReportsScans />;
      case 'e_prescription':
        return <EPrescriptionPage patientData={patientData} onPrescriptionSuccess={handleDataRefresh} />;
      default: 
        return <PatientHistory patientData={patientData} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        onLogout={onLogout} 
        patientName={patientData?.personalInfo.name} // Pass patient name to sidebar
      />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}

