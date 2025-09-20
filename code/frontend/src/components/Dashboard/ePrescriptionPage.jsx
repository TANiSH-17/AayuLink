import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, X, Copy, CheckCircle, Share2, Trash2, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// --- Notification Component (Unchanged) ---
function Notification({ message, show }) {
    return (
        <div 
            className={`fixed top-5 right-5 flex items-center bg-slate-800 text-white p-4 rounded-lg shadow-2xl transition-all duration-500 ease-in-out z-[100] border-l-4 border-green-500 ${show ? 'transform translate-x-0 opacity-100' : 'transform translate-x-full opacity-0'}`}
        >
            <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
            <p className="font-medium text-sm">{message}</p>
        </div>
    );
}

// --- Helper Components (Unchanged) ---
function CopyTokenButton({ token }) {
    const [copied, setCopied] = useState(false);
    const copyToClipboard = () => {
        navigator.clipboard.writeText(token);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button onClick={copyToClipboard} className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-1 px-3 rounded-md text-xs">
            {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
    );
}
function ShareButton({ onClick }) {
    return (
        <button onClick={onClick} className="flex items-center space-x-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold py-1 px-3 rounded-md text-xs">
            <Share2 className="h-4 w-4" />
            <span>Share</span>
        </button>
    );
}

// --- Main ePrescription Page Component ---
export default function EPrescriptionPage({ patientData, currentUser, onPrescriptionSuccess }) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showIssuedModal, setShowIssuedModal] = useState(false);
  const [issuedPrescription, setIssuedPrescription] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '' });

  // Check if the logged-in user is an admin
  const isAdmin = currentUser?.role === 'admin';

  const showNotification = (message) => {
    setNotification({ show: true, message });
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
    <div className="space-y-8 mt-4">
      <Notification show={notification.show} message={notification.message} />
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">e-Prescriptions</h1>
          <p className="text-gray-600 mt-1">
            Manage digital prescriptions for{" "}
            <span className="font-semibold">{patientData.personalInfo.name}</span>
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create New
          </button>
        )}
      </div>
      <div className="bg-white p-6 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">Prescription History</h2>
        {isLoading ? (
          <p>Loading...</p>
        ) : prescriptions.length > 0 ? (
          <div className="space-y-4">
            {prescriptions.map((p) => (
              <div key={p._id} className="border p-4 rounded-md flex justify-between items-center">
                <div>
                  <p className="font-semibold">
                    Prescription ID:{" "}
                    <span className="font-mono text-gray-600">
                      {p._id.slice(-6).toUpperCase()}
                    </span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Issued on: {new Date(p.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <ShareButton
                    onClick={() =>
                      showNotification('e-Prescription token sent to the patient!')
                    }
                  />
                  <CopyTokenButton token={p.token} />
                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-full ${
                      p.status === 'Fulfilled'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
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
      {showCreateModal && (
        <CreatePrescriptionModal
          patientData={patientData}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleIssueSuccess}
        />
      )}
      {showIssuedModal && (
        <IssuedPrescriptionModal
          prescription={issuedPrescription}
          onClose={() => setShowIssuedModal(false)}
          showNotification={showNotification}
        />
      )}
    </div>
  );
}

// --- CreatePrescriptionModal and IssuedPrescriptionModal stay exactly the same as in your snippet ---
