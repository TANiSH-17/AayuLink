import { useState, useEffect } from 'react';
import axios from 'axios';
// Corrected import paths to be relative from the `src` directory.
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
  const [isLoaderMounted, setIsLoaderMounted] = useState(true);
  const [isLoaderExiting, setIsLoaderExiting] = useState(false);
  const [isAppVisible, setIsAppVisible] = useState(false);

  // Authentication & user state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [showValidator, setShowValidator] = useState(false);
  const [dashboardConfig, setDashboardConfig] = useState({ abhaId: null, initialView: 'history' });
  const [consentState, setConsentState] = useState({ awaitingOtp: false, patientToVerify: null, otpError: '' });

  // Fade-in loader effect
  useEffect(() => {
    const transitionTimer = setTimeout(() => {
      setIsLoaderExiting(true);
      setIsAppVisible(true);
    }, LOADER_VISIBLE_DURATION);
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
    setAuthSuccess('');
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, { username, password, role });
      setCurrentUser(response.data.user);
      setIsAuthenticated(true);
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Login failed.');
    }
  };

  const handleSignUp = async (username, password, role, hospitalName, specialCode) => {
    setAuthError('');
    setAuthSuccess('');
    try {
      const payload = { username, password, role };
      if (role === 'admin') {
        payload.hospitalName = hospitalName;
        payload.specialCode = specialCode;
      }
      await axios.post(`${API_URL}/api/auth/register`, payload);
      setAuthSuccess('Registration successful! Please switch to the Login tab.');
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Registration failed.');
      throw new Error(err.response?.data?.message || 'Registration failed.');
    }
  };

  // --- THIS IS THE FIX (PART 1) ---
  // This function resets the app to the patient lookup screen without logging out.
  const handleSwitchPatient = () => {
    setDashboardConfig({ abhaId: null, initialView: 'history' });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
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
    if (otp === '081106') {
      setDashboardConfig({
        abhaId: consentState.patientToVerify.abhaId,
        initialView: 'history',
      });
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
        return (
          <DashboardLayout
            key={dashboardConfig.abhaId}
            onLogout={handleLogout}
            // Pass the new function down to the dashboard
            onSwitchPatient={handleSwitchPatient}
            initialAbhaId={dashboardConfig.abhaId}
            initialView={dashboardConfig.initialView}
            currentUser={currentUser}
          />
        );
      }
      return (
        <>
          <PatientLookupPage onPatientSelect={handlePatientSelect} />
          {consentState.awaitingOtp && (
            <OtpVerificationModal
              patientName={consentState.patientToVerify.name}
              onVerify={handleOtpVerify}
              onClose={() =>
                setConsentState({ awaitingOtp: false, patientToVerify: null, otpError: '' })
              }
              error={consentState.otpError}
            />
          )}
        </>
      );
    }

    return (
      <LandingPage
        onLogin={handleLogin}
        onSignUp={handleSignUp}
        onValidatorClick={toggleValidator}
        authError={authError}
        authSuccess={authSuccess}
        setAuthError={setAuthError}
        setAuthSuccess={setAuthSuccess}
      />
    );
  };

  return (
    <div>
      {isLoaderMounted && <AarogyaLoader isExiting={isLoaderExiting} />}
      {isAppVisible && renderAppContent()}
    </div>
  );
}

