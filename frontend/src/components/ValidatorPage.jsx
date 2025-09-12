import React, { useState } from 'react';
import axios from 'axios';
import { X, Search, CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react';

const API_URL = 'http://localhost:8000';

export default function ValidatorPage({ onBack }) { // <-- It now accepts the onBack prop
  const [token, setToken] = useState('');
  const [prescription, setPrescription] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFulfilled, setIsFulfilled] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!token.trim()) return;
    setIsLoading(true);
    setError('');
    setPrescription(null);
    setIsFulfilled(false);
    try {
      const response = await axios.get(`${API_URL}/api/prescription/verify/${token}`);
      setPrescription(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFulfill = async () => {
    setIsLoading(true);
    setError('');
    try {
      await axios.post(`${API_URL}/api/prescription/fulfill/${token}`);
      setIsFulfilled(true);
      // Update the local state to show the new status
      setPrescription(prev => ({ ...prev, status: 'Fulfilled' }));
    } catch (err) {
      setError(err.response?.data?.error || 'Could not fulfill prescription.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-100 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-8 relative">
        {/* --- THIS IS THE FIX --- */}
        {/* The button now calls the onBack function when clicked */}
        <button onClick={onBack} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="h-6 w-6" />
        </button>

        <h1 className="text-3xl font-bold text-center">Aarogya Express Validator</h1>
        <p className="text-center text-gray-500 mt-1">Verify and fulfill digital e-prescriptions securely.</p>
        
        <form onSubmit={handleVerify} className="mt-8 flex items-center gap-2">
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter prescription token or scan QR code..."
            className="flex-1 p-3 border-2 rounded-lg focus:ring-2 focus:ring-green-500"
          />
          <button type="submit" disabled={isLoading} className="bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-green-300">
            <Search className="h-5 w-5" />
          </button>
        </form>

        {error && <p className="text-center text-red-500 mt-4">{error}</p>}

        {prescription && (
          <div className="mt-6 border-t pt-6">
            <h2 className="text-xl font-semibold">Prescription Details</h2>
            <div className="mt-4 p-4 bg-slate-50 rounded-lg space-y-3">
              <p><strong>Patient:</strong> {prescription.patientName}</p>
              <p><strong>Doctor:</strong> {prescription.doctorName}</p>
              <p><strong>Status:</strong> <span className={`font-bold ${prescription.status === 'Fulfilled' ? 'text-red-600' : 'text-green-600'}`}>{prescription.status}</span></p>
              <div>
                <strong>Medications:</strong>
                <ul className="list-disc list-inside ml-4">
                  {prescription.medications.map((med, i) => <li key={i}>{med.name} ({med.dosage})</li>)}
                </ul>
              </div>
            </div>
            {prescription.status === 'Pending' && !isFulfilled && (
              <button onClick={handleFulfill} disabled={isLoading} className="w-full mt-4 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-300">
                Mark as Fulfilled
              </button>
            )}
            {isFulfilled && (
              <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 mr-2" /> Prescription Fulfilled Successfully!
              </div>
            )}
          </div>
        )}

        <div className="text-center mt-8">
            <button onClick={onBack} className="text-sm text-gray-500 hover:underline flex items-center mx-auto">
                <ArrowLeft className="h-4 w-4 mr-1"/> Back to Home
            </button>
        </div>
      </div>
    </div>
  );
}

