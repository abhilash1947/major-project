import React, { useMemo } from 'react';

function TrainVisualization({ trains, segments }) {
  // Bounds for South India
  const bounds = {
    minLat: 8.0,
    maxLat: 18.5,
    minLon: 73.0,
    maxLon: 81.5
  };

  const getCoords = (lat, lon) => {
    const width = 600;
    const height = 800;
    const x = ((lon - bounds.minLon) / (bounds.maxLon - bounds.minLon)) * width;
    const y = height - ((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * height;
    return { x, y };
  };

  return (
    <div className="w-full flex flex-col md:flex-row gap-6">
      <div className="flex-1 bg-gray-900 rounded-xl shadow-2xl border border-gray-700 p-4 relative overflow-hidden h-[600px]">
        <h3 className="text-white text-lg font-bold mb-4 flex items-center z-10 relative">
          <span className="w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse"></span>
          Tracks
        </h3>
        
        <svg viewBox="0 0 600 800" className="w-full h-full">
          {/* Background Map Approximation */}
          <path 
            d="M 580 50 L 480 100 L 400 300 L 300 500 L 250 700 L 350 780 L 500 750 L 580 500 Z" 
            fill="#1a202c" stroke="#2d3748" strokeWidth="2"
          />

          {/* Railway Tracks dynamically from segments */}
          {segments?.map((seg) => {
            const start = getCoords(seg.startLat, seg.startLon);
            const end = getCoords(seg.endLat, seg.endLon);
            if (!start.x || !end.x) return null;
            return (
              <g key={seg.segmentId}>
                <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke="#4a5568" strokeWidth="4" className="opacity-50" />
                <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke="#ffd700" strokeWidth="1" strokeDasharray="5,5" />
              </g>
            );
          })}

          {/* Extracted Unique Stations from Segments */}
          {useMemo(() => {
            if (!segments) return [];
            const stationMap = new Map();
            segments.forEach(seg => {
              const code1 = seg.segmentId.split('-')[0];
              const code2 = seg.segmentId.split('-')[1];
              if (!stationMap.has(code1)) stationMap.set(code1, {code: code1, lat: seg.startLat, lon: seg.startLon});
              if (!stationMap.has(code2)) stationMap.set(code2, {code: code2, lat: seg.endLat, lon: seg.endLon});
            });
            return Array.from(stationMap.values()).map((station, index) => {
              const { x, y } = getCoords(station.lat, station.lon);
              return (
                <g key={station.code}>
                  <circle cx={x} cy={y} r="5" fill="#4299e1" />
                  <text x={x + 8} y={y + 4} fill="#a0aec0" fontSize="12" fontWeight="bold" className="pointer-events-none">
                    {`Segment ${index + 1}`}
                  </text>
                </g>
              );
            });
          }, [segments])}

          {/* Live Trains */}
          {trains.map((train, idx) => {
            if (!train.lat || !train.lon) return null;
            const { x, y } = getCoords(train.lat, train.lon);
            
            // Determine status
            let statusColor = '#4299e1'; // Blue (Normal/Moving)
            let statusText = 'RUNNING';
            let animationClass = 'transition-all duration-1000';
            
            if (train.speed < 1) {
              statusColor = '#ecc94b'; // Yellow (Waiting)
              statusText = 'WAITING';
              animationClass += ' animate-pulse';
            }
            
            if (train.priority === 'high') {
              statusColor = '#f56565'; // Red (High Priority/Emergency)
              if (train.speed < 1) statusText = 'BLOCKED';
            }

            return (
              <g key={train.trainId} className={animationClass}>
                {/* Train Indicator Square (Force Update Marker) */}
                <rect 
                  x={x - 10} y={y - 10} width="20" height="20" 
                  fill={statusColor} 
                  stroke="white" strokeWidth="3"
                  className={train.speed < 1 ? 'animate-bounce' : ''}
                />
                
                {/* Status Label (Appears above the train) */}
                <text x={x} y={y - 32} textAnchor="middle" fill={statusColor} fontSize="12" fontWeight="black" className="font-mono bg-black/50 px-1">
                  {statusText}
                </text>

                {/* Train ID Tag */}
                <rect x={x - 25} y={y - 25} width="50" height="15" rx="4" fill="rgba(0,0,0,0.9)" />
                <text x={x} y={y - 14} textAnchor="middle" fill="#00ff00" fontSize="10" fontWeight="bold">
                  {`T-${idx + 1}`}
                </text>

                {/* Speed Line (Visual indicator of movement) */}
                {train.speed > 0 && (
                  <line 
                    x1={x} y1={y} x2={x - (train.speed / 10)} y2={y} 
                    stroke={statusColor} strokeWidth="2" strokeDasharray="2,2"
                    className="opacity-60"
                  />
                )}
              </g>
            );
          })}
        </svg>

        <div className="absolute bottom-4 right-4 bg-black/60 p-2 rounded text-[10px] text-gray-400 font-mono">
          PROJECTION: EPSG:4326<br/>
          SCALE: 1:10,000,000
        </div>
      </div>

      <div className="w-full md:w-80 space-y-4 overflow-y-auto max-h-[600px] pr-2">
        <h3 className="text-gray-800 font-bold uppercase tracking-widest text-sm mb-2">Network Fleet Status</h3>
        {trains.map((train) => (
          <div key={train.trainId} className="p-4 border rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-gray-800">{(train.trainId || '').replace('_', ' #')}</h3>
                <p className="text-[10px] text-gray-500 font-mono">{(train.lat || 0).toFixed(4)}, {(train.lon || 0).toFixed(4)}</p>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                train.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {(train.priority || 'normal').toUpperCase()}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-gray-400 uppercase">Speed</div>
                <div className="text-sm font-bold text-gray-700">{(train.speed || 0).toFixed(0)} km/h</div>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-gray-400 uppercase">Route KM</div>
                <div className="text-sm font-bold text-gray-700">{(train.position || 0).toFixed(1)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TrainVisualization;
