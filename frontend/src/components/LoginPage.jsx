// frontend/src/components/LoginPage.jsx
import { useState } from 'react';

export default function LoginPage({ onLogin, onSwitchToSignUp, loginError, loginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="bg-slate-900 flex items-center justify-center min-h-screen">
      <div className="bg-slate-800 p-8 rounded-xl shadow-lg w-full max-w-sm">
        <h1 className="text-3xl font-bold text-center text-cyan-400 mb-2">AarogyaAI Portal 🩺</h1>
        <p className="text-center text-slate-400 mb-8">Provider Login</p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-slate-300 text-sm font-bold mb-2" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-slate-300 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              required
            />
          </div>
          
          {/* Display error or success messages */}
          {loginError && <p className="text-red-400 text-xs italic mb-4">{loginError}</p>}
          {loginSuccess && <p className="text-green-400 text-xs italic mb-4">{loginSuccess}</p>}
          
          <button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md w-full transition-colors">
            Login
          </button>
        </form>
        <p className="text-center text-sm text-slate-400 mt-6">
          Don't have an account?{' '}
          <button onClick={onSwitchToSignUp} className="font-bold text-cyan-400 hover:underline">
            Sign Up here
          </button>
        </p>
      </div>
    </div>
  );
}