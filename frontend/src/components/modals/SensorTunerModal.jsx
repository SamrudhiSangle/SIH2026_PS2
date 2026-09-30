import React, { useState } from 'react';
import { X, Sliders, Waves, Check, RotateCcw } from 'lucide-react';
import { soundFx } from '../../utils/audio';

export default function SensorTunerModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [frequency, setFrequency] = useState(455);
  const [swathWidth, setSwathWidth] = useState(150);
  const [gainDb, setGainDb] = useState(24);
  const [tempC, setTempC] = useState(19.4);
  const [salinityPsu, setSalinityPsu] = useState(35.2);
  const [depthM, setDepthM] = useState(184);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
      <div className="w-full max-w-lg bg-[#0b111e] border border-[#1a2638] rounded-sm p-5 relative shadow-xl">
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

        {/* Modal Header */}
        <div className="flex items-center space-x-3 pb-3 border-b border-[#162234]">
          <div className="w-8 h-8 rounded-sm bg-[#101b2c] border border-[#22354e] flex items-center justify-center text-primary">
            <Sliders className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-headline text-on-surface font-normal">Hydrographic Sensor Tuner</h3>
            <span className="font-mono text-[10px] text-[#64748b]">
              EdgeTech 2205 Chirp / Kongsberg Sounder Calibrator
            </span>
          </div>
        </div>

        {/* Sliders & Controls */}
        <div className="mt-4 space-y-3.5 font-mono text-xs">
          {/* Sound Speed Live Readout */}
          <div className="p-2.5 bg-[#080d16] border border-[#162234] rounded-sm flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Waves className="w-3.5 h-3.5 text-primary" />
              <span className="text-[#8ea4bf]">CALCULATED SOUND VELOCITY:</span>
            </div>
            <span className="text-primary font-bold">{soundSpeed} m/s</span>
          </div>

          {/* Transducer Frequency */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-[#8ea4bf]">TRANSDUCER FREQUENCY:</span>
              <span className="text-primary font-bold">{frequency} kHz</span>
            </div>
            <input
              type="range"
              min="100"
              max="900"
              step="5"
              value={frequency}
              onChange={(e) => setFrequency(Number(e.target.value))}
              className="w-full h-1 bg-[#162234] rounded appearance-none cursor-pointer accent-teal-400"
            />
            <div className="flex justify-between text-[9px] text-[#50637c] mt-0.5">
              <span>100 kHz (Deep)</span>
              <span>455 kHz (Standard)</span>
              <span>900 kHz (High-Res)</span>
            </div>
          </div>

          {/* Multibeam Swath Width */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-[#8ea4bf]">SWATH COVERAGE WIDTH:</span>
              <span className="text-on-surface font-bold">{swathWidth} METERS</span>
            </div>
            <input
              type="range"
              min="50"
              max="300"
              step="10"
              value={swathWidth}
              onChange={(e) => setSwathWidth(Number(e.target.value))}
              className="w-full h-1 bg-[#162234] rounded appearance-none cursor-pointer accent-teal-400"
            />
          </div>

          {/* Receiver Gain (dB) */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-[#8ea4bf]">TIME-VARIED GAIN (TVG):</span>
              <span className="text-primary font-bold">+{gainDb} dB</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              step="1"
              value={gainDb}
              onChange={(e) => setGainDb(Number(e.target.value))}
              className="w-full h-1 bg-[#162234] rounded appearance-none cursor-pointer accent-teal-400"
            />
          </div>

          {/* Environmental Parameters Grid */}
          <div className="p-3 bg-[#080d16] border border-[#162234] rounded-sm space-y-2">
            <span className="text-[10px] text-[#8ea4bf] uppercase tracking-wider block font-semibold">
              ENVIRONMENTAL CTD PARAMETERS
            </span>
            <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
              <div>
                <span className="text-[#64748b] block">TEMPERATURE</span>
                <input
                  type="number"
                  step="0.1"
                  value={tempC}
                  onChange={(e) => setTempC(Number(e.target.value))}
                  className="w-full bg-[#0b111e] border border-[#1a2638] rounded-sm p-1 text-center font-mono text-xs text-primary mt-1 outline-none"
                />
              </div>
              <div>
                <span className="text-[#64748b] block">SALINITY (PSU)</span>
                <input
                  type="number"
                  step="0.1"
                  value={salinityPsu}
                  onChange={(e) => setSalinityPsu(Number(e.target.value))}
                  className="w-full bg-[#0b111e] border border-[#1a2638] rounded-sm p-1 text-center font-mono text-xs text-on-surface mt-1 outline-none"
                />
              </div>
              <div>
                <span className="text-[#64748b] block">DEPTH (m)</span>
                <input
                  type="number"
                  step="1"
                  value={depthM}
                  onChange={(e) => setDepthM(Number(e.target.value))}
                  className="w-full bg-[#0b111e] border border-[#1a2638] rounded-sm p-1 text-center font-mono text-xs text-on-surface mt-1 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end space-x-2.5 pt-4 border-t border-[#162234] mt-4 font-mono text-xs">
          <button
            onClick={() => {
              setFrequency(455);
              setSwathWidth(150);
              setGainDb(24);
              setTempC(19.4);
              setSalinityPsu(35.2);
              setDepthM(184);
            }}
            className="px-3 py-1.5 rounded-sm border border-[#1b283d] text-[#8ea4bf] hover:text-on-surface flex items-center space-x-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Defaults</span>
          </button>

          <button
            onClick={() => {
              soundFx.playSonarPing(1500, 0.6);
              onClose();
            }}
            className="bg-[#132338] hover:bg-[#1a2f4a] border border-[#273d5c] hover:border-primary/60 text-[#f1f5f9] font-semibold px-4 py-1.5 rounded-sm flex items-center space-x-1.5 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5 text-primary" />
            <span>Apply Calibration</span>
          </button>
        </div>
      </div>
    </div>
  );
}
