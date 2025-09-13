import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, X, Copy, CheckCircle, Share2 } from 'lucide-react'; // Added Share2 icon

const API_URL = 'http://localhost:8000';

// --- NEW Notification Component for Pop-ups (Updated Style) ---
function Notification({ message, show }) {
    return (
        <div 
            // This component is fixed to the top-right, with updated styling for a more professional look.
            className={`fixed top-5 right-5 flex items-center bg-slate-800 text-white p-4 rounded-lg shadow-2xl transition-all duration-500 ease-in-out z-50 border-l-4 border-green-500 ${show ? 'transform translate-x-0 opacity-100' : 'transform translate-x-full opacity-0'}`}
        >
            <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
            <p className="font-medium text-sm">{message}</p>
        </div>
    );
}

// A helper component for the "Copy Token" button
function CopyTokenButton({ token }) {
    const [copied, setCopied] = useState(false);
    const copyToClipboard = () => {
        navigator.clipboard.writeText(token);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    };

    return (
        <button 
            onClick={copyToClipboard}
            className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-1 px-3 rounded-md text-xs"
        >
            {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
    );
}

// --- NEW ShareButton Component ---
function ShareButton({ onClick }) {
    return (
        <button
            onClick={onClick}
            className="flex items-center space-x-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold py-1 px-3 rounded-md text-xs"
        >
            <Share2 className="h-4 w-4" />
            <span>Share</span>
        </button>
    );
}


// --- Main ePrescription Page Component (Updated) ---
export default function EPrescriptionPage({ patientData, onPrescriptionSuccess }) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showIssuedModal, setShowIssuedModal] = useState(false);
  const [issuedPrescription, setIssuedPrescription] = useState(null);
  
  // --- NEW: State for managing the notification pop-up ---
  const [notification, setNotification] = useState({ show: false, message: '' });

  // --- NEW: Function to trigger the notification ---
  const showNotification = (message) => {
    setNotification({ show: true, message });
    // Automatically hide the notification after 5 seconds
    setTimeout(() => {
        setNotification({ show: false, message: '' });
    }, 5000);
  };

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

  const handleIssueSuccess = (newPrescription) => {
    setIssuedPrescription(newPrescription);
    setShowCreateModal(false);
    setShowIssuedModal(true);
    
    if (onPrescriptionSuccess) {
      onPrescriptionSuccess();
    }
    fetchPrescriptionHistory(); 
  };

  return (
    <div className="space-y-8">
      {/* The Notification component is rendered here and controlled by state */}
      <Notification show={notification.show} message={notification.message} />

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

      <div className="bg-white p-6 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">Prescription History</h2>
        {isLoading ? (
          <p>Loading prescription history...</p>
        ) : prescriptions.length > 0 ? (
          <div className="space-y-4">
            {prescriptions.map(p => (
              <div key={p._id} className="border p-4 rounded-md flex justify-between items-center">
                <div>
                  <p className="font-semibold">Prescription ID: <span className="font-mono text-gray-600">{p._id.slice(-6).toUpperCase()}</span></p>
                  <p className="text-sm text-gray-500">Issued on: {new Date(p.createdAt).toLocaleDateString()}</p>
                </div>
                {/* --- UPDATED: Added the ShareButton here --- */}
                <div className="flex items-center space-x-2">
                    <ShareButton onClick={() => showNotification('Your e-Prescription QR code has been sent to the registered phone number')} />
                    <CopyTokenButton token={p.token} />
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                      p.status === 'Fulfilled' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {p.status}
                    </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No prescription history found for this patient.</p>
        )}
      </div>

      {showCreateModal && <CreatePrescriptionModal patientData={patientData} onClose={() => setShowCreateModal(false)} onSuccess={handleIssueSuccess} />}
      {showIssuedModal && <IssuedPrescriptionModal 
          prescription={issuedPrescription} 
          onClose={() => setShowIssuedModal(false)}
          // Pass the notification function to the modal
          showNotification={showNotification}
      />}
    </div>
  );
}


// --- Create Prescription Modal Component ---
function CreatePrescriptionModal({ patientData, onClose, onSuccess }) {
  // ... (This component remains unchanged)
  // NOTE: You would have your form logic for creating a new prescription here.
  // For this example, we'll assume it's a placeholder.
  return (
     <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
            <h2 className="text-xl font-bold">Create New Prescription</h2>
            <p className="my-4">Prescription creation form would be here.</p>
            <button onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg">Close</button>
        </div>
     </div>
  )
}

// --- Issued Prescription Modal (Updated with Share button) ---
function IssuedPrescriptionModal({ prescription, onClose, showNotification }) {
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = () => {
    if (prescription && prescription.token) {
        navigator.clipboard.writeText(prescription.token);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = () => {
    // This calls the function passed down from the parent component
    showNotification("ePrescription has been sent to the registered phone number");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 text-center max-w-md w-full">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4"/>
        <h2 className="text-2xl font-bold">Prescription Issued Successfully!</h2>
        <p className="text-gray-600 mt-2">Share the secure token below with the patient.</p>
        
        <div className="relative my-6">
          <input type="text" readOnly value={prescription?.token || 'Error: Token not found'} className="w-full p-3 pr-12 border rounded-lg bg-gray-100 font-mono text-sm"/>
          <button onClick={copyToClipboard} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-gray-800">
            {copied ? <CheckCircle className="h-5 w-5 text-green-600"/> : <Copy className="h-5 w-5"/>}
          </button>
        </div>
        
        {/* --- NEW: Replaced single close button with Share and Close actions --- */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button 
                onClick={handleShare}
                className="flex-1 flex items-center justify-center bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
                <Share2 className="h-5 w-5 mr-2" />
                Share
            </button>
            <button 
                onClick={onClose} 
                className="flex-1 bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
                Close
            </button>
        </div>
      </div>
    </div>
  );
}

