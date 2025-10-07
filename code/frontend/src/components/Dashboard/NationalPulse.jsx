import React, { useEffect, useRef } from 'react';
import { Siren, AlertTriangle, Info, X } from 'lucide-react';

const pulseEvents = [
  { level: 'critical', title: 'New MRSA Outbreak Detected', location: 'AIIMS Delhi', time: '2m ago' },
  { level: 'warning', title: 'Risk Level Elevated', location: 'Medanta, Gurugram', time: '1h ago' },
  { level: 'info', title: 'Containment Protocols Successful', location: 'Jaslok Hospital, Mumbai', time: '3h ago' },
  { level: 'warning', title: 'Unusual Spike in CRE Cases', location: 'KEM Hospital, Mumbai', time: '8h ago' },
  { level: 'info', title: 'Risk Level Decreased', location: 'Fortis BG Road, Bengaluru', time: '1d ago' },
  { level: 'critical', title: 'New Patient Positive for CRE', location: 'Apollo, Hyderabad', time: '2d ago' },
];

const eventStyles = {
  critical: { Icon: Siren, iconColor: 'text-red-600', borderColor: 'border-red-500' },
  warning: { Icon: AlertTriangle, iconColor: 'text-amber-600', borderColor: 'border-amber-500' },
  info: { Icon: Info, iconColor: 'text-sky-600', borderColor: 'border-sky-500' },
};

// --- 1. Accept the new bellRef prop ---
export default function NationalPulse({ onClose, bellRef }) {
  const pulseRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      // --- 2. Add a check to ignore clicks on the bell icon ---
      if (bellRef.current && bellRef.current.contains(event.target)) {
        return;
      }
      if (pulseRef.current && !pulseRef.current.contains(event.target)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [pulseRef, onClose, bellRef]); // <-- 3. Add bellRef to dependency array

  return (
    <div ref={pulseRef} className="absolute top-full mt-2 right-0 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-2xl z-[1001]">
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <h3 className="text-lg font-bold text-gray-900">National Health Pulse</h3>
        <button onClick={onClose} className="p-1 rounded-full text-slate-500 hover:bg-slate-100">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="p-2 max-h-96 overflow-y-auto">
        <div className="space-y-2 p-2">
            {pulseEvents.map((event, index) => {
              const { Icon, iconColor, borderColor } = eventStyles[event.level];
              return (
                <div key={index} className={`flex items-start gap-3 p-3 border-l-4 ${borderColor} bg-slate-50 rounded-r-md`}>
                  <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
                  <div>
                    <p className="font-semibold text-sm text-gray-800">{event.title}</p>
                    <p className="text-xs text-gray-500">
                      {event.location} • <span className="font-medium">{event.time}</span>
                    </p>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}