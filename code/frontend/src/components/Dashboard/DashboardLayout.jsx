import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar.jsx';
import PatientHistory from './PatientHistory.jsx';
import EmergencyMode from './EmergencyMode.jsx';
import AIChatPage from './AIChatPage.jsx';
import ReportsScans from './ReportsScans.jsx';
import EPrescriptionPage from './ePrescriptionPage.jsx';
import FloatingChatbot from './FloatingChatbot.jsx';
import NationalHealthPulse from './NationalHealthPulse.jsx';
import MdrTracing from './MdrTracing.jsx';
import MdrInsights from './MdrInsights.jsx';
import ScreeningAnalytics from './ScreeningAnalytics.jsx';
import StewardshipDashboard from './StewardshipDashboard.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function DashboardLayout({ onLogout, onSwitchPatient, initialAbhaId, initialView, currentUser }) {
  const [activeView, setActiveView] = useState(initialView || 'history');
  const [patientData, setPatientData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const skipFetchViews = ['nationalPulse', 'mdr_insights', 'analytics', 'stewardship'];

    if (!initialAbhaId || skipFetchViews.includes(activeView)) {
      setPatientData(null);
      setIsLoading(false);
      return;
    }

    fetchRecords(initialAbhaId);
  }, [initialAbhaId, activeView]);

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
    if (initialAbhaId) fetchRecords(initialAbhaId);
  };

  const renderActiveView = () => {
    if (activeView === 'nationalPulse') return <NationalHealthPulse />;
    if (activeView === 'mdr_insights') return <MdrInsights />;
    if (activeView === 'analytics') return <ScreeningAnalytics />;
    if (activeView === 'stewardship') return <StewardshipDashboard />;

    if (isLoading) {
      return <div className="flex-1 p-8 text-center font-semibold text-lg">Loading Patient Data...</div>;
    }
    if (error || !patientData) {
      return <div className="flex-1 p-8 text-center text-red-600 font-semibold text-lg">{error || 'No patient found.'}</div>;
    }

    switch (activeView) {
      case 'history':
        return <PatientHistory patientData={patientData} currentUser={currentUser} onDataRefresh={handleDataRefresh} />;
      case 'emergency':
        return <EmergencyMode patientData={patientData} />;
      case 'ai_chat':
        return <AIChatPage patientData={patientData} />;
      case 'reports':
        return <ReportsScans patientData={patientData} currentUser={currentUser} onDataRefresh={handleDataRefresh} />;
      case 'e_prescription':
        return <EPrescriptionPage patientData={patientData} currentUser={currentUser} onPrescriptionSuccess={handleDataRefresh} />;
      case 'mdr':
        return <MdrTracing patientData={patientData} currentUser={currentUser} />;
      default:
        return <PatientHistory patientData={patientData} currentUser={currentUser} onDataRefresh={handleDataRefresh} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        onLogout={onLogout}
        onSwitchPatient={onSwitchPatient}
        patientName={patientData?.personalInfo?.name}
      />
      <div className="flex-1 flex flex-col lg:ml-64">
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {renderActiveView()}
        </main>
      </div>

      {patientData && !['nationalPulse', 'mdr_insights', 'analytics', 'stewardship'].includes(activeView) && (
        <FloatingChatbot
          medicalHistory={patientData?.medicalHistory}
          reportsAndScans={patientData?.reportsAndScans}
          abhaId={patientData?.abhaId}
        />
      )}
    </div>
  );
}