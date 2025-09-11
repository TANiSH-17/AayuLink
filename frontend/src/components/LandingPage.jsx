// frontend/src/components/LandingPage.jsx

import React, { useState } from "react";
import LeafletMap from "./LeafletMap";
import { UserSquare, Landmark, HeartPulse } from 'lucide-react';

/* ---------- Main Landing Page Component ---------- */

export default function LandingPage({ onLogin, onSignUp, authError }) {
  const [role, setRole] = useState("individual");
  const [mode, setMode] = useState("signup");

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <header className="w-full border-b bg-white/70 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 rounded-md bg-green-700" />
            <span className="text-lg font-semibold tracking-tight text-gray-800">
              Government of India — Health
            </span>
          </div>
          <button className="border border-green-600 text-green-700 hover:bg-green-50 rounded-md text-sm px-3 py-1.5">
            हिंदी / English
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="h-[40%] w-full" style={{ background: "linear-gradient(180deg,#DFF5E1 0%, rgba(223,245,225,0) 100%)" }} />
          <div className="h-[20%] w-full" style={{ background: "linear-gradient(180deg,#FFE4EA 0%, rgba(255,228,234,0) 100%)" }} />
          <div className="h-[20%] w-full" style={{ background: "linear-gradient(180deg,#FFF6CC 0%, rgba(255,246,204,0) 100%)" }} />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-8 grid lg:grid-cols-2 gap-8 items-start">
            <div className="flex flex-col gap-6">
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
                    One Nation, <span className="text-green-700">One Health</span>
                </h1>
                <p className="text-gray-600 leading-relaxed max-w-prose">
                    A unified digital front door for citizens, providers, and administrators—securely connecting hospitals, health IDs, and services across India.
                </p>
                <AccessPortal
                    role={role} setRole={setRole} mode={mode} setMode={setMode}
                    onLogin={onLogin} onSignUp={onSignUp} authError={authError}
                />
            </div>
            <div className="relative">
                <div className="rounded-3xl p-4 sm:p-6 bg-white/80 backdrop-blur border border-green-100 shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold tracking-wide text-green-700 uppercase">National Coverage</span>
                        <span className="text-xs text-gray-500">Hospitals onboarded • Live</span>
                    </div>
                    <div className="relative">
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-4 py-1 rounded-full border border-gray-200 shadow-sm z-10">
                        <span className="text-sm font-semibold tracking-wide text-gray-800">“One Nation, One Health”</span>
                        </div>
                        <LeafletMap />
                    </div>
                    <div className="mt-6 grid grid-cols-3 items-center gap-4">
                        <div className="flex justify-center"><AadhaarLogo /></div>
                        <div className="flex justify-center"><PANLogo /></div>
                        <div className="flex justify-center"><ABHALogo /></div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Advertising Section */}
      <section className="py-16 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">The Aadhar for Your Health</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg leading-8 text-gray-600">Every critical part of your life has a unified digital identity. Your health deserves one too.</p>
            <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-3 text-left">
                <div className="flex flex-col items-center md:items-start text-center md:text-left">
                    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-yellow-100"><UserSquare className="h-6 w-6 text-yellow-700" /></div>
                    <h3 className="mt-5 text-lg font-semibold text-gray-900">Your Identity: Aadhaar</h3>
                    <p className="mt-2 text-base text-gray-600">The foundational identity for every citizen, unlocking services and benefits nationwide.</p>
                </div>
                <div className="flex flex-col items-center md:items-start text-center md:text-left">
                    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-100"><Landmark className="h-6 w-6 text-blue-700" /></div>
                    <h3 className="mt-5 text-lg font-semibold text-gray-900">Your Finances: PAN</h3>
                    <p className="mt-2 text-base text-gray-600">The key to your financial life, from taxes to investments, unified under one digital roof.</p>
                </div>
                <div className="flex flex-col items-center md:items-start text-center md:text-left">
                    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-green-100"><HeartPulse className="h-6 w-6 text-green-700" /></div>
                    <h3 className="mt-5 text-lg font-semibold text-gray-900">Your Health: ABHA</h3>
                    <p className="mt-2 text-base text-gray-600">The missing piece is here. ABHA is your secure, unified health account, linking your entire medical history across all hospitals—with your consent.</p>
                </div>
            </div>
        </div>
      </section>

      {/* Info band */}
      <section className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-4">
            <InfoCard title="Unified Health Identity" bg="#DFF5E1" border="border-green-200">Link your ABHA, Aadhaar, and PAN for seamless access to records with citizen consent.</InfoCard>
            <InfoCard title="Privacy by Design" bg="#FFE4EA" border="border-pink-200">Your data is encrypted end-to-end and shared only with explicit permissions.</InfoCard>
            <InfoCard title="Nationwide Network" bg="#FFF6CC" border="border-yellow-200">Public and private hospitals are being onboarded across all states and UTs.</InfoCard>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-sm text-gray-600 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>©️ {new Date().getFullYear()} Ministry of Health & Family Welfare, Government of India</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-gray-900">Terms</a>
            <a href="#" className="hover:text-gray-900">Privacy</a>
            <a href="#" className="hover:text-gray-900">Accessibility</a>
          </div>
        </div>
      </footer>
    </div>
  );
}


