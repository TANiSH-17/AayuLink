import React, { useState, useEffect } from 'react';
import { User, Shield, Building, Hospital as HospitalIcon } from 'lucide-react';
import LeafletMap from './LeafletMap.jsx';
import { useLanguage } from '../contexts/LanguageContext.jsx';

// A reusable form field component for a clean, consistent UI
function Field({ name, label, type, placeholder, icon: Icon, value, onChange, required = false }) {
    return (
        <div>
            <label htmlFor={name} className="text-sm font-semibold text-gray-700">{label}</label>
            <div className="relative mt-1">
                <input
                    id={name} name={name} type={type}
                    value={value} onChange={onChange}
                    className="w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder={placeholder} required={required}
                />
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
        </div>
    );
}

// The component is now wrapped to handle its own fade-in animation
export default function LandingPage(props) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50); 
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className={`transition-all duration-1000 ease-in-out ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
      style={{ willChange: 'opacity, transform' }}
    >
        <OriginalLandingPage {...props} />
    </div>
  );
}

// Your original LandingPage component is now renamed and placed here
function OriginalLandingPage({ onLogin, onSignUp, authError, onValidatorClick }) {
  const { toggleLanguage, t } = useLanguage();
  const [role, setRole] = useState('individual');
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({ username: '', password: '', hospitalName: '', specialCode: '' });
  const [isLoading, setIsLoading] = useState(false);
  // --- FIX: This component will now manage its own error and success messages for registration ---
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError('');
    setFormSuccess('');

    if (mode === 'login') {
      await onLogin(formData.username, formData.password, role);
    } else {
      // --- FIX: Wrap signup in a try/catch to handle success and error messages internally ---
      try {
        await onSignUp(
          formData.username,
          formData.password,
          role,
          formData.hospitalName,
          formData.specialCode
        );
        setFormSuccess('Registration successful! Please switch to Login.');
        // Clear the form on success
        setFormData({ username: '', password: '', hospitalName: '', specialCode: '' });
      } catch (err) {
        // This will catch registration-specific errors
        setFormError(err.message || 'Registration failed. Please try again.');
      }
    }
    setIsLoading(false);
  };

  const clearMessages = () => {
      setFormError('');
      setFormSuccess('');
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="w-full border-b bg-white/70 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-md bg-green-700" />
                <span className="text-lg font-semibold tracking-tight text-gray-800">AayuLink</span>
            </div>
            <div className="flex items-center space-x-4">
                 <button onClick={onValidatorClick} className="font-semibold text-sm text-gray-600 hover:text-green-700">
                    Pharmacist / Lab Portal
                </button>
                <button onClick={toggleLanguage} className="border border-green-600 text-green-700 hover:bg-green-50 rounded-md text-sm px-3 py-1.5 w-24">
                    {t.langButton}
                </button>
            </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-8 grid lg:grid-cols-2 gap-8 items-start">
            <div className="flex flex-col gap-6">
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
                    <span className="text-green-700">{t.oneNationOneHealth.split(', ')[0]},</span> {t.oneNationOneHealth.split(', ')[1]}
                </h1>
                <p className="text-gray-600 leading-relaxed max-w-prose">
                    {t.tagline}
                </p>

                <div className="bg-white p-6 rounded-2xl shadow-xl border max-w-md">
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button onClick={() => { setRole('individual'); clearMessages(); }} className={`w-1/2 p-2 rounded-md font-semibold text-sm transition-colors ${role === 'individual' ? 'bg-white shadow' : 'text-gray-500'}`}>{t.individual}</button>
                        <button onClick={() => { setRole('admin'); clearMessages(); }} className={`w-1/2 p-2 rounded-md font-semibold text-sm transition-colors ${role === 'admin' ? 'bg-white shadow' : 'text-gray-500'}`}>{t.admin}</button>
                    </div>
                    
                    <div className="mt-6 text-center">
                        <h2 className="text-2xl font-bold">{mode === 'login' ? t.welcomeBack : t.createAccount}</h2>
                        <p className="text-gray-500 text-sm mt-1">{role === 'admin' ? t.forStaff : t.forCitizens}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                        <Field name="username" label="Username" type="text" placeholder="Enter your username" icon={User} value={formData.username} onChange={handleInputChange} required/>
                        <Field name="password" label="Password" type="password" placeholder="Enter your password" icon={Shield} value={formData.password} onChange={handleInputChange} required/>
                        
                        {role === 'admin' && mode === 'signup' && (
                           <>
                            <Field name="hospitalName" label="Hospital Name" type="text" placeholder="e.g., Apollo Hospital, Mumbai" icon={HospitalIcon} value={formData.hospitalName} onChange={handleInputChange} required/>
                            <Field name="specialCode" label="Special Hospital Code" type="text" placeholder="e.g., APOLLO-MUM-01" icon={Building} value={formData.specialCode} onChange={handleInputChange} required/>
                           </>
                        )}
                        
                        {/* --- FIX: Display internal form messages OR login errors from parent --- */}
                        {(authError || formError) && <p className="text-sm text-red-600 text-center">{authError || formError}</p>}
                        {formSuccess && <p className="text-sm text-green-600 text-center">{formSuccess}</p>}
                        
                        <button type="submit" disabled={isLoading} className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-green-300">
                            {isLoading ? 'Processing...' : (mode === 'login' ? 'Login' : 'Sign Up')}
                        </button>
                    </form>

                    <p className="text-xs text-gray-500 text-center mt-4">
                        {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
                        <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); clearMessages(); }} className="font-semibold text-green-600 hover:underline ml-1">
                            {mode === 'login' ? 'Sign Up' : 'Login'}
                        </button>
                    </p>
                </div>
            </div>
            <div className="relative">
                <LeafletMap />
            </div>
        </div>
      </section>
    </div>
  );
}

