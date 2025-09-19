import React from 'react';
import { ShieldAlert, TrendingUp, Zap } from 'lucide-react';

// ✅ 1. New, more vibrant and professional color palette
const riskStyles = {
  "High Risk": {
    textColor: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    hoverBorderColor: "hover:border-red-500",
    meterColor: "stroke-red-500",
    riskValue: 0.9,
    icon: Zap,
  },
  "Medium Risk": {
    textColor: "text-orange-700",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    hoverBorderColor: "hover:border-orange-500",
    meterColor: "stroke-orange-500",
    riskValue: 0.6,
    icon: ShieldAlert,
  },
  "Low Risk": {
    textColor: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    hoverBorderColor: "hover:border-blue-500",
    meterColor: "stroke-blue-500",
    riskValue: 0.25,
    icon: TrendingUp,
  },
};

const RiskMeter = ({ riskValue, color }) => {
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - riskValue * circumference;

  return (
    <div className="relative h-24 w-24">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <circle className="stroke-current text-gray-200" strokeWidth="10" cx="50" cy="50" r="40" fill="transparent" />
        <circle
          className={`stroke-current ${color} transition-all duration-1000 ease-in-out`}
          strokeWidth="10" strokeLinecap="round" cx="50" cy="50" r="40" fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-xl font-bold ${color}`}>{Math.round(riskValue * 100)}%</span>
      </div>
    </div>
  );
};

export default function PredictionCard({ prediction }) {
  // ✅ 2. To fix the 25% issue, your backend needs to send varied risk levels.
  // This line ensures that if the riskLevel is unknown, it defaults gracefully.
  const { disease, location, predictedSpike, riskLevel, reasoning } = prediction;
  const style = riskStyles[riskLevel] || riskStyles["Low Risk"];
  const RiskIcon = style.icon;

  return (
    <div className={`h-full flex flex-col bg-white p-6 rounded-2xl border-2 ${style.borderColor} ${style.hoverBorderColor} shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">{disease}</h3>
          <p className="text-sm text-gray-500">{location}</p>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full ${style.bgColor} ${style.textColor}`}>
          <RiskIcon size={14} />
          <span>{riskLevel}</span>
        </div>
      </div>
      <div className="flex items-center justify-between my-6">
        <div className="flex-1">
          <p className="text-sm text-gray-500">Predicted Spike Around:</p>
          <p className="text-2xl font-semibold text-gray-900">{predictedSpike}</p>
        </div>
        <div className="flex-shrink-0">
          <RiskMeter riskValue={style.riskValue} color={style.textColor} />
        </div>
      </div>
      <div className="mt-auto pt-4 border-t border-gray-200">
        <p className="text-sm font-semibold text-gray-600 mb-1">AI Reasoning:</p>
        <p className="text-sm text-gray-500 leading-relaxed">{reasoning}</p>
      </div>
    </div>
  );
}