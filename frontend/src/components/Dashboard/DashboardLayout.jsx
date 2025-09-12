import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import PatientHistory from './PatientHistory';
import EmergencyMode from './EmergencyMode';
import AIChatPage from './AIChatPage';
import ReportsScans from './ReportsScans';
import EPrescriptionPage from './ePrescriptionPage';
import FloatingChatbot from './FloatingChatbot'; // <-- NEW: Import the chatbot component

const API_URL = 'http://localhost:8000';

export default function DashboardLayout({ onLogout, initialAbhaId, initialView }) {
  const [activeView, setActiveView] = useState(initialView || 'history');
  const [patientData, setPatientData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

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
      setPatientData(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDataRefresh = () => {
    fetchRecords(initialAbhaId);
  };
  
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
        patientName={patientData?.personalInfo.name}
      />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {renderActiveView()}
        </main>
      </div>

      {/* --- NEW: The Floating Chatbot is added here --- */}
      {/* It will only render if patient data has been successfully loaded */}
      {patientData && (
        <FloatingChatbot medicalHistory={patientData.medicalHistory} />
      )}
    </div>
  );
}

