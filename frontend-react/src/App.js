import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import SimulationPanel from './pages/SimulationPanel';
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import Navigation from './components/Navigation';
import './App.css';

function App() {
  const [apiHealth, setApiHealth] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('isAuthenticated') === 'true'
  );

  useEffect(() => {
    // Check API health on startup
    checkApiHealth();
    const interval = setInterval(checkApiHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkApiHealth = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/health');
      setApiHealth(response.ok);
    } catch (error) {
      console.log('API unreachable:', error);
      setApiHealth(false);
    }
  };

  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <Router>
      <div className="App bg-gray-50 min-h-screen">
        {isAuthenticated && <Navigation apiHealth={apiHealth} setAuth={setIsAuthenticated} />}
        
        <main className={isAuthenticated ? "container mx-auto px-4 py-8" : ""}>
          {isAuthenticated && !apiHealth && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              ⚠️ Warning: Backend API is not responding. Please ensure the Java backend is running on port 8080.
            </div>
          )}
          
          <Routes>
            <Route path="/login" element={
              isAuthenticated ? <Navigate to="/" replace /> : <Login setAuth={setIsAuthenticated} />
            } />
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/simulation" element={
              <ProtectedRoute>
                <SimulationPanel />
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            } />
          </Routes>
        </main>

        {isAuthenticated && (
          <footer className="bg-gray-800 text-white text-center py-4 mt-8">
            <p>Railway Decision Support System v1.0.1 | AI-Powered Railway Optimization</p>
            <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">Build: 2026.06.03.PATCH_ANIMATIONS</p>
          </footer>
        )}
      </div>
    </Router>
  );
}

export default App;
