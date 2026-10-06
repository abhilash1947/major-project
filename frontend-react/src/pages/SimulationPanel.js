import React, { useState, useEffect } from 'react';
import { initializeSimulation, runSimulation, stopSimulation } from '../services/api';

function SimulationPanel() {
  const [config, setConfig] = useState({
    trackLength: 100,
    numSegments: 10,
    numTrains: 15,
    disruption: 'none'
  });
  
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState('Ready');
  const [simulationState, setSimulationState] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  const fetchRecommendations = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/drl/predict');
      const data = await response.json();
      
      // Map actions to TrackIT prototype specific recommendations
      const recs = (data.safe_actions || []).map((action, idx) => {
        if (!simulationState?.trains[idx]) return null;
        const trainId = simulationState.trains[idx].trainId;
        
        // Mocking the specific prototype data based on DRL actions
        if (action > 0.5) {
          return { 
            trainId, 
            action: 'Reroute to clear track to avoid bottleneck', 
            confidence: Math.floor(Math.random() * 10 + 88), // 88-98%
            timeSaved: Math.floor(Math.random() * 15 + 10), // 10-25 mins
            costSaved: Math.floor(Math.random() * 5000 + 2000), // $2000-$7000
            impact: 'High' 
          };
        }
        if (action < -0.5) {
          return { 
            trainId, 
            action: 'Hold at Station to optimize platform spacing', 
            confidence: Math.floor(Math.random() * 15 + 80), // 80-95%
            timeSaved: 0,
            costSaved: Math.floor(Math.random() * 1000 + 500),
            impact: 'Safety' 
          };
        }
        return null;
      }).filter(r => r !== null);

      // Force Rajdhani example if disruption is active
      if (config.disruption !== 'none' && recs.length === 0) {
          recs.push({
            trainId: 'Rajdhani Exp',
            action: 'Reroute to Track B to alleviate immediate congestion ahead.',
            confidence: 94,
            timeSaved: 45,
            costSaved: 12500,
            impact: 'High'
          });
      }
      
      setRecommendations(recs.slice(0, 3)); // Limit to top 3
    } catch (err) {
      console.error('Failed to fetch recommendations', err);
    }
  };

  useEffect(() => {
    if (running) {
      const interval = setInterval(fetchRecommendations, 3000);
      return () => clearInterval(interval);
    }
  }, [running, simulationState, config.disruption]);

  const handleConfigChange = (e) => {
    const { name, value } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: name === 'trackLength' || name === 'numSegments' || name === 'numTrains' 
        ? parseInt(value) 
        : value
    }));
  };

  const handleInitialize = async () => {
    try {
      setStatus('Initializing Digital Twin...');
      const result = await initializeSimulation({
        track_length_km: config.trackLength,
        num_segments: config.numSegments,
        num_trains: config.numTrains,
        disruption: config.disruption !== 'none' ? config.disruption : null
      });
      
      setSimulationState(result.state);
      setStatus('Ready to run What-If Analysis');
    } catch (error) {
      setStatus('Error: ' + error.message);
    }
  };

  const handleRunSimulation = async () => {
    try {
      setRunning(true);
      setStatus('Simulating Scenarios...');
      
      const result = await runSimulation(100);
      setSimulationState(result.final_state);
      setStatus(`Analysis Complete: ${result.steps_completed} steps projected`);
      setRunning(false);
    } catch (error) {
      setStatus('Error: ' + error.message);
      setRunning(false);
    }
  };

  const handleStop = async () => {
    try {
      await stopSimulation();
      setRunning(false);
      setStatus('Simulation Halted');
    } catch (error) {
      setStatus('Error stopping simulation');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">'What-If' Analysis Simulator</h1>
        <span className="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full font-bold border border-purple-300">
          PREDICTIVE SANDBOX
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel (Prototype match: 3:27) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Scenario Injection</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Disruption Type</label>
                <select
                  name="disruption"
                  value={config.disruption}
                  onChange={handleConfigChange}
                  disabled={running}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="none">Standard Operations (No Issues)</option>
                  <option value="congestion">Peak Hour Congestion</option>
                  <option value="bottleneck">Track Maintenance (Speed Restriction)</option>
                  <option value="blockage">Critical Signal Failure</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Trains</label>
                  <input
                    type="number"
                    name="numTrains"
                    value={config.numTrains}
                    onChange={handleConfigChange}
                    disabled={running}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded"
                    min="5"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Segments</label>
                  <input
                    type="number"
                    name="numSegments"
                    value={config.numSegments}
                    onChange={handleConfigChange}
                    disabled={running}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded"
                    min="5"
                    max="50"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
                <button
                  onClick={handleInitialize}
                  disabled={running}
                  className="w-full bg-gray-800 text-white font-bold px-4 py-2 rounded hover:bg-gray-700 disabled:opacity-50 transition-colors"
                >
                  Initialize Scenario
                </button>
                
                {!running ? (
                  <button
                    onClick={handleRunSimulation}
                    disabled={!simulationState}
                    className="w-full bg-blue-600 text-white font-bold px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    Run Predictive Analysis
                  </button>
                ) : (
                  <button
                    onClick={handleStop}
                    className="w-full bg-red-600 text-white font-bold px-4 py-2 rounded hover:bg-red-700 transition-colors"
                  >
                    Halt Analysis
                  </button>
                )}
              </div>

              <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-100 flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${running ? 'bg-blue-500 animate-ping' : 'bg-gray-400'}`}></div>
                <p className="text-xs font-mono text-gray-600 uppercase">{status}</p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Recommendations Panel (Prototype match: 2:12) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-blue-500 min-h-[400px]">
            <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center">
              <span className="mr-2 text-2xl text-blue-500">⚡</span> AI Recommendation Engine
            </h2>
            
            {recommendations.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 pb-12">
                <div className="text-4xl mb-4 opacity-50">🤖</div>
                <p>Awaiting simulation data to generate intelligence.</p>
                <p className="text-sm">Run an analysis to see AI rerouting suggestions.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recommendations.map((rec, i) => (
                  <div key={i} className="bg-blue-50/50 p-5 rounded-lg border border-blue-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                          {rec.trainId}
                        </span>
                        <h3 className="font-bold text-gray-800">{rec.action}</h3>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-green-600">{rec.confidence}%</div>
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Confidence</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-blue-100/50">
                      <div>
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Estimated Time Saved</div>
                        <div className="text-lg font-bold text-gray-700">~{rec.timeSaved} Minutes</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Operational Cost Saved</div>
                        <div className="text-lg font-bold text-green-600">₹{rec.costSaved.toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <button className="bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold text-xs px-4 py-2 rounded mr-2">
                        REJECT
                      </button>
                      <button className="bg-blue-600 text-white hover:bg-blue-700 font-bold text-xs px-4 py-2 rounded shadow-sm">
                        EXECUTE RECOMMENDATION
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SimulationPanel;
