import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom';
// Your component imports
import AarogyaLoader from './components/AarogyaLoader.jsx';
import PatientLookupPage from './components/PatientLookupPage.jsx';
import DashboardLayout from './components/Dashboard/DashboardLayout.jsx';
import OtpVerificationModal from './components/OtpVerificationModal.jsx';
import Notification from './components/Notification.jsx'; // Assuming Notification is its own component now

export default function MainApp({ currentUser, onLogout }) {
  // ✅ Check sessionStorage to see if the loader has been shown
  const hasSeenLoader = sessionStorage.getItem('hasSeenLoader');

  // ✅ Initialize state based on whether the loader has been seen
  const [isLoaderMounted, setIsLoaderMounted] = useState(!hasSeenLoader);
  const [isLoaderExiting, setIsLoaderExiting] = useState(false);
  const [isAppVisible, setIsAppVisible] = useState(!!hasSeenLoader);

  const [consentState, setConsentState] = useState({ awaitingOtp: false, patientToVerify: null, otpError: '' });
  const [notification, setNotification] = useState({ show: false, message: '' });
  const navigate = useNavigate();

  useEffect(() => {
    // If we've already seen the loader in this session, do nothing.
    if (hasSeenLoader) return;

    // Otherwise, run the animation sequence.
    const transitionTimer = setTimeout(() => {
      setIsLoaderExiting(true);
      setIsAppVisible(true);
    }, 2500); // Animation duration

    const unmountTimer = setTimeout(() => {
      setIsLoaderMounted(false);
      // ✅ Set the flag in sessionStorage so it doesn't run again
      sessionStorage.setItem('hasSeenLoader', 'true');
    }, 2500 + 800); // Animation duration + fade time

    return () => { clearTimeout(transitionTimer); clearTimeout(unmountTimer); };
  }, [hasSeenLoader]);

  const showNotification = (message) => {
    setNotification({ show: true, message });
    setTimeout(() => {
      setNotification({ show: false, message: '' });
    }, 5000);
  };

  const handlePatientSelect = (abhaId, view, patientName) => {
    if (currentUser?.role === 'individual' && currentUser.username === abhaId) {
      navigate(`/dashboard/${abhaId}`);
      return;
    }
    if (view === 'emergency') {
      navigate(`/dashboard/${abhaId}`);
    } else {
      setConsentState({ awaitingOtp: true, patientToVerify: { abhaId, name: patientName }, otpError: '' });
    }
  };

  const handleOtpVerify = (otp) => {
    if (otp === '081106') { // Demo OTP
      const { abhaId } = consentState.patientToVerify;
      setConsentState({ awaitingOtp: false, patientToVerify: null, otpError: '' });
      navigate(`/dashboard/${abhaId}`);
    } else {
      setConsentState((prev) => ({ ...prev, otpError: 'Invalid OTP. Please try again.' }));
    }
  };
  
  const handleSendOtpRequest = (duration) => {
    console.log(`Consent requested for ${duration} hours.`);
    showNotification("OTP has been sent to the patient's registered mobile number.");
  };

  // This is a helper component to grab the `abhaId` from the URL
  function DashboardWrapper() {
    const { abhaId } = useParams();
    const handleSwitchPatient = () => navigate('/'); // Go back to the lookup page
    return <DashboardLayout key={abhaId} onLogout={onLogout} onSwitchPatient={handleSwitchPatient} initialAbhaId={abhaId} currentUser={currentUser} />;
  }

  return (
    <div>
      <Notification show={notification.show} message={notification.message} />
      {isLoaderMounted && <AarogyaLoader isExiting={isLoaderExiting} />}
      {isAppVisible && (
        <>
        <Routes>
          <Route path="/patientLookup" element={<PatientLookupPage onPatientSelect={handlePatientSelect} onLogout={onLogout} />} />
          <Route path="/" element={<Navigate replace to="/patientLookup" />} />
          <Route path="/dashboard/:abhaId" element={<DashboardWrapper />} />
        </Routes>

          {consentState.awaitingOtp && (
            <OtpVerificationModal
              patientName={consentState.patientToVerify.name}
              onVerify={handleOtpVerify}
              onClose={() => setConsentState({ awaitingOtp: false, patientToVerify: null, otpError: '' })}
              error={consentState.otpError}
              onSendOtpRequest={handleSendOtpRequest}
            />
          )}
        </>
      )}
    </div>
  );
}