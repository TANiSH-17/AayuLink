// frontend/src/App.jsx
import { useState } from 'react';
import axios from 'axios';
import LoginPage from './components/LoginPage.jsx';
import SignUpPage from './components/SignUpPage.jsx';
import DashboardPage from './components/DashboardPage.jsx';

const API_URL = 'http://localhost:8000';

export default function App() {
  // --- STATE MANAGEMENT ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('login'); // Can be 'login' or 'signup'
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // --- HELPER FUNCTIONS ---
  const clearMessages = () => {
    setAuthError('');
    setAuthSuccess('');
  };

  // --- API HANDLER FUNCTIONS ---

  // Handles the login request
  const handleLogin = async (username, password) => {
    clearMessages();
    try {
      await axios.post(`${API_URL}/api/auth/login`, { username, password });
      setIsAuthenticated(true); // On success, show the dashboard
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Invalid username or password.');
      console.error('Login failed:', err);
    }
  };
  
  // Handles the user registration request
  const handleSignUp = async (username, password) => {
    clearMessages();
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, { username, password });
      setAuthSuccess(response.data.message + ' Please log in.');
      setCurrentView('login'); // Switch to login view after successful signup
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Registration failed. Please try again.');
      console.error('Signup failed:', err);
    }
  };

  // Handles logging the user out
  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentView('login'); // Go back to login screen on logout
    clearMessages();
  };

  // --- RENDER LOGIC ---

  // This function decides which component to show
  const renderContent = () => {
    // If the user IS authenticated, show the main dashboard
    if (isAuthenticated) {
      return <DashboardPage onLogout={handleLogout} />;
    }
    
    // If not authenticated, show either the login or signup page
    switch (currentView) {
      case 'signup':
        return (
          <SignUpPage
            onSignUp={handleSignUp}
            onSwitchToLogin={() => { clearMessages(); setCurrentView('login'); }}
            authError={authError}
          />
        );
      case 'login':
      default:
        return (
          <LoginPage
            onLogin={handleLogin}
            onSwitchToSignUp={() => { clearMessages(); setCurrentView('signup'); }}
            loginError={authError}
            loginSuccess={authSuccess}
          />
        );
    }
  };

  return (
    <div>
      {renderContent()}
    </div>
  );
}