/* ---------- Helper Components (Must be in the same file) ---------- */

function AccessPortal({ role, setRole, mode, setMode, onLogin, onSignUp, authError }) {
  const [formData, setFormData] = useState({
    username: '', password: '', confirmPassword: '', hospitalCode: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'signup') {
      if (formData.password !== formData.confirmPassword) {
        alert("Passwords do not match!");
        return;
      }
      onSignUp(formData.username, formData.password, role);
    } else {
      onLogin(formData.username, formData.password, role, formData.hospitalCode);
    }
  };

  return (
    <div className="shadow-lg border border-green-100 rounded-2xl p-6 bg-white max-w-md">
      <div className="inline-flex rounded-xl border overflow-hidden">
        <button onClick={() => setRole("individual")} className={`px-4 py-2 text-sm ${role === "individual" ? "bg-green-600 text-white" : "text-gray-700 hover:bg-gray-50"}`}>Individual</button>
        <button onClick={() => setRole("admin")} className={`px-4 py-2 text-sm border-l ${role === "admin" ? "bg-green-600 text-white" : "text-gray-700 hover:bg-gray-50"}`}>Admin</button>
      </div>
      <div className="mt-4">
        <h2 className="text-lg font-semibold text-gray-900">{role === "individual" ? "Individual" : "Admin"} {mode === "signup" ? "Sign Up" : "Login"}</h2>
      </div>
      <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
        <Field label="Username" name="username" value={formData.username} onChange={handleChange} required />
        <Field type="password" label="Password" name="password" value={formData.password} onChange={handleChange} required />
        {mode === 'signup' && (
          <Field type="password" label="Confirm Password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
        )}
        {role === 'admin' && (
           <Field label="Hospital Code" name="hospitalCode" value={formData.hospitalCode} onChange={handleChange} placeholder="Enter hospital code" required />
        )}
        {authError && <p className="text-sm text-red-600">{authError}</p>}
        <button type="submit" className="w-full inline-flex items-center justify-center rounded-md bg-green-600 text-white px-4 py-2 font-medium hover:bg-green-700">
          {mode === "signup" ? "Create Account" : "Login"}
        </button>
      </form>
      <div className="mt-3 text-xs text-gray-600">
        {mode === "signup" ? (
          <> Already a user?{" "} <button onClick={() => setMode("login")} className="text-green-700 underline">Login</button> </>
        ) : (
          <> New here?{" "} <button onClick={() => setMode("signup")} className="text-green-700 underline">Create an account</button> </>
        )}
      </div>
    </div>
  );
}

function Field({ label, name, type = "text", required, value, onChange, placeholder }) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={name} className="text-sm font-medium text-gray-800">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      <input
        id={name} name={name} type={type} required={required}
        value={value} onChange={onChange} placeholder={placeholder}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-200"
      />
    </div>
  );
}

function InfoCard({ title, children, bg, border }) {
  return (
    <div className={`rounded-xl p-4 border ${border}`} style={{ background: bg }}>
      <div className="text-gray-900 font-semibold">{title}</div>
      <p className="text-sm text-gray-700 mt-1">{children}</p>
    </div>
  );
}

function AadhaarLogo() {
  return (
    <svg width="72" height="36" viewBox="0 0 72 36" className="drop-shadow-sm">
      <defs>
        <linearGradient id="sun" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f59e0b" /><stop offset="100%" stopColor="#facc15" />
        </linearGradient>
      </defs>
      <circle cx="18" cy="18" r="8" fill="url(#sun)" />
      {[...Array(8)].map((_, i) => (
        <rect key={i} x="18" y="2" width="2" height="8" fill="#ef4444" transform={`rotate(${i * 45} 18 18)`} rx="1" />
      ))}
      <text x="30" y="22" fontSize="12" fontWeight="700" fill="#111827">Aadhaar</text>
    </svg>
  );
}
function PANLogo() {
  return (
    <svg width="72" height="36" viewBox="0 0 72 36" className="drop-shadow-sm">
      <rect x="1" y="4" width="70" height="28" rx="6" fill="#dbeafe" stroke="#60a5fa" />
      <text x="12" y="23" fontSize="14" fontWeight="700" fill="#1e3a8a">PAN</text>
    </svg>
  );
}
function ABHALogo() {
  return (
    <svg width="72" height="36" viewBox="0 0 72 36" className="drop-shadow-sm">
      <rect x="1" y="4" width="70" height="28" rx="6" fill="#dcfce7" stroke="#34d399" />
      <text x="10" y="23" fontSize="12" fontWeight="700" fill="#065f46">ABHA</text>
    </svg>
  );
}