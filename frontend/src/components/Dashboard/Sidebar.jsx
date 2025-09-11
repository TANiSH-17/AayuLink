import React from 'react';
// CORRECTED: Replaced 'ClipboardText' with the correct icon name 'ClipboardList'
import { LayoutDashboard, History, ShieldAlert, Bot, FileScan, LogOut, ClipboardList } from 'lucide-react';

export default function Sidebar({ activeView, setActiveView, onLogout }) {
  const navItems = [
    { id: 'history', label: 'Patient History', icon: History },
    { id: 'emergency', label: 'Emergency Mode', icon: ShieldAlert },
    { id: 'ai_chat', label: 'AI Assistant', icon: Bot },
    { id: 'reports', label: 'Reports & Scans', icon: FileScan },
    // This now uses the correct icon name
    { id: 'eprescription', label: 'e-Prescriptions', icon: ClipboardList },
  ];

  return (
    <div className="hidden lg:flex flex-col w-64 bg-white border-r">
      <div className="flex items-center justify-center h-20 border-b">
        <LayoutDashboard className="h-8 w-8 text-green-600" />
        <h1 className="ml-3 text-2xl font-bold text-gray-800">Aarogya</h1>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map(item => (
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
      </nav>
      <div className="px-4 py-6 border-t">
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

