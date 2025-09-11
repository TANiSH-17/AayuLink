import React, { useState } from 'react';
import axios from 'axios';
import { ScanSearch, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const API_URL = 'http://localhost:8000';

export default function ValidatorPage({ onExit }) {
    const [token, setToken] = useState('');
    const [prescription, setPrescription] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [fulfilledMessage, setFulfilledMessage] = useState('');

    const handleVerify = async (e) => {
        e.preventDefault();
        if (!token.trim()) return;
        setIsLoading(true);
        setError('');
        setPrescription(null);
        setFulfilledMessage('');
        try {
            const response = await axios.post(`${API_URL}/api/prescriptions/verify`, { token });
            setPrescription(response.data);
        } catch (err) {
            setError(err.response?.data?.message || "Verification failed. The code may be invalid or expired.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleFulfill = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await axios.post(`${API_URL}/api/prescriptions/fulfill`, { token });
            setFulfilledMessage(response.data.message);
            setPrescription(response.data.prescription); // Update prescription with new 'Fulfilled' status
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fulfill the prescription.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-100 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 relative">
                <button onClick={onExit} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800">Aarogya Express Validator</h1>
                    <p className="text-gray-600 mt-2">Verify and fulfill digital e-prescriptions securely.</p>
                </div>
                
                <form onSubmit={handleVerify} className="flex items-center space-x-4">
                    <input 
                        type="text"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder="Enter prescription token or scan QR code..."
                        className="flex-1 p-3 border rounded-lg text-lg focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <button type="submit" disabled={isLoading} className="bg-blue-600 text-white p-3 rounded-lg font-bold flex items-center disabled:bg-blue-300">
                        <ScanSearch className="h-6 w-6 mr-2"/> Verify
                    </button>
                </form>

                <div className="mt-8 min-h-[250px] flex flex-col justify-center">
                    {isLoading && <p className="text-center font-semibold text-gray-600">Awaiting verification...</p>}
                    {error && <StatusCard type="error" message={error} />}
                    {fulfilledMessage && <StatusCard type="success" message={fulfilledMessage} />}
                    
                    {prescription && !fulfilledMessage && (
                        <PrescriptionDetails prescription={prescription} onFulfill={handleFulfill} isLoading={isLoading}/>
                    )}
                </div>
            </div>
        </div>
    );
}

// Helper component for displaying status messages (Success/Error)
function StatusCard({ type, message }) {
    const isError = type === 'error';
    const Icon = isError ? XCircle : (type === 'success' ? CheckCircle : AlertTriangle);
    const colors = isError ? 'bg-red-100 border-red-500 text-red-800' : 'bg-green-100 border-green-500 text-green-800';
    return (
        <div className={`p-4 border-l-4 rounded-r-lg ${colors} flex items-center animate-fade-in`}>
            <Icon className="h-6 w-6 mr-3"/>
            <p className="font-semibold">{message}</p>
        </div>
    );
}

// Helper component to display the verified prescription details
function PrescriptionDetails({ prescription, onFulfill, isLoading }) {
    return (
        <div className="border-2 p-6 rounded-lg animate-fade-in">
            <h2 className="text-2xl font-bold mb-4">Prescription Details</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div><strong className="block text-gray-500">Patient:</strong> {prescription.patientName}</div>
                <div><strong className="block text-gray-500">Doctor:</strong> {prescription.doctorName}</div>
                <div><strong className="block text-gray-500">Date Issued:</strong> {new Date(prescription.createdAt).toLocaleDateString()}</div>
                <div><strong className="block text-gray-500">Status:</strong> 
                    <span className={`font-bold ${prescription.status === 'Fulfilled' ? 'text-green-600' : 'text-yellow-600'}`}>{prescription.status}</span>
                </div>
            </div>
            <h3 className="font-semibold mb-2">Medications:</h3>
            <ul className="list-disc list-inside bg-gray-50 p-4 rounded-md">
                {prescription.medications.map((med, i) => <li key={i}>{med.name} ({med.dosage}) - {med.duration}</li>)}
            </ul>
            
            {prescription.status === 'Pending' && (
                <button onClick={onFulfill} disabled={isLoading} className="w-full mt-6 bg-green-600 text-white font-bold py-3 rounded-lg text-lg hover:bg-green-700 disabled:bg-green-300">
                    Mark as Fulfilled
                </button>
            )}
        </div>
    );
}

