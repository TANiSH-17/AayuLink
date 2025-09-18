import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LanguageProvider } from './contexts/LanguageContext';
import MainApp from './MainApp';
import LandingPage from './components/LandingPage';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // ✅ The useNavigate hook is already here, we just need to use it
  const navigate = useNavigate();

  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem('aayuLinkToken');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          const response = await axios.get(`${API_URL}/api/auth/verify`);
          setCurrentUser(response.data.user);
        } catch (error) {
          localStorage.removeItem('aayuLinkToken');
        }
      }
      setIsLoading(false);
    };
    verifyUser();
  }, []);

  const handleLogin = async (username, password, role) => {
    // ... (this function is correct)
    setAuthError('');
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, { username, password, role });
      localStorage.setItem('aayuLinkToken', response.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      setCurrentUser(response.data.user);
      navigate('/');
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Login failed.');
    }
  };

  const handleSignUp = async (username, password, role, hospitalName, specialCode) => {
    // ... (this function is correct)
    setAuthError('');
    try {
      await axios.post(`${API_URL}/api/auth/register`, { username, password, role, hospitalName, specialCode });
      return true;
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Registration failed.');
      return false;
    }
  };
  
  // ✅ UPDATE THIS FUNCTION
  const handleLogout = () => {
    localStorage.removeItem('aayuLinkToken');
    delete axios.defaults.headers.common['Authorization'];
    setCurrentUser(null);
    navigate('/'); // ✅ ADD THIS LINE to redirect to the homepage
  };
  
  if (isLoading) {
    return null;
  }

  return (
    <LanguageProvider>
      <Routes>
        {currentUser ? (
          <Route path="/*" element={<MainApp currentUser={currentUser} onLogout={handleLogout} />} />
        ) : (
          <Route path="/*" element={<LandingPage onLogin={handleLogin} onSignUp={handleSignUp} authError={authError} />} />
        )}
      </Routes>
    </LanguageProvider>
  );
}