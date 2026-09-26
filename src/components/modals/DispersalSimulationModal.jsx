import React, { useState } from 'react';
import { X, Waves, Compass, Play, Pause, RotateCcw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { soundFx } from '../../utils/audio';

export default function DispersalSimulationModal({ isOpen, onClose, anomaly }) {
  if (!isOpen || !anomaly) return null;

  const [hours, setHours] = useState(72);
  const [isPlaying, setIsPlaying] = useState(false);

  const speedKt = anomaly.driftVector?.speedKt || 0.82;
  const headingDeg = anomaly.driftVector?.headingDeg || 295;
  const driftNm = ((speedKt * hours) / 10).toFixed(2);
  const expandedArea = Math.round(anomaly.dimensions.area * (1 + hours * 0.18));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-2xl bg-[#080d17] border border-primary/40 rounded-lg shadow-2xl p-6 relative">
        {/* Close Button */}
        <button
          onClick={() => {
            soundFx.playSonarPing(1000, 0.2);
            onClose();
          }}
          className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 pb-4 border-b border-outline-variant/30">
          <div className="w-9 h-9 rounded bg-secondary/15 border border-secondary/40 flex items-center justify-center">
            <Waves className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h3 className="text-xl font-headline text-on-surface font-semibold">
              Hydrodynamic Dispersal Forecast
            </h3>
            <span className="font-mono text-[11px] text-on-surface-variant">
              Lagrangian Particle Trajectory Simulation · Target {anomaly.id} ({anomaly.shortClass})
            </span>
          </div>
        </div>

        {/* Simulation Canvas / Visual Cone */}
        <div className="relative my-4 h-56 bg-[#04080e] rounded border border-outline-variant/30 overflow-hidden flex items-center justify-center p-4">
          <svg className="w-full h-full" viewBox="0 0 500 200" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="coneGrad" x1="0%" y1="50%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#4fdbc8" stopOpacity="0.1" />
              </linearGradient>
            </defs>

            {/* Isobar grid */}
            <g stroke="rgba(148, 163, 184, 0.08)" strokeWidth="1">
              <line x1="0" y1="50" x2="500" y2="50" />
              <line x1="0" y1="100" x2="500" y2="100" />
              <line x1="0" y1="150" x2="500" y2="150" />
              <line x1="100" y1="0" x2="100" y2="200" />
              <line x1="250" y1="0" x2="250" y2="200" />
              <line x1="400" y1="0" x2="400" y2="200" />
            </g>

            {/* Current vectors */}
            <path className="flow-line" d="M 40,110 Q 150,90 280,105 T 480,100" fill="none" stroke="rgba(56, 189, 248, 0.3)" strokeWidth="1.2" />

            {/* Origin Node */}
            <circle cx="80" cy="110" r="5" fill="#38bdf8" />
            <text x="80" y="130" fill="#8ed5ff" fontFamily="'JetBrains Mono'" fontSize="9" textAnchor="middle">
              T=0h ORIGIN
            </text>

            {/* Dynamic Forecast Cone depending on scrubber hours */}
            {hours > 0 && (
              <g>
                <polygon
                  points={`80,110 ${80 + (hours / 72) * 340},${110 - (hours / 72) * 55} ${80 + (hours / 72) * 340},${110 + (hours / 72) * 55}`}
                  fill="url(#coneGrad)"
                  stroke="#38bdf8"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                />
                <circle cx={80 + (hours / 72) * 340} cy={110} r="6" fill="#4fdbc8" className="animate-pulse" />
                <text 
                  x={80 + (hours / 72) * 340} 
                  y={130} 
                  fill="#4fdbc8" 
                  fontFamily="'JetBrains Mono'" 
                  fontSize="10" 
                  textAnchor="middle" 
                  fontWeight="600"
                >
                  T=+{hours}h ({driftNm} NM)
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Scrubber & Simulation Telemetry */}
        <div className="space-y-4 font-mono text-xs">
          {/* Time Scrubber */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-on-surface-variant">FORECAST TIME HORIZON:</span>
              <span className="text-primary font-bold">{hours} HOURS</span>
            </div>
            <input
              type="range"
              min="0"
              max="72"
              step="6"
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              className="w-full accent-primary bg-surface-container h-2 rounded cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-on-surface-variant mt-1">
              <span>0h (Baseline)</span>
              <span>24h</span>
              <span>48h</span>
              <span>72h (Max Confidence)</span>
            </div>
          </div>

          {/* Environmental Velocity Metrics */}
          <div className="grid grid-cols-3 gap-3 p-3 bg-surface-container-low border border-outline-variant/30 rounded">
            <div>
              <span className="text-on-surface-variant text-[10px] block">CURRENT VECTOR</span>
              <span className="text-on-surface font-semibold">{speedKt} kts @ {headingDeg}° WNW</span>
            </div>
            <div>
              <span className="text-on-surface-variant text-[10px] block">ESTIMATED DISPERSAL</span>
              <span className="text-secondary font-semibold">{driftNm} Nautical Miles</span>
            </div>
            <div>
              <span className="text-on-surface-variant text-[10px] block">IMPACT AREA CONE</span>
              <span className="text-primary font-semibold">{expandedArea} m²</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-outline-variant/30 mt-5 font-mono text-xs">
          <button
            onClick={() => {
              soundFx.playSonarPing(1300, 0.4);
              onClose();
            }}
            className="bg-surface-container-low border border-primary-container hover:bg-surface-container text-primary font-bold px-4 py-2 rounded shadow-lg"
          >
            Confirm &amp; Log Envelope
          </button>
        </div>
      </div>
    </div>
  );
}
