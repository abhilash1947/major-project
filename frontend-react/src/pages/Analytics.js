import React, { useState, useEffect } from 'react';
import { fetchSegments, fetchTrains } from '../services/api';

function Analytics() {
  const [data, setData] = useState({
    throughput: [12, 15, 18, 14, 22, 25, 19],
    delays: [5, 8, 3, 12, 4, 6, 2],
    utilization: 68.4
  });

  const [segments, setSegments] = useState([]);
  const [kpis, setKpis] = useState({
    throughput: 24,
    throughputTrend: 12,
    delay: 4.2,
    delayTrend: -5,
    efficiency: 91,
    efficiencyTrend: 3
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const segmentsData = await fetchSegments();
        const trainsData = await fetchTrains();
        
        // Append a mock 'load' for visualization if it doesn't exist
        const enrichedSegments = segmentsData.map((seg, idx) => ({
          ...seg,
          load: seg.utilizationPercent ? seg.utilizationPercent : Math.floor(Math.random() * 75) + 20,
          displayId: `Segment ${idx + 1}`
        }));
        setSegments(enrichedSegments);

        // Dynamically update KPIs based on live train count
        const baseThroughput = 15 + trainsData.length; 
        
        setKpis(prev => ({
          throughput: Math.max(10, Math.min(50, Math.floor(baseThroughput + (Math.random() * 4 - 2)))),
          throughputTrend: Math.floor(Math.random() * 15),
          delay: Math.max(1.0, Math.min(15.0, prev.delay + (Math.random() * 0.4 - 0.2))),
          delayTrend: Math.floor(Math.random() * 10) - 5,
          efficiency: Math.max(70, Math.min(99, prev.efficiency + (Math.floor(Math.random() * 3) - 1))),
          efficiencyTrend: Math.floor(Math.random() * 5) - 2
        }));

      } catch (err) {
        console.error('Failed to load segments for analytics:', err);
      }
    };
    
    loadData();
    const interval = setInterval(loadData, 3000); // Update every 3 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">System Performance Analytics</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-bold shadow-lg">EXPORT REPORT</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KPI Cards */}
        <div className="bg-white p-6 rounded-lg shadow border-t-4 border-blue-500 transition-all duration-500">
          <p className="text-gray-500 text-sm font-bold uppercase">Section Throughput</p>
          <div className="flex items-baseline space-x-2">
            <h2 className="text-4xl font-bold text-gray-800">{kpis.throughput}</h2>
            <span className={`font-bold ${kpis.throughputTrend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {kpis.throughputTrend >= 0 ? '↑' : '↓'} {Math.abs(kpis.throughputTrend)}%
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Trains per hour (Avg)</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-t-4 border-red-500 transition-all duration-500">
          <p className="text-gray-500 text-sm font-bold uppercase">Average Delay</p>
          <div className="flex items-baseline space-x-2">
            <h2 className="text-4xl font-bold text-gray-800">{kpis.delay.toFixed(1)}m</h2>
            <span className={`font-bold ${kpis.delayTrend <= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {kpis.delayTrend <= 0 ? '↓' : '↑'} {Math.abs(kpis.delayTrend)}%
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Minutes per train</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-t-4 border-green-500 transition-all duration-500">
          <p className="text-gray-500 text-sm font-bold uppercase">System Efficiency</p>
          <div className="flex items-baseline space-x-2">
            <h2 className="text-4xl font-bold text-gray-800">{kpis.efficiency}%</h2>
            <span className={`font-bold ${kpis.efficiencyTrend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {kpis.efficiencyTrend >= 0 ? '↑' : '↓'} {Math.abs(kpis.efficiencyTrend)}%
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Resource optimization score</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mock Throughput Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-6 text-gray-700">Throughput Trend (24h)</h2>
          <div className="h-64 flex items-end space-x-2">
            {data.throughput.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center group">
                <div 
                  className="w-full bg-blue-500 rounded-t transition-all duration-500 hover:bg-blue-600"
                  style={{ height: `${val * 3}px` }}
                >
                  <div className="hidden group-hover:block bg-black text-white text-[10px] p-1 rounded -mt-8 text-center">{val}</div>
                </div>
                <span className="text-[10px] text-gray-400 mt-2 font-mono">{i*4}:00</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottleneck Analysis */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4 text-gray-700">Segment Bottleneck Analysis</h2>
          <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
            {segments.map(seg => (
              <div key={seg.segmentId} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-gray-600">{seg.displayId} <span className="text-[10px] font-normal text-gray-400">({seg.segmentId})</span></span>
                  <span className={seg.load > 85 ? 'text-red-600 font-bold' : 'text-gray-500'}>{seg.load}% Load</span>
                </div>
                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${seg.load > 85 ? 'bg-red-500' : seg.load > 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${seg.load}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
