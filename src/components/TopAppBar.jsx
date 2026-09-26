import React, { useState, useEffect } from 'react';
import { Layers, Sliders, Volume2, VolumeX, Radio, Compass, Disc, ShieldCheck, Terminal, MapPin } from 'lucide-react';
import { soundFx } from '../utils/audio';

export default function TopAppBar({ 
  currentView, 
  onSwitchView, 
  onToggleLayerDrawer, 
  onOpenSensorTuner, 
  anomalyCount,
  onOpenTerminal
}) {
  const [isMuted, setIsMuted] = useState(false);
  const [utcTime, setUtcTime] = useState('');
  const [latency, setLatency] = useState(38);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setUtcTime(now.toUTCString().split(' ').slice(4, 5)[0] + 'Z');
      // Subtle realistic jitter in satellite downlink latency
      setLatency(38 + Math.floor(Math.random() * 6));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleMuteToggle = () => {
    const muted = soundFx.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      soundFx.playSonarPing(1350, 0.8);
    }
  };

  const navItems = [
    { id: 'view-hero', label: '3D HERO (NEW)', sub: 'IMMERSIVE' },
    { id: 'view-landing', label: '01 — EXPLORE', sub: 'SURVEY HERO' },
    { id: 'view-workspace', label: '02 — WORKSPACE', sub: 'CARTOGRAPHY HUD' },
    { id: 'view-detections', label: '03 — DETECTIONS', sub: 'AI INFERENCE', badge: anomalyCount },
    { id: 'view-summary', label: '04 — REPORT', sub: 'GIS REGISTRY' },
  ];

  return (
    <header className="bg-[#080d17]/90 backdrop-blur-xl fixed top-0 inset-x-0 z-50 border-b border-outline-variant/30 h-14 flex items-center justify-between px-4 lg:px-8 select-none shadow-[0_12px_32px_rgba(0,0,0,0.75)]">
      {/* Brand & System Moniker */}
      <div className="flex items-center space-x-4 lg:space-x-6">
        <button 
          onClick={() => {
            soundFx.playSonarPing(1400, 0.6);
            onSwitchView('view-landing');
          }}
          className="flex items-center space-x-3 group focus:outline-none text-left"
        >
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary shadow-[0_0_10px_#4fdbc8] group-hover:scale-125 transition-transform"></span>
            <span className="w-5 h-5 rounded-full border border-secondary/30 absolute animate-ping opacity-60"></span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-headline tracking-[0.2em] font-semibold text-on-surface uppercase group-hover:text-primary transition-colors">
              SONAROPS
            </span>
            <span className="hidden sm:inline-block font-mono text-[9px] text-on-surface-variant tracking-wider">
              MARINE INTELLIGENCE
            </span>
          </div>
        </button>

        <span className="hidden xl:inline-block h-4 w-px bg-outline-variant/40"></span>
        <div className="hidden xl:flex items-center space-x-2 text-[10px] font-mono text-on-surface-variant/80">
          <span className="text-secondary">●</span>
          <span>BATHYMETRIC CARTOGRAPHY SYSTEM · V4.2</span>
        </div>
      </div>

      {/* Center Nav Buttons */}
      <nav className="hidden md:flex items-center space-x-1 lg:space-x-3 font-mono text-xs">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => {
                soundFx.playSonarPing(isActive ? 1100 : 1300, 0.5);
                onSwitchView(item.id);
              }}
              className={`px-3 py-1.5 rounded transition-all duration-200 flex items-center space-x-2 relative ${
                isActive
                  ? 'text-primary bg-primary/10 border border-primary/40 shadow-[0_0_12px_rgba(56,189,248,0.2)]'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low border border-transparent'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-primary shadow-[0_0_6px_#8ed5ff]' : 'bg-outline-variant'}`}></span>
              <span className="tracking-wider">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.2 rounded-full border border-primary/30">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Trailing Controls & Live Status */}
      <div className="flex items-center space-x-2 lg:space-x-3 font-mono text-xs">
        {/* Live Sonar Status Indicator */}
        <div className="hidden lg:flex items-center space-x-2 bg-surface-container-low px-2.5 py-1 rounded border border-outline-variant/30 text-[11px]">
          <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse shadow-[0_0_6px_#14b8a6]"></span>
          <span className="text-secondary font-medium tracking-wide">RX LINK</span>
          <span className="text-outline-variant">|</span>
          <span className="text-on-surface-variant">{latency} ms</span>
        </div>

        {/* Audio Ambient/Ping Toggle */}
        <button
          onClick={handleMuteToggle}
          title={isMuted ? "Unmute Acoustic Pings & Hydrophone" : "Mute Acoustic Pings"}
          className={`w-8 h-8 flex items-center justify-center border rounded transition-colors ${
            isMuted 
              ? 'border-outline-variant/30 bg-surface-container-lowest text-on-surface-muted hover:text-on-surface' 
              : 'border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 shadow-[0_0_10px_rgba(56,189,248,0.15)]'
          }`}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Layer Stack Quick Drawer Toggle */}
        <button
          onClick={() => {
            soundFx.playSonarPing(1100, 0.4);
            onToggleLayerDrawer();
          }}
          title="Toggle Cartographic Layer Stack"
          className="w-8 h-8 flex items-center justify-center border border-outline-variant/40 rounded bg-surface-container-low text-on-surface-variant hover:text-primary hover:border-primary/40 transition-colors"
        >
          <Layers className="w-4 h-4" />
        </button>

        {/* Sensor Tuner Modal Toggle */}
        <button
          onClick={() => {
            soundFx.playSonarPing(1200, 0.4);
            onOpenSensorTuner();
          }}
          title="Open Hydrographic Sensor Tuner"
          className="w-8 h-8 flex items-center justify-center border border-outline-variant/40 rounded bg-surface-container-low text-on-surface-variant hover:text-primary hover:border-primary/40 transition-colors"
        >
          <Sliders className="w-4 h-4" />
        </button>

        {/* Primary Action Button */}
        <button
          onClick={() => {
            soundFx.playSonarPing(1500, 0.7);
            onSwitchView('view-workspace');
          }}
          className="hidden sm:flex items-center space-x-1.5 bg-surface-container-low border border-primary-container/50 hover:border-primary-container hover:bg-surface-container text-on-surface px-3 py-1.5 rounded transition-all duration-200 active:scale-95 shadow-[0_4px_16px_rgba(0,0,0,0.5)]"
        >
          <Compass className="w-3.5 h-3.5 text-primary" />
          <span className="tracking-wide">Launch Workspace</span>
        </button>
      </div>
    </header>
  );
}
