import React, { useState } from 'react';
import axios from 'axios';
import { X, Clipboard, Wand2, RefreshCw } from 'lucide-react'; // ✅ 1. Import RefreshCw for the generate icon

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Arrays of sample data to make the auto-fill more dynamic
const sampleAllergies = ["Pollen", "Penicillin", "Dust Mites", "Peanuts", "None"];
const sampleConditions = ["Hypertension", "Type 2 Diabetes", "Asthma", "None", "Hypothyroidism"];
const sampleMeds = ["Metformin 500mg", "Amlodipine 5mg", "Levothyroxine 50mcg", "Salbutamol Inhaler", "None"];
const sampleContacts = ["Jane Doe (Spouse)", "John Smith (Son)", "Emily Jones (Friend)", "Rajesh Kumar (Father)"];
const sampleBloodTypes = ['A+', 'B+', 'O-', 'AB+', 'O+', 'A-'];

export default function PatientRegistrationModal({ isOpen, onClose, onRegistrationSuccess }) {
  const [formData, setFormData] = useState({
    hospitalCode: '',
    abhaId: '',
    name: '',
    age: '',
    gender: 'Male',
    dob: '',
    bloodType: '',
    personalNumber: '',
    emergencyContact: '',
    allergies: '',
    chronicConditions: '',
    currentMedications: '',
  });
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copyStatus, setCopyStatus] = useState('Copy');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ 2. New function JUST to generate the ID
  const handleGenerateAbha = () => {
    const p1 = Math.floor(10 + Math.random() * 90);
    const p2 = Math.floor(1000 + Math.random() * 9000);
    const p3 = Math.floor(1000 + Math.random() * 9000);
    const p4 = Math.floor(1000 + Math.random() * 9000);
    const newAbhaId = `${p1}-${p2}-${p3}-${p4}`;
    
    setFormData(prevData => ({ ...prevData, abhaId: newAbhaId }));
  };

  // ✅ 3. New function JUST to copy the ID
  const handleCopyAbha = () => {
    if (!formData.abhaId) return; // Don't copy if the field is empty

    navigator.clipboard.writeText(formData.abhaId).then(() => {
      setCopyStatus('Copied!');
      setTimeout(() => setCopyStatus('Copy'), 2000); // Reset button text after 2 seconds
    });
  };

  const handleAutoFill = () => {
    const randomYear = Math.floor(1950 + Math.random() * 55);
    const randomMonth = String(Math.floor(1 + Math.random() * 12)).padStart(2, '0');
    const randomDay = String(Math.floor(1 + Math.random() * 28)).padStart(2, '0');
    const age = new Date().getFullYear() - randomYear;

    const dummyData = {
      age: age,
      gender: ['Male', 'Female'][Math.floor(Math.random() * 2)],
      dob: `${randomYear}-${randomMonth}-${randomDay}`,
      bloodType: sampleBloodTypes[Math.floor(Math.random() * sampleBloodTypes.length)],
      personalNumber: `98765${Math.floor(10000 + Math.random() * 90000)}`,
      emergencyContact: `${sampleContacts[Math.floor(Math.random() * sampleContacts.length)]} - 9876543210`,
      allergies: sampleAllergies[Math.floor(Math.random() * sampleAllergies.length)],
      chronicConditions: sampleConditions[Math.floor(Math.random() * sampleConditions.length)],
      currentMedications: sampleMeds[Math.floor(Math.random() * sampleMeds.length)],
    };
    
    setFormData(prevData => ({ ...prevData, ...dummyData }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const payload = {
      abhaId: formData.abhaId,
      hospitalCode: formData.hospitalCode,
      personalInfo: {
        name: formData.name,
        age: Number(formData.age),
        gender: formData.gender,
        bloodType: formData.bloodType,
        dob: formData.dob,
        emergencyContact: formData.emergencyContact,
        personalNumber: formData.personalNumber
      },
      criticalInfo: {
        allergies: formData.allergies.split(',').map(item => item.trim()).filter(Boolean),
        chronicConditions: formData.chronicConditions.split(',').map(item => item.trim()).filter(Boolean),
        currentMedications: formData.currentMedications && formData.currentMedications !== "None"
          ? [{ name: formData.currentMedications.split(' ')[0], dosage: formData.currentMedications.split(' ').slice(1).join(' ') }]
          : [],
      }
    };

    try {
      await axios.post(`${API_URL}/api/patient/create`, payload);
      onRegistrationSuccess("Patient record created successfully!");
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 md:p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Create New Patient Record</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Authorization & Patient ID</h3>
          <input name="hospitalCode" value={formData.hospitalCode} onChange={handleChange} placeholder="Your Hospital Code" required className="w-full p-2 border rounded" />
          <div className="flex items-center gap-2">
            <input name="abhaId" value={formData.abhaId} onChange={handleChange} placeholder="New Patient ABHA ID" required className="w-full p-2 border rounded" />
            
            {/* ✅ 4. Replaced the single button with two separate buttons */}
            <button 
              type="button" 
              onClick={handleGenerateAbha} 
              className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-md hover:bg-gray-200" 
              title="Generate New ID"
            >
              <RefreshCw size={16} />
              Generate
            </button>
            <button 
              type="button" 
              onClick={handleCopyAbha} 
              className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 text-sm font-semibold rounded-md hover:bg-blue-200 disabled:opacity-50"
              title="Copy ID"
              disabled={!formData.abhaId}
            >
              <Clipboard size={16} />
              {copyStatus}
            </button>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 pt-4">Personal Information</h3>
          <input name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" required className="w-full p-2 border rounded" />

          {formData.hospitalCode && formData.abhaId && formData.name && (
            <div className="flex justify-end -mt-2 -mb-2">
              <button type="button" onClick={handleAutoFill} className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-800 font-semibold py-1 px-2 rounded-md hover:bg-purple-50">
                <Wand2 size={16} /> Auto-Fill Rest of Form
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="age" type="number" value={formData.age} onChange={handleChange} placeholder="Age" required className="w-full p-2 border rounded" />
            <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-2 border rounded">
              <option>Male</option> <option>Female</option> <option>Other</option>
            </select>
            <input name="dob" type="date" value={formData.dob} onChange={handleChange} required className="w-full p-2 border rounded text-gray-700" />
            <input name="bloodType" value={formData.bloodType} onChange={handleChange} placeholder="Blood Type (e.g., AB+)" required className="w-full p-2 border rounded" />
          </div>
          <input name="personalNumber" value={formData.personalNumber} onChange={handleChange} placeholder="Personal Phone Number" required className="w-full p-2 border rounded" />
          <input name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} placeholder="Emergency Contact (Name & Number)" required className="w-full p-2 border rounded" />

          <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 pt-4">Critical Health Info</h3>
          <textarea name="allergies" value={formData.allergies} onChange={handleChange} placeholder="Allergies (comma-separated)" className="w-full p-2 border rounded" rows="2"></textarea>
          <textarea name="chronicConditions" value={formData.chronicConditions} onChange={handleChange} placeholder="Chronic Conditions (comma-separated)" className="w-full p-2 border rounded" rows="2"></textarea>
          <textarea name="currentMedications" value={formData.currentMedications} onChange={handleChange} placeholder="Current Medications (e.g., Aspirin 81mg)" className="w-full p-2 border rounded" rows="2"></textarea>
          
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400">
              {isLoading ? 'Creating...' : 'Create Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}