import React, { useState } from 'react';
import { X, Waves, RotateCcw } from 'lucide-react';
import { soundFx } from '../../utils/audio';

export default function DispersalSimulationModal({ isOpen, onClose, anomaly }) {
  if (!isOpen || !anomaly) return null;

  const [hours, setHours] = useState(72);

  const speedKt = anomaly.driftVector?.speedKt || 0.82;
  const headingDeg = anomaly.driftVector?.headingDeg || 295;
  const driftNm = ((speedKt * hours) / 10).toFixed(2);
  const expandedArea = Math.round((anomaly.dimensions?.area || 84) * (1 + hours * 0.18));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
      <div className="w-full max-w-2xl bg-[#0b111e] border border-[#1a2638] rounded-sm p-5 relative shadow-xl">
        {/* Close Button */}
        <button
          onClick={() => {
            soundFx.playSonarPing(1000, 0.2);
            onClose();
          }}
          className="absolute top-4 right-4 text-[#8ea4bf] hover:text-on-surface p-1 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 pb-3 border-b border-[#162234]">
          <div className="w-8 h-8 rounded-sm bg-[#101b2c] border border-[#22354e] flex items-center justify-center text-primary">
            <Waves className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-headline text-on-surface font-normal">
              Hydrodynamic Dispersal Forecast
            </h3>
            <span className="font-mono text-[10px] text-[#64748b]">
              Lagrangian Particle Trajectory Simulation · Target {anomaly.id}
            </span>
          </div>
        </div>

        {/* Simulation Canvas */}
        <div className="relative my-3 h-52 bg-[#060a12] rounded-sm border border-[#162234] overflow-hidden flex items-center justify-center p-3">
          <svg className="w-full h-full" viewBox="0 0 500 200" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="coneGrad" x1="0%" y1="50%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0.05" />
              </linearGradient>
            </defs>

            {/* Isobar grid */}
            <g stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1">
              <line x1="0" y1="50" x2="500" y2="50" />
              <line x1="0" y1="100" x2="500" y2="100" />
              <line x1="0" y1="150" x2="500" y2="150" />
              <line x1="100" y1="0" x2="100" y2="200" />
              <line x1="250" y1="0" x2="250" y2="200" />
              <line x1="400" y1="0" x2="400" y2="200" />
            </g>

            {/* Origin Node */}
            <circle cx="80" cy="100" r="4" fill="#2dd4bf" />
            <text x="80" y="125" fill="#8ea4bf" fontFamily="'JetBrains Mono'" fontSize="9" textAnchor="middle">
              T=0h ORIGIN
            </text>

            {/* Forecast Cone */}
            {hours > 0 && (
              <g>
                <polygon
                  points={`80,100 ${80 + (hours / 72) * 340},${100 - (hours / 72) * 45} ${80 + (hours / 72) * 340},${100 + (hours / 72) * 45}`}
                  fill="url(#coneGrad)"
                  stroke="#2dd4bf"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <circle cx={80 + (hours / 72) * 340} cy={100} r="4" fill="#2dd4bf" />
                <text 
                  x={80 + (hours / 72) * 340} 
                  y={125} 
                  fill="#2dd4bf" 
                  fontFamily="'JetBrains Mono'" 
                  fontSize="9" 
                  textAnchor="middle"
                >
                  T=+{hours}h ({driftNm} NM)
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Scrubber & Telemetry */}
        <div className="space-y-3 font-mono text-xs">
          <div>
            <div className="flex justify-between mb-1 text-[11px]">
              <span className="text-[#8ea4bf]">FORECAST HORIZON:</span>
              <span className="text-primary font-bold">{hours} HOURS</span>
            </div>
            <input
              type="range"
              min="0"
              max="72"
              step="6"
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              className="w-full h-1 bg-[#162234] rounded appearance-none cursor-pointer accent-teal-400"
            />
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-[10px] p-2.5 bg-[#080d16] border border-[#162234] rounded-sm">
            <div>
              <span className="text-[#64748b] block">DRIFT VECTOR</span>
              <span className="text-on-surface font-bold text-xs mt-0.5 block">{headingDeg}° @ {speedKt} kt</span>
            </div>
            <div>
              <span className="text-[#64748b] block">PROJECTED DISPLACEMENT</span>
              <span className="text-primary font-bold text-xs mt-0.5 block">{driftNm} NM</span>
            </div>
            <div>
              <span className="text-[#64748b] block">DISPERSAL ENVELOPE</span>
              <span className="text-on-surface font-bold text-xs mt-0.5 block">{expandedArea} m²</span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-[#162234] mt-3 font-mono text-xs">
          <button
            onClick={() => setHours(72)}
            className="px-3 py-1.5 rounded-sm border border-[#1b283d] text-[#8ea4bf] hover:text-on-surface flex items-center space-x-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>

          <button
            onClick={onClose}
            className="bg-[#132338] hover:bg-[#1a2f4a] border border-[#273d5c] hover:border-primary/60 text-[#f1f5f9] px-4 py-1.5 rounded-sm cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
