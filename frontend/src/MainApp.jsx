import { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle } from 'lucide-react';
import AarogyaLoader from './components/AarogyaLoader.jsx';
import LandingPage from './components/LandingPage.jsx';
import PatientLookupPage from './components/PatientLookupPage.jsx';
import DashboardLayout from './components/Dashboard/DashboardLayout.jsx';
import ValidatorPage from './components/ValidatorPage.jsx';
import OtpVerificationModal from './components/OtpVerificationModal.jsx';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const LOADER_VISIBLE_DURATION = 2500;
const CROSSFADE_DURATION = 800;

// ✅ 1. A simple Notification component to handle pop-ups.
function Notification({ message, show }) {
  return (
    <div 
      className={`fixed top-5 right-5 flex items-center bg-slate-800 text-white p-4 rounded-lg shadow-2xl transition-all duration-500 ease-in-out z-[100] border-l-4 border-green-500 ${show ? 'transform translate-x-0 opacity-100' : 'transform translate-x-full opacity-0'}`}
    >
      <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
      <p className="font-medium text-sm">{message}</p>
    </div>
  );
}

export default function MainApp() {
  // Animation state
  const [isLoaderMounted, setIsLoaderMounted] = useState(true);
  const [isLoaderExiting, setIsLoaderExiting] = useState(false);
  const [isAppVisible, setIsAppVisible] = useState(false);

  // App state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [showValidator, setShowValidator] = useState(false);
  const [dashboardConfig, setDashboardConfig] = useState({ abhaId: null, initialView: 'history' });
  const [consentState, setConsentState] = useState({ awaitingOtp: false, patientToVerify: null, otpError: '' });

  // ✅ 2. State to manage the notification
  const [notification, setNotification] = useState({ show: false, message: '' });

  useEffect(() => {
    const transitionTimer = setTimeout(() => { setIsLoaderExiting(true); setIsAppVisible(true); }, LOADER_VISIBLE_DURATION);
    const unmountTimer = setTimeout(() => { setIsLoaderMounted(false); }, LOADER_VISIBLE_DURATION + CROSSFADE_DURATION);
    return () => { clearTimeout(transitionTimer); clearTimeout(unmountTimer); };
  }, []);

  // ✅ Helper function to show and hide the notification
  const showNotification = (message) => {
    setNotification({ show: true, message });
    setTimeout(() => {
        setNotification({ show: false, message: '' });
    }, 5000);
  };

  const handleLogin = async (username, password, role) => {
    setAuthError(''); setAuthSuccess('');
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, { username, password, role });
      setCurrentUser(response.data.user);
      setIsAuthenticated(true);
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Login failed.');
    }
  };

  const handleSignUp = async (username, password, role, hospitalName, specialCode) => {
    setAuthError(''); setAuthSuccess('');
    try {
      const payload = { username, password, role };
      if (role === 'admin') { payload.hospitalName = hospitalName; payload.specialCode = specialCode; }
      await axios.post(`${API_URL}/api/auth/register`, payload);
      setAuthSuccess('Registration successful! Please switch to the Login tab.');
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Registration failed.');
      throw new Error(err.response?.data?.message || 'Registration failed.');
    }
  };

  const handleSwitchPatient = () => {
    setDashboardConfig({ abhaId: null, initialView: 'history' });
  };

  const handleLogout = () => {
    setIsAuthenticated(false); setCurrentUser(null); setAuthError('');
    setDashboardConfig({ abhaId: null, initialView: 'history' });
  };

  const handlePatientSelect = (abhaId, view, patientName) => {
    if (view === 'emergency') {
      setDashboardConfig({ abhaId, initialView: 'emergency' });
    } else {
      setConsentState({ awaitingOtp: true, patientToVerify: { abhaId, name: patientName }, otpError: '' });
    }
  };

  // ✅ 3. New handler for the "Send OTP" request from the modal
  const handleSendOtpRequest = (duration) => {
    console.log(`Consent requested for ${duration} hours.`);
    showNotification("OTP has been sent to the patient's registered mobile number.");
    // In a real app, you would make an API call here to your backend to send a real OTP.
  };

  const handleOtpVerify = (otp) => {
    if (otp === '081106') {
      setDashboardConfig({ abhaId: consentState.patientToVerify.abhaId, initialView: 'history' });
      setConsentState({ awaitingOtp: false, patientToVerify: null, otpError: '' });
    } else {
      setConsentState((prev) => ({ ...prev, otpError: 'Invalid OTP. Please try again.' }));
    }
  };

  const toggleValidator = () => setShowValidator((prev) => !prev);

  const renderAppContent = () => {
    if (showValidator) return <ValidatorPage onBack={toggleValidator} />;

    if (isAuthenticated) {
      if (dashboardConfig.abhaId) {
        return <DashboardLayout key={dashboardConfig.abhaId} onLogout={handleLogout} onSwitchPatient={handleSwitchPatient} initialAbhaId={dashboardConfig.abhaId} initialView={dashboardConfig.initialView} currentUser={currentUser} />;
      }
      return (
        <>
          <PatientLookupPage onPatientSelect={handlePatientSelect} />
          {consentState.awaitingOtp && (
            <OtpVerificationModal
              patientName={consentState.patientToVerify.name}
              onVerify={handleOtpVerify}
              onClose={() => setConsentState({ awaitingOtp: false, patientToVerify: null, otpError: '' })}
              error={consentState.otpError}
              // ✅ 4. Pass the new handler function down to the modal as a prop
              onSendOtpRequest={handleSendOtpRequest}
            />
          )}
        </>
      );
    }

    return <LandingPage onLogin={handleLogin} onSignUp={handleSignUp} onValidatorClick={toggleValidator} authError={authError} authSuccess={authSuccess} setAuthError={setAuthError} setAuthSuccess={setAuthSuccess} />;
  };

  return (
    <div>
      {/* ✅ Render the Notification component so it can appear */}
      <Notification show={notification.show} message={notification.message} />
      {isLoaderMounted && <AarogyaLoader isExiting={isLoaderExiting} />}
      {isAppVisible && renderAppContent()}
    </div>
  );
}