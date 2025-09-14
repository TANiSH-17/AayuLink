import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat'; // This plugin attaches itself to the L object
import { Bug, Wind, Biohazard, Droplets } from 'lucide-react';

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
    dengue: {
        name: 'Dengue Fever',
        color: 'blue',
        icon: Bug,
        mostAffected: 'Coastal & Urban Areas',
        points: [
            ...generateRandomPoints(19.0760, 72.8777, 150, 2500, 0.8), // Mumbai
            ...generateRandomPoints(12.9716, 77.5946, 120, 2000, 0.7), // Bangalore
            ...generateRandomPoints(22.5726, 88.3639, 130, 2200, 0.9), // Kolkata
        ]
    },
    influenza: {
        name: 'Influenza',
        color: 'orange',
        icon: Wind,
        mostAffected: 'Northern & Central India',
        points: [
            ...generateRandomPoints(28.6139, 77.2090, 250, 4000, 0.6), // Delhi
            ...generateRandomPoints(26.9124, 75.7873, 200, 3000, 0.5), // Jaipur
        ]
    },
    covid19: {
        name: 'COVID-19',
        color: 'red',
        icon: Biohazard,
        mostAffected: 'Major Metros Nationwide',
        points: [
            ...generateRandomPoints(28.6139, 77.2090, 100, 5000, 1.0), // Delhi
            ...generateRandomPoints(19.0760, 72.8777, 100, 4500, 0.9), // Mumbai
        ]
    },
    malaria: {
        name: 'Malaria',
        color: 'teal',
        icon: Droplets,
        mostAffected: 'Eastern & Forested Regions',
        points: [
            ...generateRandomPoints(23.8315, 86.4412, 180, 3500, 0.9), // Jharkhand
            ...generateRandomPoints(21.2787, 81.8661, 200, 3000, 1.0), // Chhattisgarh
        ]
    }
};

export default function NationalHealthPulse() {
    const mapRef = useRef(null);
    const heatLayerRef = useRef(null);
    const [activeDisease, setActiveDisease] = useState('dengue');
    const [intensity, setIntensity] = useState(25);
    const [blur, setBlur] = useState(15);

    // This single useEffect handles both map initialization and updates
    useEffect(() => {
        // Initialize map only once when the component mounts
        if (!mapRef.current && document.getElementById('health-map')) {
            const map = L.map('health-map').setView([22.5937, 78.9629], 5);
            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            }).addTo(map);
            mapRef.current = map;

            // Initialize the heat layer and store a reference to it
            heatLayerRef.current = L.heatLayer([], {
                radius: intensity,
                blur: blur,
                maxZoom: 12,
            }).addTo(mapRef.current);
        }

        // Update the heatmap layer whenever the disease or settings change
        if (heatLayerRef.current) {
            const diseaseData = mockData[activeDisease];
            if (diseaseData) {
                heatLayerRef.current.setLatLngs(diseaseData.points);
                heatLayerRef.current.setOptions({ radius: intensity, blur: blur });
            }
        }
    }, [activeDisease, intensity, blur]); // Re-run this effect when these values change

    const diseaseInfo = mockData[activeDisease];
    const DiseaseIcon = diseaseInfo.icon;

    return (
        <div className="flex flex-col h-screen bg-slate-50 font-sans">
             <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 p-3 shadow-sm z-30">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                        AayuLink: <span className="text-green-700"> National Health Pulse</span>
                    </h1>
                     <div className="flex items-center gap-2 bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1.5 rounded-full">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                        Live Demonstration 
                    </div>
                </div>
            </header>
            <main className="flex-grow flex overflow-hidden">
                <aside className="w-96 bg-white border-r border-slate-200 z-20 flex flex-col p-4 shadow-lg overflow-y-auto">
                    {/* Disease Selector */}
                    <div className="mb-6">
                        <h2 className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider">Disease Selector</h2>
                        <div className="grid grid-cols-2 gap-2">
                           {Object.keys(mockData).map(key => (
                                <button key={key} onClick={() => setActiveDisease(key)} 
                                    className={`disease-btn flex items-center justify-center gap-2 p-3 font-semibold rounded-lg shadow-sm transition-all duration-200 border-2 ${activeDisease === key ? `bg-${mockData[key].color}-500 text-white border-${mockData[key].color}-700` : 'bg-slate-100 text-slate-700 border-transparent'}`}>
                                    {mockData[key].name}
                                </button>
                           ))}
                        </div>
                    </div>
                    {/* Controls */}
                    <div className="mb-6">
                        <label htmlFor="intensity" className="text-sm font-semibold text-slate-500 mb-2 block uppercase tracking-wider">Heatmap Radius</label>
                        <input id="intensity" type="range" min="10" max="40" value={intensity} onChange={e => setIntensity(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="blur" className="text-sm font-semibold text-slate-500 mb-2 block uppercase tracking-wider">Heatmap Blur</label>
                        <input id="blur" type="range" min="5" max="25" value={blur} onChange={e => setBlur(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                    </div>
                    {/* Data Insights */}
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex-grow">
                        <h2 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">Live Data Insights</h2>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors duration-300 bg-${diseaseInfo.color}-100`}>
                                    <DiseaseIcon size={28} className={`text-${diseaseInfo.color}-600`} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Selected Outbreak</p>
                                    <h3 className="text-lg font-bold text-slate-800">{diseaseInfo.name}</h3>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Total Reported Cases (Mock)</p>
                                <p className="text-3xl font-extrabold text-slate-900">{diseaseInfo.points.length.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Most Affected Region</p>
                                <p className="text-lg font-semibold text-slate-800">{diseaseInfo.mostAffected}</p>
                            </div>
                        </div>
                    </div>
                </aside>
                {/* Map Container */}
                <div id="health-map" className="flex-grow h-full z-10"></div>
            </main>
        </div>
    );
}

