import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const getSusceptibilityColor = (value) => {
  if (value > 85) return 'bg-emerald-500';
  if (value > 65) return 'bg-emerald-400';
  if (value > 50) return 'bg-yellow-400';
  if (value > 30) return 'bg-orange-500';
  return 'bg-red-500';
};

export default function Antibiogram() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(`${API_URL}/api/analytics/antibiogram`);
        setData(res.data);
      } catch (error) {
        console.error("Failed to fetch antibiogram data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return <div className="text-center p-8">Loading Antibiogram...</div>;
  }
  
  const antibiotics = data[0]?.susceptibility.map(s => s.antibiotic) || [];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm border-separate border-spacing-1">
        <thead>
          <tr>
            <th className="p-2 text-left font-semibold text-slate-600">Pathogen</th>
            {antibiotics.map(name => (
              <th key={name} className="p-2 font-semibold text-slate-600 w-24 text-center">{name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map(({ pathogen, susceptibility }) => (
            <tr key={pathogen}>
              <td className="p-2 font-bold text-slate-800">{pathogen}</td>
              {susceptibility.map(({ antibiotic, value }) => (
                <td key={`${pathogen}-${antibiotic}`} className="p-2">
                  <div className={`w-full h-12 flex items-center justify-center rounded-lg text-white font-bold text-base ${getSusceptibilityColor(value)}`}>
                    {value}%
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}