import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer } from 'react-leaflet';
import { Bot, Bug, Wind, Biohazard, Droplets, Loader2 } from 'lucide-react';
import CustomHeatmapLayer from './CustomHeatmapLayer.jsx';
import PredictionCard from './PredictionCard';
import 'leaflet/dist/leaflet.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// -------- Mock data generator --------
const generateGeographicalData = (maxCases) => {
  const cities = [
    { name: 'Delhi', lat: 28.70, lng: 77.10 },
    { name: 'Mumbai', lat: 19.07, lng: 72.87 },
    { name: 'Kolkata', lat: 22.57, lng: 88.36 },
    { name: 'Chennai', lat: 13.08, lng: 80.27 },
    { name: 'Bengaluru', lat: 12.97, lng: 77.59 },
    { name: 'Hyderabad', lat: 17.38, lng: 78.48 },
    { name: 'Pune', lat: 18.52, lng: 73.85 },
    { name: 'Jaipur', lat: 26.91, lng: 75.78 },
  ];
  const points = [];
  for (let i = 0; i < 200; i++) {
    const city = cities[Math.floor(Math.random() * cities.length)];
    points.push({
      lat: city.lat + (Math.random() - 0.5) * 3,
      lng: city.lng + (Math.random() - 0.5) * 3,
      intensity: Math.random() * maxCases,
    });
  }
  return points;
};

const mockGeographicalData = {
  dengue: {
    name: 'Dengue Fever',
    color: 'bg-blue-500',
    icon: Bug,
    data: generateGeographicalData(150),
    totalCases: 9500,
    mostAffected: 'Southern & Coastal States',
  },
  influenza: {
    name: 'Influenza',
    color: 'bg-orange-500',
    icon: Wind,
    data: generateGeographicalData(120),
    totalCases: 7200,
    mostAffected: 'Northern Indian Plains',
  },
  covid19: {
    name: 'COVID-19',
    color: 'bg-red-500',
    icon: Biohazard,
    data: generateGeographicalData(250),
    totalCases: 18740,
    mostAffected: 'Major Metros Nationwide',
  },
  malaria: {
    name: 'Malaria',
    color: 'bg-teal-500',
    icon: Droplets,
    data: generateGeographicalData(180),
    totalCases: 5400,
    mostAffected: 'Eastern & Central States',
  },
};

export default function NationalHealthPulse() {
  const [activeDisease, setActiveDisease] = useState('covid19');
  const [predictions, setPredictions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [heatmapRadius, setHeatmapRadius] = useState(35);
  const [heatmapBlur, setHeatmapBlur] = useState(25);

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

  const diseaseInfo = mockGeographicalData[activeDisease];
  const DiseaseIcon = diseaseInfo.icon;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">National Health Pulse</h1>
        <p className="text-gray-500 mt-1">
          Live infectious disease tracking & AI-powered outbreak forecasting across India.
        </p>
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Disease Selector */}
          <div className="bg-white p-5 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Disease Selector
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.keys(mockGeographicalData).map((key) => {
                const Icon = mockGeographicalData[key].icon; // ✅ Extract component
                return (
                  <button
                    key={key}
                    onClick={() => setActiveDisease(key)}
                    className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors flex items-center justify-center gap-2 ${
                      activeDisease === key
                        ? 'bg-blue-500 text-white shadow'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Icon size={16} /> {/* ✅ Correct JSX */}
                    {mockGeographicalData[key].name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Heatmap Controls */}
          <div className="bg-white p-5 rounded-lg border border-gray-200">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="radius"
                  className="block text-sm font-semibold text-gray-600 mb-2"
                >
                  Heatmap Radius
                </label>
                <input
                  type="range"
                  id="radius"
                  min="10"
                  max="80"
                  value={heatmapRadius}
                  onChange={(e) => setHeatmapRadius(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="blur"
                  className="block text-sm font-semibold text-gray-600 mb-2"
                >
                  Heatmap Blur
                </label>
                <input
                  type="range"
                  id="blur"
                  min="10"
                  max="80"
                  value={heatmapBlur}
                  onChange={(e) => setHeatmapBlur(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Live Data Insights */}
          <div className="bg-white p-5 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Live Data Insights
            </h3>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <DiseaseIcon size={24} className="text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Selected Outbreak</p>
                <p className="font-bold text-gray-800">{diseaseInfo.name}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-gray-500">Total Reported Cases</p>
              <p className="text-3xl font-bold text-gray-900">
                {diseaseInfo.totalCases.toLocaleString()}
              </p>
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-500">Most Affected Region</p>
              <p className="font-semibold text-gray-800">{diseaseInfo.mostAffected}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Map */}
        <div className="lg:col-span-2 bg-white p-4 rounded-lg border border-gray-200 relative h-[600px]">
        <div className="absolute top-3 right-3 z-[1000] px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">
            Live Demonstration 
        </div>
          <MapContainer
            center={[22.5937, 78.9629]}
            zoom={5}
            style={{ height: '100%', width: '100%' }}
            className="rounded-md"
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            <CustomHeatmapLayer
              key={activeDisease}
              data={diseaseInfo.data}
              radius={heatmapRadius}
              blur={heatmapBlur}
            />
          </MapContainer>
        </div>
      </div>

      {/* Predictions */}
      <div className="bg-white p-8 rounded-2xl shadow-xl border overflow-hidden">
  <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
    <Bot size={28} className="text-indigo-600" />
    <span>AI-Powered Future Outbreak Forecasts</span>
  </h2>
  {isLoading ? (
    <div className="flex items-center justify-center p-8 text-slate-500">
      <Loader2 className="animate-spin mr-3" />
      <span>Generating predictions...</span>
    </div>
  ) : (
    // ✅ This container is now a horizontally scrolling flexbox
    <div className="flex gap-6 overflow-x-auto p-2 -m-2">
      {predictions.length > 0 ? (
        predictions.map((pred) => (
          // ✅ Each card is wrapped to control its size
          <div key={pred._id} className="flex-shrink-0 w-80">
            <PredictionCard prediction={pred} />
          </div>
        ))
      ) : (
        <div className="w-full text-slate-500 text-center py-8">
          <p>No active forecasts found.</p>
        </div>
      )}
    </div>
  )}
</div>
    </div>
  );
}
