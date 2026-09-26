import React, { useState } from 'react';
import { X, Sliders, Volume2, Waves, Gauge, Check, RotateCcw } from 'lucide-react';
import { soundFx } from '../../utils/audio';

export default function SensorTunerModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [frequency, setFrequency] = useState(455);
  const [swathWidth, setSwathWidth] = useState(150);
  const [gainDb, setGainDb] = useState(24);
  const [tempC, setTempC] = useState(19.4);
  const [salinityPsu, setSalinityPsu] = useState(35.2);
  const [depthM, setDepthM] = useState(184);

  // Mackenzie acoustic velocity formula: c = 1448.96 + 4.591*T - 5.304e-2*T^2 + 2.374e-4*T^3 + 1.340*(S-35) + 1.630e-2*D
  const calcSoundSpeed = () => {
    const c = 1448.96 + 
              4.591 * tempC - 
              0.05304 * (tempC * tempC) + 
              0.0002374 * (tempC * tempC * tempC) + 
              1.340 * (salinityPsu - 35) + 
              0.01630 * depthM;
    return c.toFixed(1);
  };

  const soundSpeed = calcSoundSpeed();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-lg bg-[#080d17] border border-primary/40 rounded-lg shadow-2xl p-6 relative">
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

        {/* Modal Header */}
        <div className="flex items-center space-x-3 pb-4 border-b border-outline-variant/30">
          <div className="w-9 h-9 rounded bg-primary/10 border border-primary/30 flex items-center justify-center">
            <Sliders className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-headline text-on-surface font-semibold">Hydrographic Sensor Tuner</h3>
            <span className="font-mono text-[11px] text-on-surface-variant">
              EdgeTech 2205 Chirp / Kongsberg EM2040 Sounder Calibrator
            </span>
          </div>
        </div>

        {/* Sliders & Controls */}
        <div className="mt-5 space-y-4 font-mono text-xs">
          {/* Acoustic Sound Speed Live Readout */}
          <div className="p-3 bg-surface-container-low border border-secondary/40 rounded flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Waves className="w-4 h-4 text-secondary" />
              <span className="text-on-surface">CALCULATED SOUND VELOCITY:</span>
            </div>
            <span className="text-secondary font-bold text-sm">{soundSpeed} m/s</span>
          </div>

          {/* Transducer Frequency */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-on-surface-variant">TRANSDUCER FREQUENCY:</span>
              <span className="text-primary font-bold">{frequency} kHz</span>
            </div>
            <input
              type="range"
              min="100"
              max="900"
              step="5"
              value={frequency}
              onChange={(e) => setFrequency(Number(e.target.value))}
              className="w-full accent-primary bg-surface-container h-1.5 rounded cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-on-surface-variant mt-0.5">
              <span>100 kHz (Deep Penetration)</span>
              <span>455 kHz (Standard)</span>
              <span>900 kHz (High-Res)</span>
            </div>
          </div>

          {/* Multibeam Swath Width */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-on-surface-variant">SWATH COVERAGE WIDTH:</span>
              <span className="text-primary font-bold">{swathWidth} METERS</span>
            </div>
            <input
              type="range"
              min="50"
              max="300"
              step="10"
              value={swathWidth}
              onChange={(e) => setSwathWidth(Number(e.target.value))}
              className="w-full accent-primary bg-surface-container h-1.5 rounded cursor-pointer"
            />
          </div>

          {/* Receiver Gain (dB) */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-on-surface-variant">TIME-VARIED GAIN (TVG):</span>
              <span className="text-secondary font-bold">+{gainDb} dB</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              step="1"
              value={gainDb}
              onChange={(e) => setGainDb(Number(e.target.value))}
              className="w-full accent-secondary bg-surface-container h-1.5 rounded cursor-pointer"
            />
          </div>

          {/* Environmental Parameters Grid */}
          <div className="p-3 bg-surface-container-low/60 border border-outline-variant/30 rounded space-y-2">
            <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block font-semibold">
              ENVIRONMENTAL CTD PARAMETERS (CTD-07)
            </span>
            <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
              <div>
                <span className="text-on-surface-variant text-[9px] block">TEMPERATURE</span>
                <input
                  type="number"
                  step="0.1"
                  value={tempC}
                  onChange={(e) => setTempC(Number(e.target.value))}
                  className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded p-1 text-center font-mono text-xs text-primary mt-1"
                />
              </div>
              <div>
                <span className="text-on-surface-variant text-[9px] block">SALINITY (PSU)</span>
                <input
                  type="number"
                  step="0.1"
                  value={salinityPsu}
                  onChange={(e) => setSalinityPsu(Number(e.target.value))}
                  className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded p-1 text-center font-mono text-xs text-secondary mt-1"
                />
              </div>
              <div>
                <span className="text-on-surface-variant text-[9px] block">DEPTH (m)</span>
                <input
                  type="number"
                  step="1"
                  value={depthM}
                  onChange={(e) => setDepthM(Number(e.target.value))}
                  className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded p-1 text-center font-mono text-xs text-on-surface mt-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end space-x-3 pt-5 border-t border-outline-variant/30 mt-5 font-mono text-xs">
          <button
            onClick={() => {
              setFrequency(455);
              setSwathWidth(150);
              setGainDb(24);
              setTempC(19.4);
              setSalinityPsu(35.2);
              setDepthM(184);
            }}
            className="px-3 py-1.5 rounded border border-outline-variant/40 text-on-surface-variant hover:text-on-surface flex items-center space-x-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={() => {
              soundFx.playSonarPing(1500, 0.6);
              onClose();
            }}
            className="bg-surface-container-low border border-primary-container hover:bg-surface-container text-primary font-bold px-4 py-1.5 rounded flex items-center space-x-1.5 shadow-lg"
          >
            <Check className="w-4 h-4" />
            <span>Apply Calibration</span>
          </button>
        </div>
      </div>
    </div>
  );
}
