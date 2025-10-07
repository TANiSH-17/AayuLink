import React from 'react';
import { Hospital, AlertTriangle, Activity } from 'lucide-react';

// A helper component for displaying individual stats
const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white p-4 rounded-lg border">
    <div className={`flex items-center justify-center h-10 w-10 rounded-full ${color.bg}`}>
      {React.cloneElement(icon, { className: `h-5 w-5 ${color.text}` })}
    </div>
    <p className="mt-4 text-2xl font-bold text-gray-800">{value}</p>
    <p className="text-sm text-gray-500">{label}</p>
  </div>
);

export default function HospitalDetailCard({ hospital }) {
  if (!hospital) {
    return <div className="p-4 text-center text-gray-500">Select a hospital on the map to view details.</div>;
  }
  
  // Dummy data for wards - in a real app, this would come from an API
  const totalWards = 36;
  const highRiskWards = Math.round(hospital.intensity * 10);
  const currentHotspots = Math.round(hospital.intensity * 3);

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
      <div className="flex items-start gap-4">
        <div className="bg-blue-100 p-3 rounded-lg">
          <Hospital className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">{hospital.name}</h3>
          <p className="text-sm text-gray-600">{hospital.city}</p>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard 
          icon={<Activity />} 
          label="Total Wards" 
          value={totalWards} 
          color={{ bg: 'bg-blue-100', text: 'text-blue-600' }} 
        />
        <StatCard 
          icon={<AlertTriangle />} 
          label="High-Risk Wards" 
          value={highRiskWards} 
          color={{ bg: 'bg-amber-100', text: 'text-amber-600' }} 
        />
        <StatCard 
          icon={<Activity color="red" />} 
          label="Active Hotspots" 
          value={currentHotspots} 
          color={{ bg: 'bg-red-100', text: 'text-red-600' }} 
        />
      </div>
    </div>
  );
}