import React, { useState } from 'react';
import axios from 'axios';
import { Plus, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Receive 'hospitalName' as a prop
export default function AddHistoryModal({ abhaId, onClose, onHistoryAdded, hospitalName }) {
  
  // Pre-fill the hospital field using the new prop
  const [entry, setEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'Consultation',
    summary: '',
    doctor: '',
    hospital: hospitalName || '', // Use the passed-in hospital name
  });
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEntry(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!entry.summary || !entry.doctor || !entry.hospital) {
      setError('Please fill out all required fields.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await axios.post(`${API_URL}/api/medical-history/add`, { abhaId, entry });
      onHistoryAdded();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add entry. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Medical History Entry</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ...other form fields... */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-600 mb-1">Date</label>
            <input type="date" name="date" id="date" value={entry.date} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"/>
          </div>
           <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-600 mb-1">Entry Type</label>
            <select name="type" id="type" value={entry.type} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500">
                <option>Consultation</option>
                <option>Diagnosis</option>
                <option>Procedure</option>
                <option>Allergy</option>
                <option>Immunization</option>
            </select>
          </div>
          <div>
            <label htmlFor="summary" className="block text-sm font-medium text-gray-600 mb-1">Summary / Notes</label>
            <textarea name="summary" id="summary" rows="3" value={entry.summary} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500" required placeholder="e.g., Diagnosed with viral fever..."></textarea>
          </div>
           <div>
            <label htmlFor="doctor" className="block text-sm font-medium text-gray-600 mb-1">Consulting Doctor</label>
            <input type="text" name="doctor" id="doctor" value={entry.doctor} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500" required placeholder="e.g., Dr. Priya Sharma"/>
          </div>
           <div>
            <label htmlFor="hospital" className="block text-sm font-medium text-gray-600 mb-1">Hospital / Clinic Name</label>
            {/* --- THIS IS THE FIX --- */}
            {/* The input is now enabled, and styled with a light green background */}
            {/* to indicate it's pre-filled but editable. */}
            <input 
              type="text" 
              name="hospital" 
              id="hospital" 
              value={entry.hospital} 
              onChange={handleInputChange} 
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 bg-green-50" 
              required 
            />
          </div>

          {error && <p className="text-red-600 text-sm text-center bg-red-50 p-2 rounded-md">{error}</p>}

          <div className="flex justify-end pt-4 space-x-3">
            <button type="button" onClick={onClose} className="px-5 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 font-semibold rounded-lg transition-colors">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-5 py-2 text-white bg-green-600 hover:bg-green-700 font-semibold rounded-lg disabled:bg-green-300 flex items-center transition-colors">
              <Plus size={18} className="mr-2"/> {isLoading ? 'Adding...' : 'Add Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

