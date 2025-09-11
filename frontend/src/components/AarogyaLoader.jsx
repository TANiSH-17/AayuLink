// frontend/src/components/AarogyaLoader.jsx
import React from 'react';
import { HeartPulse } from 'lucide-react'; // Using HeartPulse as a health icon

export default function AarogyaLoader() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-white to-green-50 z-50">
      <div className="flex items-center space-x-4 mb-8 animate-pulse">
        <HeartPulse className="h-24 w-24 text-green-700" strokeWidth={1.5} />
        <h1 className="text-8xl font-extrabold tracking-tighter">
          <span className="text-orange-600">Aa</span>
          <span className="text-gray-800">rog</span>
          <span className="text-green-700">ya</span>
        </h1>
      </div>
      <p className="text-xl md:text-2xl text-gray-700 font-semibold mt-4 animate-fade-in">
        Your Unified Digital Health Ecosystem for India
      </p>

      {/* Subtle India Flag Colors at the bottom (optional, but adds a nice touch) */}
      <div className="absolute bottom-0 w-full h-8 flex">
        <div className="w-1/3 bg-orange-500"></div> {/* Saffron */}
        <div className="w-1/3 bg-white"></div>     {/* White */}
        <div className="w-1/3 bg-green-500"></div>   {/* Green */}
      </div>
    </div>
  );
}
