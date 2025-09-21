import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, X, Copy, CheckCircle, Share2, Trash2, Loader2, AlertTriangle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/* ========== Small helpers ========== */
function Notification({ message, show }) {
  return (
    <div
      className={`fixed top-5 right-5 flex items-center bg-slate-800 text-white p-4 rounded-lg shadow-2xl transition-all duration-500 ease-in-out z-[100] border-l-4 border-green-500 ${
        show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
      <p className="font-medium text-sm">{message}</p>
    </div>
  );
}

function CopyTokenButton({ token }) {
  const [copied, setCopied] = useState(false);
  const copyToClipboard = () => {
    navigator.clipboard.writeText(token || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

/* ========== Page ========== */
export default function EPrescriptionPage({ patientData, currentUser, onPrescriptionSuccess }) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showIssuedModal, setShowIssuedModal] = useState(false);
  const [issuedPrescription, setIssuedPrescription] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '' });

  const isAdmin = currentUser?.role === 'admin';
  const abhaId = patientData?.abhaId;

  const showNotification = (message) => {
    setNotification({ show: true, message });
    setTimeout(() => setNotification({ show: false, message: '' }), 5000);
  };

  const fetchPrescriptionHistory = async () => {
    if (!abhaId) return;
    setIsLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/api/prescription/patient/${abhaId}`);
      setPrescriptions(data || []);
    } catch (error) {
      console.error('Failed to fetch prescriptions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptionHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abhaId]);

  const handleIssueSuccess = (newPrescription) => {
    setIssuedPrescription(newPrescription);
    setShowCreateModal(false);
    setShowIssuedModal(true);
    onPrescriptionSuccess?.();
    fetchPrescriptionHistory();
  };

  return (
    <div className="space-y-8 mt-4">
      <Notification show={notification.show} message={notification.message} />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">e-Prescriptions</h1>
          <p className="text-gray-600 mt-1">
            Manage digital prescriptions for{' '}
            <span className="font-semibold">{patientData?.personalInfo?.name || 'Patient'}</span>
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
            {prescriptions
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((p) => (
                <div key={p._id} className="border p-4 rounded-md flex justify-between items-center">
                  <div>
                    <p className="font-semibold">
                      Prescription ID:{' '}
                      <span className="font-mono text-gray-600">{String(p._id).slice(-6).toUpperCase()}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Issued on: {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ShareButton onClick={() => showNotification('e-Prescription token sent to the patient!')} />
                    <CopyTokenButton token={p.token} />
                    <span
                      className={`px-3 py-1 text-xs font-bold rounded-full ${
                        p.status === 'Fulfilled' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
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
          patientAbhaId={abhaId}
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

/* ========== Create Modal (with Doctor's Notes) ========== */
function CreatePrescriptionModal({ patientAbhaId, onClose, onSuccess }) {
  const [medicines, setMedicines] = useState([{ id: 1, name: '', dosage: '', duration: '' }]);
  const [notes, setNotes] = useState(''); // <<<<<< ADDED
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAddMedicine = () => {
    setMedicines((arr) => [...arr, { id: Date.now(), name: '', dosage: '', duration: '' }]);
  };

  const handleRemoveMedicine = (id) => {
    setMedicines((arr) => arr.filter((m) => m.id !== id));
  };

  const handleMedicineChange = (id, field, value) => {
    setMedicines((arr) => arr.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!patientAbhaId) {
      setErrorMsg('Missing patient ABHA ID.');
      return;
    }

    const meds = medicines
      .map(({ name, dosage, duration }) => ({
        name: (name || '').trim(),
        dosage: (dosage || '').trim(),
        duration: (duration || '').trim(), // optional
      }))
      .filter((m) => m.name && m.dosage);

    if (meds.length === 0) {
      setErrorMsg('Please add at least one medicine with a name and dosage.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await axios.post(`${API_URL}/api/prescription/issue`, {
        abhaId: patientAbhaId,
        medicines: meds,
        notes: notes || '', // <<<<<< ADDED
      });
      onSuccess?.(data);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || err.message;
      setErrorMsg(msg || 'Failed to issue prescription.');
      console.error('Failed to issue prescription:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Create New Prescription</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-md bg-red-50 text-red-700 px-3 py-2 text-sm">
            <AlertTriangle className="w-4 h-4" /> <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto pr-2">
          <div className="space-y-4">
            {medicines.map((med) => (
              <div key={med.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <input
                  type="text"
                  placeholder="Medicine Name"
                  value={med.name}
                  onChange={(e) => handleMedicineChange(med.id, 'name', e.target.value)}
                  className="col-span-2 p-2 border rounded-md"
                  required
                />
                <input
                  type="text"
                  placeholder="Dosage (e.g., 500mg)"
                  value={med.dosage}
                  onChange={(e) => handleMedicineChange(med.id, 'dosage', e.target.value)}
                  className="p-2 border rounded-md"
                  required
                />
                <input
                  type="text"
                  placeholder="Duration/Frequency (e.g., 5 days / 1-0-1)"
                  value={med.duration}
                  onChange={(e) => handleMedicineChange(med.id, 'duration', e.target.value)}
                  className="p-2 border rounded-md"
                />
                {medicines.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMedicine(med.id)}
                    className="text-red-500 hover:text-red-700 justify-self-end"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Doctor's Notes */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Doctor&apos;s Notes</label>
            <textarea
              placeholder="Any additional notes or instructions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="3"
              className="w-full p-2 border rounded-md"
            />
          </div>
        </form>

        <div className="flex justify-end items-center mt-8 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 mr-3"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-green-300 flex items-center"
          >
            {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
            {isSubmitting ? 'Issuing...' : 'Issue Prescription'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ========== Issued Modal ========== */
function IssuedPrescriptionModal({ prescription, onClose, showNotification }) {
  if (!prescription) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md text-center">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Prescription Issued!</h2>
        <p className="text-gray-600 mb-6">A unique token has been generated for this prescription.</p>
        <div className="bg-gray-50 border-2 border-dashed rounded-lg p-4 space-y-3">
          <div>
            <p className="text-sm text-gray-500">Prescription ID</p>
            <p className="font-mono text-lg font-semibold">
              {String(prescription._id).slice(-6).toUpperCase()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Pharmacist Token</p>
            <p className="font-mono text-lg font-semibold tracking-widest">{prescription.token}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-center space-x-3">
          <ShareButton onClick={() => showNotification('e-Prescription token sent to the patient!')} />
          <CopyTokenButton token={prescription.token} />
        </div>
        <button
          onClick={onClose}
          className="mt-8 w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700"
        >
          Done
        </button>
      </div>
    </div>
  );
}
