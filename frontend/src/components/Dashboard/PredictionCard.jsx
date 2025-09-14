import React from 'react';
import { TrendingUp, ShieldAlert, Thermometer, Droplets } from 'lucide-react';

export default function PredictionCard({ prediction }) {
  const { disease, location, riskLevel, predictedDate, reasoning } = prediction;

  const riskStyles = {
    Low: { bg: 'bg-green-100', text: 'text-green-800', icon: <TrendingUp size={24} /> },
    Medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <ShieldAlert size={24} /> },
    High: { bg: 'bg-orange-100', text: 'text-orange-800', icon: <ShieldAlert size={24} color="orange" /> },
    Critical: { bg: 'bg-red-100', text: 'text-red-800', icon: <ShieldAlert size={24} color="red" /> },
  };

  const style = riskStyles[riskLevel] || riskStyles['Low'];
  const formattedDate = new Date(predictedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  return (
    <div className={`p-5 rounded-xl border ${style.bg} ${style.text} flex flex-col gap-3 shadow-sm`}>
      <div className="flex justify-between items-start">
        <div className='flex-1'>
          <p className="font-bold text-lg">{disease} Outbreak</p>
          <p className="text-sm opacity-80">{location}</p>
        </div>
        <div className={`flex items-center gap-2 font-bold px-3 py-1 rounded-full text-sm ${style.bg}`}>
          {style.icon}
          {riskLevel} Risk
        </div>
      </div>
      <div>
        <p className="font-semibold">Predicted Spike Around: <span className="font-normal">{formattedDate}</span></p>
      </div>
      <div className="text-xs opacity-90 mt-2 pt-3 border-t border-current/20">
        <p className="font-bold mb-1">AI Reasoning:</p>
        <p>{reasoning}</p>
      </div>
    </div>
  );
}