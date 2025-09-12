import { useState, useEffect } from 'react';
import axios from 'axios';
import AarogyaLoader from './components/AarogyaLoader';
import LandingPage from './components/LandingPage';
import PatientLookupPage from './components/PatientLookupPage';
import DashboardLayout from './components/dashboard/DashboardLayout';
import ValidatorPage from './components/ValidatorPage';
import OtpVerificationModal from './components/OtpVerificationModal'; // Import the OTP modal

const API_URL = 'http://localhost:8000';

export default function App() {
  const [showLoader, setShowLoader] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('individual');
  const [authError, setAuthError] = useState('');
  const [showValidator, setShowValidator] = useState(false);

  // This state controls which patient and view the dashboard loads
  const [dashboardConfig, setDashboardConfig] = useState({
    abhaId: null,
    initialView: 'history'
  });

  // --- NEW STATE to manage the OTP consent pop-up ---
  const [consentState, setConsentState] = useState({
    awaitingOtp: false, // Is the OTP modal open?
    patientToVerify: null, // Holds { abhaId, name } of the patient needing consent
    otpError: ''
  });

  useEffect(() => {
    const timer = setTimeout(() => setShowLoader(false), 1500); // Shorter load time
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (username, password, role) => {
    // This function handles the initial login for an admin or individual
    setAuthError('');
    try {
      await axios.post(`${API_URL}/api/auth/login`, { username, password });
      setUserRole(role);
      setIsAuthenticated(true);
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Login failed.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthError('');
    setDashboardConfig({ abhaId: null, initialView: 'history' });
  };
  
  // --- UPDATED: This function is now the central point for access control ---
  const handlePatientSelect = (abhaId, view, patientName) => {
    if (view === 'emergency') {
      // If "Emergency Mode" is clicked, bypass OTP and go straight to the dashboard
      console.log("Emergency access granted. Bypassing OTP.");
      setDashboardConfig({ abhaId, initialView: 'emergency' });
    } else {
      // For "Complete History", trigger the OTP consent flow for ALL users
      console.log(`Detailed history access requested for ${patientName}. Triggering OTP.`);
      setConsentState({ awaitingOtp: true, patientToVerify: { abhaId, name: patientName }, otpError: '' });
    }
  };
  
  // --- NEW: This function handles the OTP verification ---
  const handleOtpVerify = (otp) => {
    console.log(`Verifying OTP: ${otp}`);
    // The OTP is hardcoded here as requested
    if (otp === "081106") {
      // If correct, load the dashboard with the patient's data
      setDashboardConfig({ abhaId: consentState.patientToVerify.abhaId, initialView: 'history' });
      // Close and reset the modal state
      setConsentState({ awaitingOtp: false, patientToVerify: null, otpError: '' });
    } else {
      // If incorrect, show an error message inside the modal
      setConsentState(prev => ({ ...prev, otpError: 'Invalid OTP. Please try again.' }));
    }
  };

  const handleSignUp = async () => { /* ... */ };
  const toggleValidator = () => setShowValidator(prev => !prev);


  // This is the central logic that decides what to show on the screen
  const renderContent = () => {
    if (showLoader) return <AarogyaLoader />;
    if (showValidator) return <ValidatorPage onBack={toggleValidator} />;
    
    if (isAuthenticated) {
      // If a patient's ABHA ID is set in the config, show the dashboard
      if (dashboardConfig.abhaId) {
        return <DashboardLayout 
                  key={dashboardConfig.abhaId} // This key is crucial to force a re-render
                  onLogout={handleLogout} 
                  initialAbhaId={dashboardConfig.abhaId}
                  initialView={dashboardConfig.initialView}
                />;
      } else {
        // If logged in but no patient is selected yet, show the lookup page
        return (
          <>
            <PatientLookupPage onPatientSelect={handlePatientSelect} />
            
            {/* This line conditionally renders the OTP modal from your Canvas when needed */}
            {consentState.awaitingOtp && (
              <OtpVerificationModal 
                patientName={consentState.patientToVerify.name}
                onVerify={handleOtpVerify}
                onClose={() => setConsentState({ awaitingOtp: false, patientToVerify: null, otpError: '' })}
                error={consentState.otpError}
              />
            )}
          </>
        );
      }
    }
    
    // By default, show the main landing page
    return <LandingPage onLogin={handleLogin} onSignUp={handleSignUp} onValidatorClick={toggleValidator} authError={authError} />;
  };

  return <div>{renderContent()}</div>;
}

