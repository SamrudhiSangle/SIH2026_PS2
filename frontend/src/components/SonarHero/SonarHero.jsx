import React, { useRef } from 'react';
import { ArrowRight, Compass } from 'lucide-react';
import UnderwaterAtmosphere from './UnderwaterAtmosphere';
import InteractiveAUV from './InteractiveAUV';
import { soundFx } from '../../utils/audio';

export default function SonarHero({ onExplore, onStartAnalysis, onViewDetections }) {
  const handleStartAnalysis = () => {
    soundFx.playSonarPing(1350, 0.6);
    if (onStartAnalysis) {
      onStartAnalysis();
    } else if (onExplore) {
      onExplore();
    }
  };

  const handleViewDetections = () => {
    soundFx.playSonarPing(1200, 0.5);
    if (onViewDetections) {
      onViewDetections();
    } else if (onExplore) {
      onExplore();
    }
  };

  return (
    <section
      className="relative w-full h-[calc(100vh-3.5rem)] overflow-hidden select-none bg-[#050a14]"
    >
      {/* 1. Realistic Bathymetric Base Plate */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage: `url('/assets/underwater_hero_master_16x9.jpg')`,
          filter: 'brightness(0.85) contrast(1.05)'
        }}
      />

      {/* Atmospheric depth vignette to protect editorial headline readability */}
      <div className="absolute inset-0 pointer-events-none z-[2] bg-gradient-to-r from-[#050a14]/95 via-[#050a14]/75 md:via-[#050a14]/40 to-transparent w-full lg:w-3/5" />
      <div className="absolute inset-0 pointer-events-none z-[2] bg-gradient-to-t from-[#040810]/90 via-transparent to-[#040810]/30" />

      {/* 2. Marine Atmosphere */}
      <UnderwaterAtmosphere />

      {/* 3. Sea Dragon Survey AUV */}
      <InteractiveAUV />

      {/* 4. Editorial Maritime Hero Composition */}
      <div className="relative z-30 h-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 flex flex-col justify-center pointer-events-none">
        <div className="max-w-2xl space-y-6 sm:space-y-7">
          
          {/* Scientific Moniker Tag */}
          <div className="flex items-center space-x-2.5">
            <span className="w-1.5 h-1.5 rounded-sm bg-primary"></span>
            <span className="font-mono text-[11px] tracking-[0.2em] text-[#8ea4bf] uppercase font-semibold">
              SONAROPS · EXPEDITION WORKSTATION
            </span>
          </div>

          {/* High-Contrast Editorial Headline (Newsreader Serif) */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-headline text-[#f8fafc] tracking-tight font-normal leading-[1.04]">
            From sonar<br />
            <span className="italic font-light text-primary">
              to evidence.
            </span>
          </h1>

          {/* Concise Operational Statement */}
          <p className="font-sans text-base sm:text-lg text-[#94a3b8] max-w-lg font-normal leading-relaxed">
            Turn side-scan sonar data into validated, geolocated underwater anomaly intelligence.
          </p>

          {/* Restrained Technical Pipeline Indicators */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] tracking-wider uppercase text-[#64748b] pt-1">
            <span className="text-[#94a3b8]">SONAR DATA</span>
            <span className="text-[#33465e]">→</span>
            <span className="text-[#94a3b8]">DETECTION</span>
            <span className="text-[#33465e]">→</span>
            <span className="text-[#94a3b8]">VALIDATION</span>
            <span className="text-[#33465e]">→</span>
            <span className="text-[#94a3b8]">LOCATION</span>
            <span className="text-[#33465e]">→</span>
            <span className="text-primary font-medium">EVIDENCE</span>
          </div>

          {/* Rectangular Instrument Control Buttons */}
          <div className="pt-2 pointer-events-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              id="hero-primary-cta"
              onClick={handleStartAnalysis}
              className="group inline-flex items-center justify-center space-x-2.5 px-6 py-3 rounded-sm bg-[#132338] hover:bg-[#1a2f4a] border border-[#273d5c] hover:border-primary/60 text-[#f1f5f9] font-mono text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer active:scale-98"
            >
              <span>START SONAR ANALYSIS</span>
              <ArrowRight className="w-3.5 h-3.5 text-primary group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              id="hero-secondary-cta"
              onClick={handleViewDetections}
              className="inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-sm bg-[#09111e]/90 hover:bg-[#0e192c] border border-[#1b2a3f] hover:border-[#2a3c56] text-[#8ea4bf] hover:text-[#f1f5f9] font-mono text-xs uppercase tracking-wider font-medium transition-colors cursor-pointer active:scale-98"
            >
              <span>VIEW CANDIDATE DETECTIONS</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
