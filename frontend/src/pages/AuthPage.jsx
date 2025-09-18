import React, { useState } from 'react';
import axios from 'axios';
import LandingPage from '../components/LandingPage'; // Import your main landing page component

// Your API endpoint
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function AuthPage({ onAuthSuccess }) {
  const [authError, setAuthError] = useState('');

  const handleLogin = async (username, password, role) => {
    setAuthError('');
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        username,
        password,
        role,
      });
      onAuthSuccess(response.data.user); // On success, update the main app state
    } catch (error) {
      setAuthError(error.response?.data?.message || 'Login failed.');
    }
  };

  const handleSignUp = async (username, password, role, hospitalName, specialCode) => {
    setAuthError('');
    try {
      await axios.post(`${API_URL}/api/auth/register`, {
        username, password, role, hospitalName, specialCode
      });
      // ✅ CRUCIAL: This line sends the "success" signal to the UI.
      return true;
    } catch (error) {
      setAuthError(error.response?.data?.message || 'Registration failed.');
      // ✅ CRUCIAL: This line sends the "failure" signal to the UI.
      return false;
    }
  };

  return (
    <LandingPage
      onLogin={handleLogin}
      onSignUp={handleSignUp}
      authError={authError}
    />
  );
}