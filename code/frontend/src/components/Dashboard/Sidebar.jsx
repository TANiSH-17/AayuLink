import React from 'react';
import {
  LayoutDashboard,
  History,
  ShieldAlert,
  Bot,
  FileScan,
  LogOut,
  ClipboardList,
  Globe,
  Users
} from 'lucide-react';

export default function Sidebar({ activeView, setActiveView, onLogout, onSwitchPatient, patientName }) {
  const patientNavItems = [
    { id: 'history', label: 'Patient History', icon: History },
    { id: 'emergency', label: 'Emergency Mode', icon: ShieldAlert },
    { id: 'ai_chat', label: 'AI Assistant', icon: Bot },
    { id: 'reports', label: 'Reports & Scans', icon: FileScan },
    { id: 'e_prescription', label: 'e-Prescriptions', icon: ClipboardList },
  ];

  return (
    // --- THIS IS THE FIX ---
    // The sidebar is now set to a fixed position on the screen and given a z-index
    // to ensure it stays on top of other content.
    <div className="hidden lg:flex flex-col w-64 bg-white border-r h-screen fixed top-0 left-0 z-30">
      {/* This header section has a fixed height and will not scroll */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-center h-20 border-b px-4">
          <LayoutDashboard className="h-8 w-8 text-green-600" />
          <h1 className="ml-3 text-2xl font-bold text-gray-800">AayuLink</h1>
        </div>

        {patientName && (
          <div className="p-4 text-center border-b">
              <p className="text-sm text-gray-500">Viewing Records For</p>
              <p className="font-bold text-green-700">{patientName}</p>
          </div>
        )}
      </div>

      {/* This nav section will grow to fill available space and will scroll if its content overflows */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {patientNavItems.map(item => (
          <a
            key={item.id}
            href="#"
            onClick={(e) => { e.preventDefault(); setActiveView(item.id); }}
            className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors
              ${activeView === item.id 
                ? 'bg-green-100 text-green-700' 
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`
            }
          >
            <item.icon className="h-5 w-5 mr-3" />
            {item.label}
          </a>
        ))}

        <div className="pt-4 mt-4 border-t border-gray-200">
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">System Tools</p>
            <a
                key="nationalPulse"
                href="#"
                onClick={(e) => { e.preventDefault(); setActiveView('nationalPulse'); }}
                className={`mt-2 flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors
                ${activeView === 'nationalPulse'
                    ? 'bg-green-100 text-green-700' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`
                }
            >
                <Globe className="h-5 w-5 mr-3" />
                National Health Pulse
            </a>
        </div>
      </nav>

      {/* This footer section has a fixed height, will not scroll, and is pushed to the bottom. */}
      <div className="flex-shrink-0 px-4 py-6 border-t space-y-2">
        <button
          onClick={onSwitchPatient}
          className="flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-100"
        >
          <Users className="h-5 w-5 mr-3" />
          Switch Patient
        </button>
        <button
          onClick={onLogout}
          className="flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
}

