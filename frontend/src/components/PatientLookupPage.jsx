import React, { useState } from 'react';
import axios from 'axios';
import { User, Shield, History, Search } from 'lucide-react';
import EmergencyDetailModal from './EmergencyDetailModal'; // Import the modal component

const API_URL = 'http://localhost:8000';

export default function PatientLookupPage({ onPatientSelect }) {
  const [abhaId, setAbhaId] = useState('');
  const [patient, setPatient] = useState(null); // Stores basic patient info { abhaId, name }
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // New state to manage the emergency modal
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyData, setEmergencyData] = useState(null); // Stores full data for the modal

  // Step 1: Look up the patient's name for confirmation
  const handleLookup = async (e) => {
    e.preventDefault();
    if (!abhaId.trim()) return;
    setIsLoading(true);
    setError('');
    setPatient(null);

    try {
      const response = await axios.post(`${API_URL}/api/patient-lookup`, { abhaId });
      setPatient({ abhaId, name: response.data.name });
    } catch (err) {
      setError(err.response?.data?.error || 'Could not find patient with that ABHA ID.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Handle the "Quick Details" button click
  const handleEmergencyLookup = async (id) => {
    setIsLoading(true);
    setError('');
    try {
        // Use the full /fetch-records endpoint to get all critical data
        const response = await axios.post(`${API_URL}/api/fetch-records`, { abhaId: id });
        setEmergencyData(response.data);
        setShowEmergencyModal(true); // Open the modal with the fetched data
    } catch (err) {
        setError("Could not fetch the patient's emergency details.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 space-y-6">
        
        {!patient ? (
          // --- STAGE 1: ABHA Input Form ---
          <div>
            <h1 className="text-3xl font-bold text-gray-900 text-center">Patient Lookup</h1>
            <p className="text-center text-gray-600 mt-2">Enter an ABHA number to find a patient's record.</p>
            <form onSubmit={handleLookup} className="mt-8 space-y-4">
              <div>
                <label htmlFor="abhaId" className="text-sm font-semibold text-gray-700">ABHA Number</label>
                <div className="relative">
                  <input
                    id="abhaId"
                    type="text"
                    value={abhaId}
                    onChange={(e) => setAbhaId(e.target.value)}
                    className="w-full mt-1 p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., 12-3456-7890-0001"
                    required
                  />
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
              {error && <p className="text-sm text-red-600 text-center">{error}</p>}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-green-300"
              >
                {isLoading ? 'Searching...' : <><Search className="h-5 w-5 mr-2"/>Find Patient</>}
              </button>
            </form>
          </div>
        ) : (
          // --- STAGE 2: Action Selection ---
          <div className="text-center">
            <p className="text-gray-600">Patient Found:</p>
            <h2 className="text-4xl font-bold text-green-700 my-4">{patient.name}</h2>
            <p className="text-gray-500 text-sm mb-8">ABHA ID: {patient.abhaId}</p>
            
            <div className="space-y-4">
              {/* This button navigates to the full dashboard */}
              <button 
                onClick={() => onPatientSelect(patient.abhaId, 'history')}
                className="w-full flex items-center justify-center bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700"
              >
                <History className="h-5 w-5 mr-2"/>
                Get Complete Medical History
              </button>
              
              {/* This button now calls the new function to show the modal */}
              <button 
                onClick={() => handleEmergencyLookup(patient.abhaId)}
                disabled={isLoading}
                className="w-full flex items-center justify-center bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 disabled:bg-red-300"
              >
                {isLoading ? 'Loading Details...' : <><Shield className="h-5 w-5 mr-2"/>Quick Details (Emergency Mode)</>}
              </button>
            </div>
             <button onClick={() => setPatient(null)} className="mt-6 text-sm text-gray-500 hover:underline">
               Look up another patient
            </button>
          </div>
        )}
      </div>

      {/* --- This line conditionally renders the modal when needed --- */}
      {showEmergencyModal && (
        <EmergencyDetailModal 
          patientData={emergencyData} 
          onClose={() => setShowEmergencyModal(false)} 
        />
      )}
    </div>
  );
}

