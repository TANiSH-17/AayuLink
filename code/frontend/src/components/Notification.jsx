import React from 'react';
import { CheckCircle } from 'lucide-react';

export default function Notification({ message, show }) {
  return (
    <div 
      className={`fixed top-5 right-5 flex items-center bg-slate-800 text-white p-4 rounded-lg shadow-2xl transition-all duration-500 ease-in-out z-[100] border-l-4 border-green-500 ${show ? 'transform translate-x-0 opacity-100' : 'transform translate-x-full opacity-0'}`}
    >
      <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
      <p className="font-medium text-sm">{message}</p>
    </div>
  );
}