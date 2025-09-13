import { useState, useEffect } from 'react';
import axios from 'axios';
import AarogyaLoader from './components/AarogyaLoader.jsx';
import LandingPage from './components/LandingPage.jsx';
import PatientLookupPage from './components/PatientLookupPage.jsx';
import DashboardLayout from './components/dashboard/DashboardLayout.jsx';
import ValidatorPage from './components/ValidatorPage.jsx';
import OtpVerificationModal from './components/OtpVerificationModal.jsx';

const API_URL = 'http://localhost:8000';

// Constants to control the cross-fade timing
const LOADER_VISIBLE_DURATION = 2500; // How long the loader stays fully visible
const CROSSFADE_DURATION = 800;       // The duration of the fade animation

export default function MainApp() {
  // State management for the animation flow
  const [isLoaderMounted, setIsLoaderMounted] = useState(true);   // Controls if the loader is in the DOM
  const [isLoaderExiting, setIsLoaderExiting] = useState(false);  // Triggers the loader's fade-out
  const [isAppVisible, setIsAppVisible] = useState(false);        // Triggers the main app's appearance

  // Existing application states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('individual');
  const [authError, setAuthError] = useState('');
  const [showValidator, setShowValidator] = useState(false);
  const [dashboardConfig, setDashboardConfig] = useState({ abhaId: null, initialView: 'history' });
  const [consentState, setConsentState] = useState({ awaitingOtp: false, patientToVerify: null, otpError: '' });

  // useEffect to orchestrate the animation timers
  useEffect(() => {
    // Timer to start the cross-fade
    const transitionTimer = setTimeout(() => {
      setIsLoaderExiting(true); // Tell loader to start fading out
      setIsAppVisible(true);    // Tell main app to appear
    }, LOADER_VISIBLE_DURATION);

    // Timer to remove the loader from the DOM after the animation is complete
    const unmountTimer = setTimeout(() => {
      setIsLoaderMounted(false);
    }, LOADER_VISIBLE_DURATION + CROSSFADE_DURATION);

    return () => {
      clearTimeout(transitionTimer);
      clearTimeout(unmountTimer);
    };
  }, []);

  const handleLogin = async (username, password, role) => {
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
  
  const handlePatientSelect = (abhaId, view, patientName) => {
    if (view === 'emergency') {
      setDashboardConfig({ abhaId, initialView: 'emergency' });
    } else {
      setConsentState({ awaitingOtp: true, patientToVerify: { abhaId, name: patientName }, otpError: '' });
    }
  };
  
  const handleOtpVerify = (otp) => {
    if (otp === "081106") {
      setDashboardConfig({ abhaId: consentState.patientToVerify.abhaId, initialView: 'history' });
      setConsentState({ awaitingOtp: false, patientToVerify: null, otpError: '' });
    } else {
      setConsentState(prev => ({ ...prev, otpError: 'Invalid OTP. Please try again.' }));
    }
  };

  const handleSignUp = async (username, password, role, hospitalName, specialCode) => {
      console.log("Signup attempt:", { username, role, hospitalName, specialCode });
      alert('Signup functionality is for demonstration and logs to the console.');
  };
  
  const toggleValidator = () => setShowValidator(prev => !prev);

  // This function renders the main content of the app, post-loader.
  const renderAppContent = () => {
    if (showValidator) return <ValidatorPage onBack={toggleValidator} />;
    
    if (isAuthenticated) {
      if (dashboardConfig.abhaId) {
        return <DashboardLayout 
                  key={dashboardConfig.abhaId}
                  onLogout={handleLogout} 
                  initialAbhaId={dashboardConfig.abhaId}
                  initialView={dashboardConfig.initialView}
                />;
      } else {
        return (
          <>
            <PatientLookupPage onPatientSelect={handlePatientSelect} />
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
    
    return <LandingPage onLogin={handleLogin} onSignUp={handleSignUp} onValidatorClick={toggleValidator} authError={authError} />;
  };

  // The main return now layers the loader and the app content for the cross-fade effect.
  return (
    <div>
      {/* The AarogyaLoader is only present in the DOM while isLoaderMounted is true.
        We pass the isExiting prop to it; when this becomes true, the loader's
        internal CSS will trigger its fade-out animation.
      */}
      {isLoaderMounted && <AarogyaLoader isExiting={isLoaderExiting} />}

      {/* The main application content only starts rendering when isAppVisible becomes true.
        The LandingPage component (the first thing to appear) is responsible for its
        own fade-in animation, creating the desired cross-fade effect.
      */}
      {isAppVisible && renderAppContent()}
    </div>
  );
}

