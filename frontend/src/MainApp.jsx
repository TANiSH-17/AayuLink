import { useState, useEffect } from 'react';
import axios from 'axios';
import AarogyaLoader from './components/AarogyaLoader';
import LandingPage from './components/LandingPage';
import PatientLookupPage from './components/PatientLookupPage';
import DashboardLayout from './components/dashboard/DashboardLayout';
import ValidatorPage from './components/ValidatorPage';
import OtpVerificationModal from './components/OtpVerificationModal';

const API_URL = 'http://localhost:8000';

// This component now contains all the core logic for your application.
export default function MainApp() {
  const [showLoader, setShowLoader] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('individual');
  const [authError, setAuthError] = useState('');
  const [showValidator, setShowValidator] = useState(false);

  // This state controls which patient and view the dashboard loads
  const [dashboardConfig, setDashboardConfig] = useState({ abhaId: null, initialView: 'history' });

  // This state manages the pop-up modal for OTP consent
  const [consentState, setConsentState] = useState({ awaitingOtp: false, patientToVerify: null, otpError: '' });

  useEffect(() => {
    const timer = setTimeout(() => setShowLoader(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (username, password, role) => {
    setAuthError('');
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, { username, password });
      setUserRole(response.data.role); // Use the role from the backend
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
  
  // This is the central point for access control
  const handlePatientSelect = (abhaId, view, patientName) => {
    if (view === 'emergency') {
      // If "Emergency Mode" is clicked, bypass OTP and go straight to the dashboard
      setDashboardConfig({ abhaId, initialView: 'emergency' });
    } else {
      // For "Complete History", trigger the OTP consent flow
      setConsentState({ awaitingOtp: true, patientToVerify: { abhaId, name: patientName }, otpError: '' });
    }
  };
  
  // This handles the OTP verification using the hardcoded "magic" OTP
  const handleOtpVerify = (otp) => {
    // The OTP is hardcoded here as requested
    if (otp === "081106") {
      // If correct, load the dashboard with the patient's data
      setDashboardConfig({ abhaId: consentState.patientToVerify.abhaId, initialView: 'history' });
      // Close and reset the modal state
      setConsentState({ awaitingOtp: false, patientToVerify: null, otpError: '' });
    } else {
      // If incorrect, show an error message
      setConsentState(prev => ({ ...prev, otpError: 'Invalid OTP. Please try again.' }));
    }
  };

  const handleSignUp = async (username, password, role, hospitalName, specialCode) => {
      // This is a placeholder for the full signup logic you built
      console.log("Signup attempt:", { username, role, hospitalName, specialCode });
      alert('Signup functionality is for demonstration and logs to the console.');
  };
  
  const toggleValidator = () => setShowValidator(prev => !prev);

  // This is the central logic that decides what to show on the screen
  const renderContent = () => {
    if (showLoader) return <AarogyaLoader />;
    if (showValidator) return <ValidatorPage onBack={toggleValidator} />;
    
    if (isAuthenticated) {
      if (userRole === 'admin' || dashboardConfig.abhaId) {
        return <DashboardLayout 
                  key={dashboardConfig.abhaId}
                  onLogout={handleLogout} 
                  // For admins, load a default patient if none is selected yet
                  initialAbhaId={dashboardConfig.abhaId || '12-3456-7890-0001'}
                  initialView={dashboardConfig.initialView}
                />;
      } else {
        // If logged in as an individual but no patient is selected yet, show the lookup page
        return (
          <>
            <PatientLookupPage onPatientSelect={handlePatientSelect} />
            
            {/* This line conditionally renders the OTP modal when needed */}
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

