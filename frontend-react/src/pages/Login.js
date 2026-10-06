import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login({ setAuth }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === '1234') {
      localStorage.setItem('isAuthenticated', 'true');
      setAuth(true);
      navigate('/');
    } else {
      setError('Invalid username or password.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-center">
          <div className="text-4xl mb-2">🚂</div>
          <h2 className="text-2xl font-bold text-white">Railway DSS</h2>
          <p className="text-blue-200 text-sm mt-1">Authorized Personnel Only</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-400 text-sm p-3 rounded flex items-center">
                <span className="mr-2">⚠️</span>
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-gray-400 text-sm font-bold mb-2 uppercase tracking-wide">
                Operator ID (Username)
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 text-white rounded px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="admin"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-400 text-sm font-bold mb-2 uppercase tracking-wide">
                Access Code (Password)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 text-white rounded px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition-colors shadow-lg shadow-blue-600/30"
            >
              INITIALIZE TERMINAL
            </button>
          </form>
        </div>
        
        <div className="bg-gray-900/50 p-4 text-center border-t border-gray-700">
          <p className="text-gray-500 text-xs font-mono">
            SECURE CONNECTION ESTABLISHED • ENCRYPTED
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
