import React from 'react';
import Antibiogram from './Antibiogram';
import TrendsChart from './TrendsChart';
import { Syringe, BarChart3 } from 'lucide-react';

export default function StewardshipDashboard() {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">Antibiotic Stewardship</h2>
      
      <div className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Syringe className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">Hospital Antibiogram</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Real-time susceptibility of pathogens to various antibiotics. Higher percentages indicate better effectiveness.
          </p>
          <Antibiogram />
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">Antibiotic Prescription Trends</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Monthly usage of key antibiotic classes. Monitor for overuse of last-resort drugs like Carbapenems.
          </p>
          <TrendsChart />
        </div>
      </div>
    </div>
  );
}