import { useState, useEffect } from 'react';
import axios from 'axios';
import AarogyaLoader from './components/AarogyaLoader';
import LandingPage from './components/LandingPage';
import PatientLookupPage from './components/PatientLookupPage'; // Using the new lookup page
import DashboardLayout from './components/dashboard/DashboardLayout';
import ValidatorPage from './components/ValidatorPage';

const API_URL = 'http://localhost:8000';

export default function App() {
  const [showLoader, setShowLoader] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('individual');
  const [authError, setAuthError] = useState('');
  const [showValidator, setShowValidator] = useState(false);

  // This state now controls which patient and view the dashboard loads
  const [dashboardConfig, setDashboardConfig] = useState({
    abhaId: null,
    initialView: 'history'
  });

  useEffect(() => {
    const timer = setTimeout(() => setShowLoader(false), 2000); // Shorter loading time
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (username, password, role) => {
    setAuthError('');
    try {
      // In a real app, this would be a real API call
      await new Promise(resolve => setTimeout(resolve, 500)); 
      
      setUserRole(role);
      setIsAuthenticated(true);
      
      // If the user is an admin, load a default patient's dashboard immediately
      if (role === 'admin') {
        setDashboardConfig({ abhaId: '12-3456-7890-0001', initialView: 'history' });
      }
    } catch (err) {
      setAuthError('Simulated login failed. Please check credentials.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthError('');
    // Reset the dashboard configuration on logout
    setDashboardConfig({ abhaId: null, initialView: 'history' });
  };
  
  // This function is called from PatientLookupPage after a user finds a patient and chooses an action
  const handlePatientSelect = (abhaId, view) => {
    setDashboardConfig({ abhaId, initialView: view });
  };
  
  const handleSignUp = async (username, password, role) => { 
    alert('Signup functionality is for demonstration purposes.');
  };

  const toggleValidator = () => setShowValidator(prev => !prev);


  // This is the central logic that decides what to show on the screen
  const renderContent = () => {
    if (showLoader) return <AarogyaLoader />;
    if (showValidator) return <ValidatorPage onBack={toggleValidator} />;
    
    if (isAuthenticated) {
      // If a patient has been selected (either by an admin logging in or an individual looking one up)
      if (dashboardConfig.abhaId) {
        return <DashboardLayout 
                  key={dashboardConfig.abhaId} // The key prop is crucial to force a re-render when the patient changes
                  onLogout={handleLogout} 
                  initialAbhaId={dashboardConfig.abhaId}
                  initialView={dashboardConfig.initialView}
                />;
      } else {
        // If logged in as an individual but no patient has been selected yet
        return <PatientLookupPage onPatientSelect={handlePatientSelect} />;
      }
    }
    
    // If not authenticated, show the main landing page
    return <LandingPage 
              onLogin={handleLogin} 
              onSignUp={handleSignUp} 
              onValidatorClick={toggleValidator} 
              authError={authError} 
            />;
  };

  return <div>{renderContent()}</div>;
}

