import React, { useState, useEffect } from 'react';
import { ArrowRight, Radar, Waves, Compass, Activity, ShieldAlert, Sparkles, Navigation, Globe } from 'lucide-react';
import { soundFx } from '../../utils/audio';

export default function ExploreLanding({ onNavigate, onSelectAnomaly, anomalies }) {
  const [pulseFlux, setPulseFlux] = useState([45, 68, 32, 95, 76, 40, 88, 62, 79, 54, 91, 70]);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  // Simulate real-time acoustic backscatter fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseFlux(prev => prev.map(() => 20 + Math.floor(Math.random() * 80)));
    }, 450);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCursorPos({
      x: Math.round(((e.clientX - rect.left) / rect.width) * 100),
      y: Math.round(((e.clientY - rect.top) / rect.height) * 100)
    });
  };

  return (
    <section 
      className="relative w-full h-[calc(100vh-3.5rem)] flex flex-col justify-between overflow-hidden select-none"
      onMouseMove={handleMouseMove}
    >
      {/* Dynamic Bathymetric Vector Background & Radar Sweep */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <svg className="w-full h-full opacity-70" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="depthGradientMain" cx="50%" cy="50%" r="65%">
              <stop offset="0%" stopColor="#121e33" stopOpacity="0.45" />
              <stop offset="55%" stopColor="#0a101d" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#060a10" stopOpacity="1" />
            </radialGradient>
            <pattern id="gridPattern" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(148, 163, 184, 0.04)" strokeWidth="1" />
            </pattern>
          </defs>

          {/* Gradients and grids */}
          <rect width="100%" height="100%" fill="url(#depthGradientMain)" />
          <rect width="100%" height="100%" fill="url(#gridPattern)" />

          {/* Isobar depth contour lines */}
          <g fill="none" stroke="rgba(142, 213, 255, 0.14)" strokeWidth="1.2">
            <path d="M -100,180 C 250,110 580,380 1080,240 C 1480,110 1800,290 2200,210" />
            <path d="M -100,320 C 220,260 680,520 1180,380 C 1580,260 1880,450 2200,360" stroke="rgba(79, 219, 200, 0.22)" strokeWidth="1.4" />
            <path d="M -100,470 C 180,420 780,640 1280,520 C 1680,400 1980,580 2300,500" />
            <path d="M -100,620 C 320,570 880,770 1380,650 C 1780,540 2030,740 2300,670" stroke="rgba(142, 213, 255, 0.16)" />
            <path d="M -100,770 C 380,720 980,900 1480,790 C 1880,680 2080,870 2400,820" stroke="rgba(79, 219, 200, 0.12)" />
          </g>

          {/* Dynamic Animated Ocean Streamlines */}
          <g fill="none" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1.6">
            <path className="flow-line" d="M 0,360 C 420,300 780,600 1340,470 C 1700,360 2000,520 2300,440" />
            <path className="flow-line" style={{ animationDelay: '-2.5s' }} d="M 0,490 C 380,450 850,690 1420,600 C 1820,510 2080,670 2350,590" />
            <path className="flow-line" style={{ animationDelay: '-5s' }} d="M 0,240 C 490,180 890,470 1490,360 C 1890,260 2120,420 2400,350" />
          </g>

          {/* Coordinate grid crosshairs */}
          <g stroke="rgba(148, 163, 184, 0.08)" strokeWidth="1">
            <line x1="20%" y1="0" x2="20%" y2="100%" />
            <line x1="50%" y1="0" x2="50%" y2="100%" />
            <line x1="80%" y1="0" x2="80%" y2="100%" />
            <line x1="0" y1="33%" x2="100%" y2="33%" />
            <line x1="0" y1="66%" x2="100%" y2="66%" />
          </g>

          {/* Pulsing Sonar Emitter Rings */}
          <circle className="sonar-ping" cx="50%" cy="54%" r="180" fill="none" stroke="rgba(56, 189, 248, 0.35)" strokeWidth="1.5" />
          <circle className="sonar-ping-fast" cx="50%" cy="54%" r="100" fill="none" stroke="rgba(79, 219, 200, 0.4)" strokeWidth="1.2" />
          <circle cx="50%" cy="54%" r="5" fill="#38bdf8" />
        </svg>

        {/* Central Rotating Radar Beam */}
        <div className="absolute top-[54%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[760px] h-[760px] pointer-events-none rounded-full opacity-40">
          <div className="w-full h-full radar-sweep relative">
            <div 
              className="absolute top-0 right-1/2 w-1/2 h-1/2 origin-bottom-right" 
              style={{ background: 'conic-gradient(from 180deg at 100% 100%, rgba(56, 189, 248, 0.28) 0deg, transparent 65deg)' }}
            />
          </div>
        </div>
      </div>

      {/* Top Ephemeris & Hydrographic Datum Banner */}
      <div className="relative z-10 px-4 sm:px-8 pt-5 flex flex-wrap justify-between items-start text-xs font-mono text-on-surface-variant gap-3">
        <div className="glass-panel px-3.5 py-2 rounded flex items-center space-x-3">
          <span className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_#4fdbc8]"></span>
          <span className="text-on-surface font-medium">DATUM: WGS 84 / UTM 40N</span>
          <span className="text-outline-variant">|</span>
          <span className="text-primary">23°24'42"N · 068°12'38"E</span>
        </div>

        <div className="glass-panel px-3.5 py-2 rounded hidden sm:flex items-center space-x-4">
          <div>TIDE LEVEL: <span className="text-primary font-medium">+1.42m MHWS</span></div>
          <span className="text-outline-variant">|</span>
          <div>SOUND VELOCITY: <span className="text-on-surface font-semibold">1,524.8 m/s</span></div>
          <span className="text-outline-variant">|</span>
          <div>TRANSDUCER FREQ: <span className="text-secondary font-medium">455 kHz CHIRP</span></div>
        </div>
      </div>

      {/* Central Hero Monograph Section */}
      <div className="relative z-10 px-4 sm:px-8 max-w-5xl mx-auto flex flex-col items-center text-center my-auto py-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-primary/10 border border-primary/30 text-primary font-mono text-xs uppercase tracking-[0.25em] mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
          <span>Marine Intelligence &amp; Planetary Bathymetry</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-headline text-on-surface tracking-tight leading-[1.05] max-w-4xl font-normal">
          See what lies <span className="italic font-light text-primary underline decoration-primary/30 decoration-1 underline-offset-8">beneath</span>.
        </h1>

        <p className="font-sans text-base sm:text-lg text-on-surface-variant max-w-2xl mt-5 leading-relaxed font-light">
          High-resolution multibeam acoustic backscatter, autonomous anomaly segmentation, and planetary-scale ocean floor reconstructions for spatial researchers and hydrographic cartographers.
        </p>

        {/* Primary Interactive Navigation Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
          <button
            onClick={() => {
              soundFx.playSonarPing(1400, 0.7);
              onNavigate('view-workspace');
            }}
            className="group px-6 py-3 rounded bg-surface-container-low border border-primary-container/60 hover:border-primary-container hover:bg-surface-container text-on-surface font-medium text-sm flex items-center space-x-3 transition-all duration-200 active:scale-95 shadow-[0_16px_36px_-12px_rgba(4,7,13,0.8)]"
          >
            <Compass className="w-4 h-4 text-primary group-hover:rotate-45 transition-transform" />
            <span className="tracking-wide">EXPLORE OCEAN WORKSPACE</span>
            <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => {
              soundFx.playSonarPing(1200, 0.6);
              onNavigate('view-detections');
            }}
            className="px-6 py-3 rounded bg-transparent border border-outline-variant/60 hover:border-outline hover:bg-surface-container-low/50 text-on-surface-variant hover:text-on-surface font-medium text-sm flex items-center space-x-2.5 transition-all duration-200 active:scale-95"
          >
            <Radar className="w-4 h-4 text-secondary" />
            <span>VIEW LIVE DETECTIONS ({anomalies.length})</span>
          </button>
        </div>

        {/* Quick-Inspect Anomaly Micro Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
          <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mr-2">Featured Targets:</span>
          {anomalies.slice(0, 4).map(item => (
            <button
              key={item.id}
              onClick={() => {
                soundFx.playTargetLock();
                onSelectAnomaly(item.id);
                onNavigate('view-workspace');
              }}
              className="px-2.5 py-1 rounded bg-surface-container-lowest/80 hover:bg-primary/20 border border-outline-variant/30 hover:border-primary/50 text-on-surface-variant hover:text-primary font-mono text-[11px] transition-all flex items-center space-x-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              <span>{item.id} · {item.shortClass}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sensor Bar: Real-time Live Telemetry Strip */}
      <div className="relative z-10 w-full border-t border-outline-variant/30 bg-[#060a10]/95 backdrop-blur-md px-4 sm:px-8 py-3">
        <div className="flex flex-wrap items-center justify-between font-mono text-xs text-on-surface-variant gap-y-2 max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center space-x-4 sm:space-x-8">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-secondary rounded-full"></span>
              <span className="text-on-surface-variant/70">SWATH:</span>
              <span className="text-on-surface font-medium">150.0 m</span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-on-surface-variant/70">SOUNDING DEPTH:</span>
              <span className="text-primary font-semibold">184.2 m</span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-on-surface-variant/70">CHIRP PULSE:</span>
              <span className="text-on-surface">455 kHz (Wideband)</span>
            </div>

            <div className="hidden lg:flex items-center space-x-2">
              <span className="text-on-surface-variant/70">PING RATE:</span>
              <span className="text-on-surface">14 Hz</span>
            </div>
          </div>

          {/* Interactive Acoustic Backscatter Waveform Visualizer */}
          <div className="flex items-center space-x-3">
            <span className="text-on-surface-variant/70 text-[11px]">BACKSCATTER FLUX:</span>
            <div className="flex items-end h-4 space-x-0.5">
              {pulseFlux.map((val, idx) => (
                <span
                  key={idx}
                  className="w-1 rounded-sm transition-all duration-300"
                  style={{
                    height: `${Math.max(4, (val / 100) * 16)}px`,
                    backgroundColor: idx % 3 === 0 ? '#4fdbc8' : '#38bdf8',
                    opacity: 0.4 + (val / 100) * 0.6
                  }}
                />
              ))}
            </div>
            <span className="text-secondary font-medium">-24.8 dB</span>
          </div>
        </div>
      </div>
    </section>
  );
}
