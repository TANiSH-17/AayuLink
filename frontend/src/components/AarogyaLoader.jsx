import React from 'react';
import { HeartPulse, Plus } from 'lucide-react';

/**
 * A visually polished loading screen for the AayuLink project.
 * Its visibility and fade-out animation are controlled by the `isExiting` prop.
 * @param {object} props
 * @param {boolean} props.isExiting - When true, the component will fade out.
 */
export default function AarogyaLoader({ isExiting }) {
  return (
    // The main container. It covers the screen and centers everything.
    // Its opacity changes based on the isExiting prop to create the fade-out effect.
    <div
      className={`fixed inset-0 z-40 flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 font-sans transition-opacity duration-800 ease-in-out ${
        isExiting ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Decorative background elements */}
      <Plus className="absolute -top-1/4 -right-1/4 h-1/2 w-1/2 text-emerald-200/50 animate-spin-slow opacity-50 blur-sm" />
      <Plus className="absolute -bottom-1/4 -left-1/4 h-1/2 w-1/2 text-green-200/50 animate-spin-slow opacity-50 blur-sm" />

      {/* This is the single, centered content container */}
      <div className="flex flex-col items-center">
        <div className="flex items-center space-x-4 drop-shadow-md">
          <HeartPulse
            className="h-24 w-24 text-green-700 animate-heartbeat-effect"
            strokeWidth={1.5}
            style={{ animationDelay: '100ms' }}
          />
          <h1 className="text-8xl font-extrabold tracking-tighter">
            <span className="inline-block text-orange-600 animate-fade-in-up" style={{ animationDelay: '200ms' }}>Aa</span>
            <span className="inline-block text-gray-800 animate-fade-in-up" style={{ animationDelay: '300ms' }}>yu</span>
            <span className="inline-block text-green-700 animate-fade-in-up" style={{ animationDelay: '400ms' }}>Link</span>
          </h1>
        </div>
        <p className="mt-6 text-xl text-gray-700 font-medium animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          Your Unified Digital Health Ecosystem
        </p>
      </div>

      {/* The India Flag Colors at the bottom */}
      <div className="absolute bottom-0 w-full h-3 flex">
        <div className="w-1/3 bg-orange-500"></div>
        <div className="w-1/3 bg-white"></div>
        <div className="w-1/3 bg-green-500"></div>
      </div>
    </div>
  );
}
