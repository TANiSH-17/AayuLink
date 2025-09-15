import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// ✅ The problematic 'import "leaflet.heat"' line has been REMOVED.
import { Bug, Wind, Biohazard, Droplets, Loader2 } from 'lucide-react';
import axios from 'axios';
import PredictionCard from './PredictionCard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// --- MOCK DATA GENERATION ---
const generateRandomPoints = (centerLat, centerLng, radius, count, intensityModifier) => {
    const points = [];
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * 2 * Math.PI;
        const distance = Math.random() * radius;
        const lat = centerLat + (distance * Math.cos(angle)) / 111.32;
        const lng = centerLng + (distance * Math.sin(angle)) / (111.32 * Math.cos(centerLat * Math.PI / 180));
        points.push([lat, lng, Math.random() * intensityModifier]);
    }
    return points;
};

const mockData = {
    dengue: { name: 'Dengue Fever', color: 'blue', icon: Bug, mostAffected: 'Southern & Coastal States', points: [ ...generateRandomPoints(10.0, 76.3, 100, 2200, 0.9), ...generateRandomPoints(18.5, 73.8, 120, 2800, 0.8), ...generateRandomPoints(13.0, 80.2, 90, 2500, 0.8), ] },
    influenza: { name: 'Influenza', color: 'orange', icon: Wind, mostAffected: 'Northern Indian Plains', points: [ ...generateRandomPoints(28.6, 77.2, 150, 3000, 0.7), ...generateRandomPoints(30.7, 76.7, 90, 2200, 0.6), ...generateRandomPoints(26.8, 80.9, 130, 2800, 0.5), ] },
    covid19: { name: 'COVID-19', color: 'red', icon: Biohazard, mostAffected: 'Major Metros Nationwide', points: [ ...generateRandomPoints(28.6, 77.2, 80, 2500, 1.0), ...generateRandomPoints(19.0, 72.8, 90, 2800, 0.9), ...generateRandomPoints(12.9, 77.5, 70, 2200, 0.8), ...generateRandomPoints(22.5, 88.3, 75, 2000, 0.8), ] },
    malaria: { name: 'Malaria', color: 'teal', icon: Droplets, mostAffected: 'Eastern & Central States', points: [ ...generateRandomPoints(20.2, 85.8, 150, 3200, 1.0), ...generateRandomPoints(21.2, 81.6, 160, 2800, 0.9), ...generateRandomPoints(23.3, 85.3, 140, 3000, 0.9), ] }
};

export default function NationalHealthPulse() {
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const heatLayerRef = useRef(null);
    const [activeDisease, setActiveDisease] = useState('dengue');
    const [intensity, setIntensity] = useState(25);
    const [blur, setBlur] = useState(15);
    const [predictions, setPredictions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (mapContainerRef.current && !mapInstanceRef.current) {
            const map = L.map(mapContainerRef.current).setView([22.5937, 78.9629], 5);
            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
            }).addTo(map);
            mapInstanceRef.current = map;
            
            // This relies on the script tag in index.html to have loaded L.heatLayer
            if (L.heatLayer) {
                const heatLayer = L.heatLayer([], { radius: 25, blur: 15, maxZoom: 12 }).addTo(map);
                heatLayerRef.current = heatLayer;
            } else {
                console.error("Leaflet.heat plugin not loaded correctly.");
            }
        }
    }, []);

    useEffect(() => {
        if (heatLayerRef.current) {
            const diseaseData = mockData[activeDisease];
            if (diseaseData) {
                heatLayerRef.current.setLatLngs(diseaseData.points);
                heatLayerRef.current.setOptions({ radius: intensity, blur: blur });
            }
        }
    }, [activeDisease, intensity, blur]);
    
    useEffect(() => {
        const fetchPredictions = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`${API_URL}/api/predictions`);
                setPredictions(response.data);
            } catch (error) {
                console.error("Failed to fetch predictions:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPredictions();
    }, []);

    const diseaseInfo = mockData[activeDisease];
    const DiseaseIcon = diseaseInfo.icon;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">National Health Pulse</h1>
                <p className="text-gray-600 mt-1">
                    Live infectious disease tracking and outbreak forecasting.
                </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 uppercase tracking-wider">
                    Live Outbreak Heatmap
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <aside className="lg:col-span-1 space-y-4">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                                Disease Selector
                            </h3>
                            <div className="grid grid-cols-2 gap-3 mt-2">
                                {Object.keys(mockData).map((key) => (
                                    <button
                                        key={key}
                                        onClick={() => setActiveDisease(key)}
                                        className={`p-3 text-sm font-bold rounded-lg shadow-sm transition-all duration-200 border-2 flex items-center justify-center ${
                                            activeDisease === key
                                                ? `bg-${mockData[key].color}-500 text-white border-${mockData[key].color}-700`
                                                : 'bg-slate-50 text-slate-800 hover:bg-slate-100 border-transparent'
                                        }`}
                                    >
                                        {mockData[key].name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="intensity" className="text-sm font-semibold text-slate-500 block uppercase tracking-wider">
                                Radius
                            </label>
                            <input id="intensity" type="range" min="10" max="40" value={intensity} onChange={(e) => setIntensity(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer mt-2" />
                        </div>

                        <div>
                            <label htmlFor="blur" className="text-sm font-semibold text-slate-500 block uppercase tracking-wider">
                                Blur
                            </label>
                            <input id="blur" type="range" min="5" max="25" value={blur} onChange={(e) => setBlur(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer mt-2" />
                        </div>

                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl mt-4">
                            <h3 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">
                                Live Data Insights
                            </h3>
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
                                    <p className="text-xs text-slate-500">Total Reported Cases</p>
                                    <p className="text-3xl font-extrabold text-slate-900">{diseaseInfo.points.length.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Most Affected Areas</p>
                                    <p className="font-semibold text-slate-800">{diseaseInfo.mostAffected}</p>
                                </div>
                            </div>
                        </div>
                    </aside>

                    <div ref={mapContainerRef} className="lg:col-span-2 min-h-[500px] w-full rounded-xl shadow-lg border border-slate-200 z-10"></div>
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                    🔮 Future Outbreak Forecasts
                </h2>
                {isLoading ? (
                    <div className="flex items-center justify-center p-8 text-slate-500">
                        <Loader2 className="animate-spin mr-3" />
                        <span>Generating AI-powered predictions...</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {predictions.length > 0 ? (
                            predictions.map((pred) => (
                                <PredictionCard key={pred._id} prediction={pred} />
                            ))
                        ) : (
                            <p className="text-slate-500 col-span-full text-center py-8">
                                No active forecasts found. The prediction model may be running.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}