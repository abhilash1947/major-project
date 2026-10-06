import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHome, FiPlay, FiBarChart2, FiAlertCircle, FiLogOut } from 'react-icons/fi';

function Navigation({ apiHealth, setAuth }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    setAuth(false);
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold">🚂 Railway DSS</span>
          </div>
          
          <ul className="flex space-x-8">
            <li>
              <Link to="/" className="flex items-center space-x-1 hover:text-blue-200 transition">
                <FiHome /> <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link to="/simulation" className="flex items-center space-x-1 hover:text-blue-200 transition">
                <FiPlay /> <span>Simulation</span>
              </Link>
            </li>
            <li>
              <Link to="/analytics" className="flex items-center space-x-1 hover:text-blue-200 transition">
                <FiBarChart2 /> <span>Analytics</span>
              </Link>
            </li>
          </ul>

          <div className="flex items-center space-x-4">
            {apiHealth ? (
              <span className="text-xs bg-green-500 px-2 py-1 rounded">✓ Online</span>
            ) : (
              <span className="text-xs bg-red-500 px-2 py-1 rounded flex items-center space-x-1">
                <FiAlertCircle /> Offline
              </span>
            )}
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-1 text-sm bg-blue-900/50 hover:bg-red-500 px-3 py-1.5 rounded transition-colors"
            >
              <FiLogOut /> <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
