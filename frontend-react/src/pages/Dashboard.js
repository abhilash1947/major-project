import React, { useEffect, useState } from 'react';
import { fetchTrains, fetchSegments, resolveDisruption } from '../services/api';
import TrainVisualization from '../components/TrainVisualization';

function Dashboard() {
  const [trains, setTrains] = useState([]);
  const [segments, setSegments] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [resolvedMockAlerts, setResolvedMockAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState({
    totalTrains: 0,
    punctuality: 94.2,
    avgSpeed: 78.5,
    platformUsage: 82,
    totalPassengers: 14500,
    averageUtilization: 0,
    totalConflicts: 0
  });

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async (resolvedAlertsOverride = null) => {
    try {
      const trainsData = await fetchTrains();
      const segmentsData = await fetchSegments();
      
      const pyStateResponse = await fetch('http://localhost:8000/api/v1/state');
      const pyState = await pyStateResponse.json();
      
      const enrichedTrains = trainsData.map(t => {
        const pyTrain = pyState.simulation_state?.trains?.find(pt => pt.id === t.trainId);
        return { ...t, lat: pyTrain?.lat, lon: pyTrain?.lon };
      });
      
      const enrichedSegments = segmentsData.map(s => {
        const pySeg = pyState.simulation_state?.segments?.find(ps => ps.segment_id === s.segmentId);
        return { ...s, startLat: pySeg?.startLat, startLon: pySeg?.startLon, endLat: pySeg?.endLat, endLon: pySeg?.endLon };
      });
      
      setTrains(enrichedTrains);
      setSegments(enrichedSegments);
      
      // Map simulation alerts to detailed UI alerts
      const enrichedAlerts = (pyState.simulation_state?.alerts || []).map((alert, idx) => {
        let eta = '45 mins';
        let affected = alert.affected_trains || ['System Control'];
        let strategy = 'Dispatching maintenance crew from nearest depot. Rerouting active traffic to loop line.';
        
        if (alert.type === 'Signal Failure') {
          eta = '1h 15m';
          strategy = `Implement manual block working. Divert ${affected[0]} via alternate loop if possible.`;
        } else if (alert.type === 'Track Maintenance') {
          eta = '30 mins';
          strategy = `Imposing caution order for ${affected.join(', ')}. Monitoring track stability.`;
        } else if (alert.type === 'proximity_alert') {
          eta = 'Immediate';
          strategy = `Emergency braking sequence initiated for ${affected[0]}. AI recalculating safe headway.`;
        } else if (alert.type === 'Operations Notification') {
          eta = 'Real-time';
          strategy = 'Operational log entry. Validating network sync status.';
        } else if (alert.type === 'Track Capacity Alert') {
          eta = 'Immediate';
          strategy = `Heavy congestion in ${alert.segment}. AI recommending service staggering for ${affected.length} trains.`;
        }

        return {
          ...alert,
          eta,
          affectedTrains: affected,
          resolutionStrategy: strategy
        };
      });

      // Filter out resolved alerts if any (primarily for simulation-based alerts)
      const currentResolved = resolvedAlertsOverride || resolvedMockAlerts;
      const finalAlerts = enrichedAlerts.filter(a => !currentResolved.includes(a.segment));

      setAlerts(finalAlerts);
      
      const avgUtil = segmentsData.length > 0 
        ? (segmentsData.reduce((sum, s) => sum + (s.utilizationPercent || 0), 0) / segmentsData.length)
        : 0;
      
      setMetrics(prev => ({
        ...prev,
        totalTrains: trainsData.length,
        averageUtilization: avgUtil.toFixed(1),
        totalConflicts: pyState.simulation_state?.metrics?.total_conflicts || 0,
        // Mock dynamic updates for realistic feel
        punctuality: Math.max(85, Math.min(99, parseFloat(prev.punctuality) + (Math.random() - 0.5))).toFixed(1),
        avgSpeed: Math.max(60, Math.min(90, parseFloat(prev.avgSpeed) + (Math.random() * 2 - 1))).toFixed(1),
        platformUsage: Math.max(60, Math.min(100, prev.platformUsage + (Math.floor(Math.random() * 5) - 2))),
        totalPassengers: prev.totalPassengers + Math.floor(Math.random() * 50)
      }));
      
      setError(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthorizeAction = async (segmentId) => {
    try {
      await resolveDisruption(segmentId);
      
      let updatedResolved = null;
      // If it was one of the mock alerts, add it to the resolved list
      if (['S05', 'B12', 'W01'].includes(segmentId)) {
        updatedResolved = [...resolvedMockAlerts, segmentId];
        setResolvedMockAlerts(updatedResolved);
      }
      
      // Manually remove the alert from the frontend state
      setAlerts(prevAlerts => prevAlerts.filter(alert => alert.segment !== segmentId));
      
      // Refresh data immediately, passing the updated resolved list if it changed
      loadDashboardData(updatedResolved);
    } catch (err) {
      console.error('Failed to authorize action:', err);
    }
  };

  const handleAddTrain = async () => {
    try {
      const trainId = `NEW_${Math.floor(Math.random() * 10000)}`;
      // Use the total track length (4110km) for randomization
      const position = Math.random() * 4000; 
      const speed = 40 + Math.random() * 80;
      const priorities = ['normal', 'high', 'low'];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];

      // Add to Python Simulation Engine
      await fetch('http://localhost:8000/api/v1/train/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: trainId,
          position: position,
          speed: speed,
          destination: 'Network Patrolling',
          priority: priority
        })
      });

      // Add to Java Backend DB
      await fetch('http://localhost:8080/api/v1/trains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trainId: trainId,
          position: position,
          speed: speed,
          destination: 'Network Patrolling',
          priority: priority,
          status: 'active'
        })
      });

      loadDashboardData();
    } catch (err) {
      console.error('Failed to add train:', err);
    }
  };

  const handleRemoveTrain = async () => {
    try {
      if (trains.length === 0) return;
      
      // Remove the last train in the list for simplicity
      const trainToRemove = trains[trains.length - 1];
      const trainId = trainToRemove.trainId || trainToRemove.id;

      // Note: Python backend might not have a specific delete endpoint shown in main.py yet
      // but we should attempt to resolve/remove it if possible. 
      // For this prototype, we'll primarily focus on the Java DB and trigger a re-init if needed.
      
      await fetch(`http://localhost:8080/api/v1/trains/${trainId}`, {
        method: 'DELETE'
      });

      // Re-initialize Python simulation to match DB state if needed, 
      // or just refresh if the Python side handles it.
      // Since Python main.py doesn't have DELETE /train/{id}, we'll re-init with current count - 1
      await handleResetSimulation(trains.length - 1);
      
      loadDashboardData();
    } catch (err) {
      console.error('Failed to remove train:', err);
    }
  };

  const handleResetSimulation = async (num) => {
    try {
      setLoading(true);
      await fetch('http://localhost:8000/api/v1/simulation/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          num_trains: num,
          track_length_km: 4110
        })
      });
      // Restart running
      await fetch('http://localhost:8000/api/v1/simulation/run?steps=10000', { method: 'POST' });
      
      // For a real app, we'd also sync the Java DB here. 
      // For the prototype, we'll just refresh the dashboard.
      setTimeout(() => {
        loadDashboardData();
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error('Failed to reset simulation:', err);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">TrackIT Integrated Command Center</h1>
          <p className="text-gray-500 text-sm">Unified AI Decision Support & Digital Twin Monitoring</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-gray-900 px-4 py-2 rounded-full shadow-lg border border-gray-700">
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,1)]"></span>
            <span className="text-xs font-bold text-green-400 tracking-widest uppercase">Engine Online</span>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition shadow-md">
            GENERATE REPORT
          </button>
        </div>
      </div>

      {/* 1. Unified KPI Metrics & Analytics (Prototype match: 0:41) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-blue-200 transition-colors">
          <div className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Active Services</div>
          <div className="text-3xl font-black text-gray-800">{metrics.totalTrains}</div>
          <div className="text-[10px] text-green-500 font-bold mt-1">↑ 2 from prev hr</div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-blue-200 transition-colors">
          <div className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Section Throughput</div>
          <div className="text-3xl font-black text-blue-600">
            {Math.floor(metrics.avgSpeed / 3)} <span className="text-xs text-gray-400 font-normal">T/Hr</span>
          </div>
          <div className="text-[10px] text-blue-400 font-bold mt-1">OPTIMIZED</div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-blue-200 transition-colors">
          <div className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Avg Network Speed</div>
          <div className="text-3xl font-black text-gray-800">{metrics.avgSpeed} <span className="text-sm text-gray-400">km/h</span></div>
          <div className="text-[10px] text-orange-500 font-bold mt-1">↓ 1.2% variance</div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-blue-200 transition-colors">
          <div className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">System Efficiency</div>
          <div className={`text-3xl font-black ${metrics.punctuality > 90 ? 'text-green-600' : 'text-orange-500'}`}>
            {metrics.punctuality}%
          </div>
          <div className="text-[10px] text-green-500 font-bold mt-1">↑ 0.5% AI Gain</div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-blue-200 transition-colors">
          <div className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Bottleneck Risk</div>
          <div className="text-3xl font-black text-red-600">{metrics.totalConflicts}</div>
          <div className="text-[10px] text-red-400 font-bold mt-1">REQUIRES ACTION</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* LEFT COLUMN: WHAT-IF SIMULATOR & MONITORING */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* 2. 'What-If' Analysis Simulator Panel (Integrated) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-blue-50 border-dashed">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-extrabold text-gray-800 flex items-center italic">
                <span className="bg-blue-600 text-white p-1 rounded mr-2 not-italic text-sm">Σ</span> 
                WHAT-IF ANALYSIS SIMULATOR
              </h2>
              <div className="flex items-center space-x-2">
                 <span className="text-[10px] font-bold text-gray-400 uppercase">Scenario Control</span>
                 <div className="h-4 w-[1px] bg-gray-200 mx-1"></div>
                 <button 
                  onClick={() => handleResetSimulation(15)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] font-bold px-3 py-1 rounded transition"
                >
                  RESET DEFAULTS
                </button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 items-center bg-gray-50 p-4 rounded-lg">
              <div className="flex-1 min-w-[200px]">
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Traffic Density (Preset)</label>
                <div className="flex space-x-2">
                  {[10, 25, 50, 75].map(n => (
                    <button 
                      key={n}
                      onClick={() => handleResetSimulation(n)}
                      className={`flex-1 py-2 rounded-md font-bold text-xs transition-all ${
                        metrics.totalTrains === n 
                        ? 'bg-blue-600 text-white shadow-md transform scale-105' 
                        : 'bg-white border text-gray-600 hover:bg-blue-50'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex-1 min-w-[200px]">
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Manual Injection</label>
                <div className="flex space-x-2">
                  <button 
                    onClick={handleAddTrain}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2 rounded-md transition shadow-sm"
                  >
                    + INJECT TRAIN
                  </button>
                  <button 
                    onClick={handleRemoveTrain}
                    className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold py-2 rounded-md transition border border-red-200"
                  >
                    - DECOMMISSION
                  </button>
                </div>
              </div>

              <div className="flex-1 min-w-[200px]">
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Disruption Scenario</label>
                <select 
                  className="w-full bg-white border rounded-md px-3 py-2 text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => {
                    const scenario = e.target.value;
                    if (scenario !== 'none') {
                      fetch('http://localhost:8000/api/v1/simulation/init', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          num_trains: metrics.totalTrains,
                          disruption: scenario
                        })
                      }).then(() => loadDashboardData());
                    }
                  }}
                >
                  <option value="none">Normal Operations</option>
                  <option value="blockage">Signal Failure (Static)</option>
                  <option value="bottleneck">Track Maintenance (Caution)</option>
                  <option value="congestion">Peak Hour Gridlock</option>
                </select>
              </div>
            </div>
            
            <p className="mt-3 text-[10px] text-gray-400 font-medium italic">
              * Simulator allows modeling of various traffic densities and disruption scenarios to evaluate AI-based DSS recovery strategies.
            </p>
          </div>

          {/* 3. Live Signaling & Track Monitoring Visualization */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                Live Signaling & Track Monitoring
              </h2>
              <div className="flex items-center space-x-2">
                 <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-full font-bold">DIGITAL TWIN</span>
                 <span className="bg-purple-100 text-purple-800 text-[10px] px-2 py-0.5 rounded-full font-bold">AI ACTIVE</span>
              </div>
            </div>
            <div className="relative">
              <TrainVisualization trains={trains} segments={segments} />
              {loading && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center rounded-lg z-10">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <span className="text-xs font-bold text-blue-800">SYNCING DIGITAL TWIN...</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 4. Performance Trend Analytics (Integrated from Analytics.js) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-800">System Throughput Trend (24h)</h2>
              <div className="flex space-x-4 text-[10px] font-bold uppercase text-gray-400">
                 <div className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span> Throughput</div>
                 <div className="flex items-center"><span className="w-2 h-2 bg-red-400 rounded-full mr-1"></span> Delays</div>
              </div>
            </div>
            <div className="h-32 flex items-end space-x-1 border-b border-gray-100 pb-2 mb-2">
              {[45, 52, 48, 60, 85, 95, 82, 78, 65, 60, 75, 88, 92, 85, 70, 65, 50, 45, 55, 75, 85, 98, 90, 70].map((val, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end group relative h-full">
                  <div 
                    className={`w-full rounded-t-sm transition-all duration-300 ${
                      val > 90 ? 'bg-red-400' : val > 75 ? 'bg-blue-500' : 'bg-blue-300'
                    }`}
                    style={{ height: `${val}%` }}
                  ></div>
                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[8px] px-1 rounded opacity-0 group-hover:opacity-100 transition">
                    {val}%
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[8px] text-gray-400 font-mono">
              <span>00:00</span>
              <span>04:00</span>
              <span>08:00 (PEAK)</span>
              <span>12:00</span>
              <span>16:00</span>
              <span>20:00 (PEAK)</span>
              <span>24:00</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ALERTS & NOTIFICATIONS */}
        <div className="bg-gray-900 p-6 rounded-xl shadow-2xl h-full border border-gray-800 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-white flex items-center">
              <span className="mr-2 text-xl">⚠️</span> Alerts & Disruptions
            </h2>
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">{alerts.length}</span>
          </div>

          <div className="space-y-4 overflow-y-auto flex-1 pr-2 max-h-[1100px]">
            {alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-600 italic">
                <span className="text-3xl mb-2">✅</span>
                <span className="text-xs">All systems clear. Monitoring...</span>
              </div>
            ) : (
              alerts.map((alert, idx) => (
                <div key={idx} className={`rounded-lg p-4 border-l-4 relative overflow-hidden transition-all hover:translate-x-1 ${
                  alert.severity === 'critical' ? 'bg-red-500/10 border-red-500' : 
                  alert.severity === 'high' ? 'bg-orange-500/10 border-orange-500' : 
                  'bg-blue-500/10 border-blue-500'
                }`}>
                  <div className={`absolute top-0 right-0 text-[10px] font-bold px-2 py-1 rounded-bl-lg ${
                    alert.severity === 'critical' ? 'bg-red-500 text-white' : 
                    alert.severity === 'high' ? 'bg-orange-500 text-white' : 
                    'bg-blue-500 text-white'
                  }`}>
                    {alert.eta}
                  </div>
                  
                  <h3 className={`font-bold text-xs uppercase tracking-wide mb-1 ${
                    alert.severity === 'critical' ? 'text-red-400' : 
                    alert.severity === 'high' ? 'text-orange-400' : 
                    'text-blue-400'
                  }`}>
                    {alert.type.replace('_', ' ')} @ {alert.segment}
                  </h3>
                  <p className="text-gray-300 text-[11px] leading-relaxed mb-3">{alert.message}</p>
                  
                  <div className="bg-gray-900/80 rounded p-2 border border-gray-700">
                    <div className="text-[9px] text-gray-500 font-bold mb-1 uppercase tracking-tighter">Resolution Strategy</div>
                    <p className="text-[10px] text-gray-400 italic leading-tight">{alert.resolutionStrategy}</p>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <div className="text-[9px] text-gray-500 font-bold uppercase">Impact:</div>
                    {alert.affectedTrains.slice(0, 2).map(t => (
                      <span key={t} className="bg-gray-800 text-gray-300 text-[9px] px-1.5 py-0.5 rounded border border-gray-700">{t}</span>
                    ))}
                    {alert.affectedTrains.length > 2 && (
                      <span className="text-[9px] text-gray-500">+{alert.affectedTrains.length - 2} more</span>
                    )}
                  </div>
                  
                  {alert.type !== 'Operations Notification' && (
                    <div className="mt-4 pt-3 border-t border-gray-700/50 flex justify-end">
                      <button 
                        onClick={() => handleAuthorizeAction(alert.segment)}
                        className={`text-[10px] font-black px-4 py-1.5 rounded transition shadow-sm ${
                          alert.severity === 'critical' ? 'bg-red-600 text-white hover:bg-red-700' : 
                          alert.severity === 'high' ? 'bg-orange-600 text-white hover:bg-orange-700' : 
                          'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        AUTHORIZE ACTION
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-800">
            <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 mb-2">
              <span>NETWORK STATUS</span>
              <span className="text-blue-500">OPTIMAL</span>
            </div>
            <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full w-[85%] animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
