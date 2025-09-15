import React, { useState, useEffect } from 'react';
import axios from 'axios';
// ✅ QR Code library import has been removed.
import { Plus, X, Copy, CheckCircle, Share2, Trash2, Loader2 } from 'lucide-react';

const API_URL = 'http://localhost:8000';

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
    <div className="space-y-8">
      <Notification show={notification.show} message={notification.message} />
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">e-Prescriptions</h1>
          <p className="text-gray-600 mt-1">Manage digital prescriptions for <span className="font-semibold">{patientData.personalInfo.name}</span></p>
        </div>
        {/* The "Create New" button only renders if the user is an admin */}
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
            {prescriptions.map(p => (
              <div key={p._id} className="border p-4 rounded-md flex justify-between items-center">
                <div>
                  <p className="font-semibold">Prescription ID: <span className="font-mono text-gray-600">{p._id.slice(-6).toUpperCase()}</span></p>
                  <p className="text-sm text-gray-500">Issued on: {new Date(p.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center space-x-2">
                    <ShareButton onClick={() => showNotification('e-Prescription token sent to the patient!')} />
                    <CopyTokenButton token={p.token} />
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${ p.status === 'Fulfilled' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700' }`}>
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
      {showIssuedModal && <IssuedPrescriptionModal prescription={issuedPrescription} onClose={() => setShowIssuedModal(false)} showNotification={showNotification} />}
    </div>
  );
}

// --- Create Prescription Modal (Unchanged) ---
function CreatePrescriptionModal({ patientData, onClose, onSuccess }) {
  const [medicines, setMedicines] = useState([{ name: '', dosage: '', frequency: '', duration: '', notes: '' }]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const handleMedicineChange = (index, event) => {
    const values = [...medicines];
    values[index][event.target.name] = event.target.value;
    setMedicines(values);
  };
  const addMedicineField = () => { setMedicines([...medicines, { name: '', dosage: '', frequency: '', duration: '', notes: '' }]); };
  const removeMedicineField = (index) => {
    const values = [...medicines];
    values.splice(index, 1);
    setMedicines(values);
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.post(`${API_URL}/api/prescription/issue`, {
        abhaId: patientData.abhaId,
        medicines: medicines,
      });
      onSuccess(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to issue prescription.');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 relative max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Create New e-Prescription</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-2">
          {medicines.map((med, index) => (
            <div key={index} className="p-4 border rounded-lg bg-gray-50/50 relative">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="name" value={med.name} onChange={e => handleMedicineChange(index, e)} placeholder="Medicine Name (e.g., Paracetamol)" className="p-2 border rounded-md" required />
                <input name="dosage" value={med.dosage} onChange={e => handleMedicineChange(index, e)} placeholder="Dosage (e.g., 500mg)" className="p-2 border rounded-md" required />
                <input name="frequency" value={med.frequency} onChange={e => handleMedicineChange(index, e)} placeholder="Frequency (e.g., 1-0-1 After Food)" className="p-2 border rounded-md" required />
                <input name="duration" value={med.duration} onChange={e => handleMedicineChange(index, e)} placeholder="Duration (e.g., 5 Days)" className="p-2 border rounded-md" required />
              </div>
              <textarea name="notes" value={med.notes} onChange={e => handleMedicineChange(index, e)} placeholder="Optional Notes (e.g., take with lukewarm water)" className="w-full mt-3 p-2 border rounded-md" rows="1"></textarea>
              {medicines.length > 1 && (<button type="button" onClick={() => removeMedicineField(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"><Trash2 size={14} /></button>)}
            </div>
          ))}
          <button type="button" onClick={addMedicineField} className="w-full mt-4 text-sm font-semibold text-green-600 border-2 border-dashed border-gray-300 rounded-lg py-2 hover:bg-green-50">+ Add Another Medicine</button>
        </form>
        <div className="mt-6 pt-4 border-t flex justify-end gap-3">
          {error && <p className="text-red-600 text-sm mr-auto">{error}</p>}
          <button type="button" onClick={onClose} className="px-5 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 font-semibold rounded-lg">Cancel</button>
          <button type="submit" formNoValidate onClick={handleSubmit} disabled={isLoading} className="px-5 py-2 text-white bg-green-600 hover:bg-green-700 font-semibold rounded-lg disabled:bg-green-300 flex items-center">
            {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Plus size={18} className="mr-2"/>}
            {isLoading ? 'Issuing...' : 'Issue Prescription'}
          </button>
        </div>
      </div>
    </div>
  );
}


// ✅ --- UPDATED: Issued Prescription Modal (QR Code REMOVED) ---
function IssuedPrescriptionModal({ prescription, onClose, showNotification }) {
    const [copied, setCopied] = useState(false);
    
    const copyToClipboard = () => {
        if (prescription?.token) {
            navigator.clipboard.writeText(prescription.token);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleShare = () => {
        showNotification("e-Prescription token has been sent to the patient's phone!");
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md w-full">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4"/>
                <h2 className="text-2xl font-bold">Prescription Issued!</h2>
                {/* The text is updated to focus only on the token */}
                <p className="text-gray-600 mt-2 mb-6">Share this secure token with the patient. It can be used by a pharmacist to fulfill the prescription.</p>
                                
                {/* The QR Code display has been completely removed from here */}
                
                <div className="relative">
                    <input type="text" readOnly value={prescription?.token || 'N/A'} className="w-full text-center p-3 pr-12 border rounded-lg bg-gray-100 font-mono text-sm"/>
                    <button onClick={copyToClipboard} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-gray-800">
                        {copied ? <CheckCircle className="h-5 w-5 text-green-600"/> : <Copy className="h-5 w-5"/>}
                    </button>
                </div>
                
                <div className="mt-8 flex gap-4">
                    <button onClick={handleShare} className="flex-1 flex items-center justify-center bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700"><Share2 className="h-5 w-5 mr-2" />Share</button>
                    <button onClick={onClose} className="flex-1 bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-lg hover:bg-gray-300">Close</button>
                </div>
            </div>
        </div>
    );
}