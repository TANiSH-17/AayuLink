import React, { useState, useEffect } from 'react';
import axios from 'axios';
import HeatMap from '@uiw/react-heat-map'; // ✅ NEW: Import the new heatmap component
import { Bug, Wind, Biohazard, Droplets, Loader2 } from 'lucide-react';
import PredictionCard from './PredictionCard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// --- MOCK DATA FOR HEATMAP ---
const generateHeatMapData = (count, max) => {
  const data = [];
  for (let i = 0; i < count; i++) {
    data.push({
      date: `2025/${Math.floor(Math.random() * 12) + 1}/${Math.floor(Math.random() * 28) + 1}`,
      count: Math.floor(Math.random() * max),
    });
  }
  return data;
};

const mockData = {
    dengue: { name: 'Dengue Fever', color: 'blue', icon: Bug, mostAffected: 'Southern & Coastal States', data: generateHeatMapData(200, 150) },
    influenza: { name: 'Influenza', color: 'orange', icon: Wind, mostAffected: 'Northern Indian Plains', data: generateHeatMapData(200, 120) },
    covid19: { name: 'COVID-19', color: 'red', icon: Biohazard, mostAffected: 'Major Metros Nationwide', data: generateHeatMapData(200, 250) },
    malaria: { name: 'Malaria', color: 'teal', icon: Droplets, mostAffected: 'Eastern & Central States', data: generateHeatMapData(200, 180) }
};

export default function NationalHealthPulse() {
    const [activeDisease, setActiveDisease] = useState('dengue');
    const [predictions, setPredictions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPredictions = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`${API_URL}/api/predictions`);
                setPredictions(response.data);
            } catch (err) {
                console.error('Failed to fetch predictions:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPredictions();
    }, []);

    const diseaseInfo = mockData[activeDisease];
    const DiseaseIcon = diseaseInfo.icon;
    const totalCases = diseaseInfo.data.reduce((sum, item) => sum + item.count, 0);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">National Health Pulse</h1>
                <p className="text-gray-600 mt-1">Live infectious disease tracking and outbreak forecasting.</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 uppercase tracking-wider">Live Outbreak Calendar</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <aside className="lg:col-span-1 space-y-4">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Disease Selector</h3>
                            <div className="grid grid-cols-2 gap-3 mt-2">
                               {Object.keys(mockData).map(key => (
                                    <button key={key} onClick={() => setActiveDisease(key)}
                                        className={`p-3 text-sm font-bold rounded-lg shadow-sm transition-all duration-200 border-2 flex items-center justify-center ${
                                            activeDisease === key
                                                ? `bg-${mockData[key].color}-500 text-white border-${mockData[key].color}-700`
                                                : 'bg-slate-50 text-slate-800 hover:bg-slate-100 border-transparent'
                                        }`}
                                    >{mockData[key].name}</button>
                               ))}
                            </div>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl mt-4">
                            <h3 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">Live Data Insights</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-${diseaseInfo.color}-100`}>
                                        <DiseaseIcon size={28} className={`text-${diseaseInfo.color}-600`} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Selected Outbreak</p>
                                        <h4 className="text-lg font-bold text-slate-800">{diseaseInfo.name}</h4>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Total Reported Cases (Mock)</p>
                                    <p className="text-3xl font-extrabold text-slate-900">{totalCases.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Most Affected Areas</p>
                                    <p className="font-semibold text-slate-800">{diseaseInfo.mostAffected}</p>
                                </div>
                            </div>
                        </div>
                    </aside>
                    
                    <div className="lg:col-span-2 w-full rounded-xl shadow-lg border border-slate-200 z-10 p-4 overflow-hidden">
                        <HeatMap
                            value={diseaseInfo.data}
                            width="100%"
                            height={300}
                            startDate={new Date('2025/01/01')}
                            endDate={new Date('2025/12/31')}
                            rectSize={12}
                            legendCellSize={0}
                            panelColors={{ 0: '#f1f5f9', 20: '#60a5fa', 60: '#34d399', 100: '#f59e0b', 150: '#ef4444' }}
                        />
                    </div>
                </div>
            </div>
            <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Future Outbreak Forecasts</h2>
                 {isLoading ? (
                    <div className="flex items-center justify-center p-8 text-slate-500">
                        <Loader2 className="animate-spin mr-3" />
                        <span>Generating AI-powered predictions...</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {predictions.length > 0 ? (
                            predictions.map((pred) => (<PredictionCard key={pred._id} prediction={pred} />))
                        ) : (
                            <p className="text-slate-500 col-span-full text-center py-8">No active forecasts found. The prediction model may be running.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}