import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { Plus, X, Copy, CheckCircle } from 'lucide-react';

const API_URL = 'http://localhost:8000';

// --- Main ePrescription Page Component ---
// This page is for creating and viewing the history of e-prescriptions.
export default function EPrescriptionPage({ patientData, onPrescriptionSuccess }) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showIssuedModal, setShowIssuedModal] = useState(false);
  const [issuedPrescription, setIssuedPrescription] = useState(null);

  // This function fetches the list of past prescriptions for the current patient.
  const fetchPrescriptionHistory = async () => {
    if (!patientData) return;
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/prescription/patient/${patientData.abhaId}`);
      setPrescriptions(response.data);
    } catch (error) {
      console.error("Failed to fetch prescriptions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptionHistory();
  }, [patientData]);

  // This function is called after a new prescription is successfully created.
  const handleIssueSuccess = (newPrescription) => {
    setIssuedPrescription(newPrescription);
    setShowCreateModal(false);
    setShowIssuedModal(true);
    
    // Trigger the data refresh in the main DashboardLayout to update the patient's history.
    if (onPrescriptionSuccess) {
      onPrescriptionSuccess();
    }
    // Also, refresh the local list on this page for an instant UI update.
    fetchPrescriptionHistory(); 
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">e-Prescriptions</h1>
          <p className="text-gray-600 mt-1">Manage digital prescriptions for <span className="font-semibold">{patientData.personalInfo.name}</span></p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create New
        </button>
      </div>

      {/* List of Past Prescriptions */}
      <div className="bg-white p-6 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">Prescription History</h2>
        {isLoading ? (
          <p>Loading prescription history...</p>
        ) : prescriptions.length > 0 ? (
          <div className="space-y-4">
            {prescriptions.map(p => (
              <div key={p._id} className="border p-4 rounded-md flex justify-between items-center">
                <div>
                  <p className="font-semibold">Prescription ID: {p._id.slice(-6)}</p>
                  <p className="text-sm text-gray-500">Issued on: {new Date(p.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                  p.status === 'Fulfilled' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No prescription history found for this patient.</p>
        )}
      </div>

      {/* Modals for creating and viewing the issued prescription */}
      {showCreateModal && <CreatePrescriptionModal patientData={patientData} onClose={() => setShowCreateModal(false)} onSuccess={handleIssueSuccess} />}
      {showIssuedModal && <IssuedPrescriptionModal prescription={issuedPrescription} onClose={() => setShowIssuedModal(false)} />}
    </div>
  );
}


// --- Create Prescription Modal Component ---
function CreatePrescriptionModal({ patientData, onClose, onSuccess }) {
  const [medications, setMedications] = useState([{ name: '', dosage: '', frequency: '', duration: '' }]);
  const [notes, setNotes] = useState('');
  const [isIssuing, setIsIssuing] = useState(false);

  const handleMedChange = (index, field, value) => {
    const updatedMeds = [...medications];
    updatedMeds[index][field] = value;
    setMedications(updatedMeds);
  };

  const addMedicationRow = () => {
    setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '' }]);
  };

  const removeMedicationRow = (index) => {
    const updatedMeds = medications.filter((_, i) => i !== index);
    setMedications(updatedMeds);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsIssuing(true);
    try {
      const response = await axios.post(`${API_URL}/api/prescription/create`, {
        patientAbhaId: patientData.abhaId,
        patientName: patientData.personalInfo.name,
        doctorName: "Dr. A. Sharma", // This would be dynamic in a real app
        hospitalName: "Aarogya Digital Clinic",
        medications: medications,
        notes,
      });
      onSuccess(response.data);
    } catch (error) {
      console.error("Failed to issue prescription", error);
      alert("Failed to issue prescription. Please try again.");
    } finally {
      setIsIssuing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-4">New e-Prescription</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-3">
            {medications.map((med, index) => (
              <div key={index} className="grid grid-cols-10 gap-2 items-center">
                <input type="text" placeholder="Medication Name" value={med.name} onChange={(e) => handleMedChange(index, 'name', e.target.value)} className="col-span-3 border p-2 rounded-md" required/>
                <input type="text" placeholder="Dosage (e.g., 500mg)" value={med.dosage} onChange={(e) => handleMedChange(index, 'dosage', e.target.value)} className="col-span-2 border p-2 rounded-md" />
                <input type="text" placeholder="Frequency (e.g., 1-0-1)" value={med.frequency} onChange={(e) => handleMedChange(index, 'frequency', e.target.value)} className="col-span-2 border p-2 rounded-md" />
                <input type="text" placeholder="Duration (e.g., 5 days)" value={med.duration} onChange={(e) => handleMedChange(index, 'duration', e.target.value)} className="col-span-2 border p-2 rounded-md" />
                <button type="button" onClick={() => removeMedicationRow(index)} className="text-red-500 hover:text-red-700"><X className="h-5 w-5"/></button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addMedicationRow} className="mt-3 text-sm font-semibold text-green-600 flex items-center"><Plus className="h-4 w-4 mr-1"/>Add Medication</button>
          
          <textarea rows="3" placeholder="Additional notes for the patient or pharmacist..." value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full mt-4 border p-2 rounded-md"></textarea>

          <div className="flex justify-end space-x-4 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-gray-600 bg-gray-100 hover:bg-gray-200">Cancel</button>
            <button type="submit" disabled={isIssuing} className="px-4 py-2 rounded-lg text-white bg-green-600 hover:bg-green-700 disabled:bg-green-300">{isIssuing ? "Issuing..." : "Sign & Issue"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Issued Prescription Modal ---
function IssuedPrescriptionModal({ prescription, onClose }) {
  const [copied, setCopied] = useState(false);
  const copyToClipboard = () => {
    navigator.clipboard.writeText(prescription.token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 text-center max-w-md">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4"/>
        <h2 className="text-2xl font-bold">Prescription Issued Successfully!</h2>
        <p className="text-gray-600 mt-2">Share the QR Code or the token with the patient.</p>
        
        <div className="my-6">
          <QRCodeSVG value={prescription.token} size={200} className="mx-auto" />
        </div>
        
        <div className="relative">
          <input type="text" readOnly value={prescription.token} className="w-full p-3 pr-12 border rounded-lg bg-gray-100 font-mono text-sm"/>
          <button onClick={copyToClipboard} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-gray-800">
            {copied ? <CheckCircle className="h-5 w-5 text-green-600"/> : <Copy className="h-5 w-5"/>}
          </button>
        </div>
        
        <button onClick={onClose} className="mt-6 w-full bg-gray-800 text-white font-bold py-3 px-4 rounded-lg hover:bg-black">Close</button>
      </div>
    </div>
  );
}

