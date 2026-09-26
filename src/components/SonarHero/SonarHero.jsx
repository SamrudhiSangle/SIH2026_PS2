import React, { useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import UnderwaterAtmosphere from './UnderwaterAtmosphere';
import InteractiveAUV from './InteractiveAUV';
import { soundFx } from '../../utils/audio';

// Rebuilt Photorealistic Underwater Hero Section for SONAROPS
// - Uses the uploaded photograph as the exact 16:9 visual foundation
// - Realistic Sea Dragon AUV with smooth inertia/lerping and subtle tilt
// - 4 volumetric scanning sonar beams projecting downward to the seabed
// - Marine snow, floating sediment, subtle fish movement & sunlight shimmer
// - Pristine left-aligned typography strictly preserving SONAROPS identity
export default function SonarHero({ onExplore }) {
  const containerRef = useRef(null);
  const pointerRef = useRef({ x: 0, y: 0 });

  const bgPlateRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const normY = ((e.clientY - rect.top) / rect.height) * 2 - 1;

    pointerRef.current = { x: normX, y: -normY };

    // Direct GPU transform update for background plate (0 React re-renders)
    if (bgPlateRef.current) {
      bgPlateRef.current.style.transform = `translate3d(${-normX * 7}px, ${-normY * 5}px, 0) scale(1.025)`;
    }
  };

  const handleMouseLeave = () => {
    pointerRef.current = { x: 0, y: 0 };
    if (bgPlateRef.current) {
      bgPlateRef.current.style.transform = 'translate3d(0px, 0px, 0) scale(1.025)';
    }
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-[calc(100vh-3.5rem)] overflow-hidden select-none bg-[#031122]"
    >
      {/* ======================================================== */}
      {/* 1. PHOTOREALISTIC UNDERWATER BASE PHOTOGRAPH             */}
      {/* ======================================================== */}
      <div
        ref={bgPlateRef}
        className="absolute inset-[-14px] bg-cover bg-center transition-transform duration-500 ease-out z-0"
        style={{
          backgroundImage: `url('/assets/underwater_hero_master_16x9.jpg')`,
          transform: 'translate3d(0px, 0px, 0) scale(1.025)',
          filter: 'brightness(0.98) saturate(1.04)'
        }}
      />

      {/* Atmospheric depth vignette to protect headline readability on left */}
      <div className="absolute inset-0 pointer-events-none z-[2] bg-gradient-to-r from-[#031122]/90 via-[#031122]/30 to-transparent w-full lg:w-3/5" />
      <div className="absolute inset-0 pointer-events-none z-[2] bg-gradient-to-t from-[#020b16]/70 via-transparent to-[#020b16]/30" />

      {/* ======================================================== */}
      {/* 2. LIVING OCEAN ATMOSPHERE (Marine Snow & Distant Fish)   */}
      {/* ======================================================== */}
      <UnderwaterAtmosphere />

      {/* ======================================================== */}
      {/* 3. INTERACTIVE SEA DRAGON AUV & 4 VOLUMETRIC SONAR BEAMS */}
      {/* ======================================================== */}
      <InteractiveAUV pointer={pointerRef} />

      {/* ======================================================== */}
      {/* 4. MINIMALIST EDITORIAL UI LAYER (Left Side Only)        */}
      {/* ======================================================== */}
      <div className="relative z-30 h-full max-w-7xl mx-auto px-6 sm:px-12 flex flex-col justify-center pointer-events-none">
        <div className="max-w-xl space-y-6">
          {/* Brand Moniker Tag */}
          <div className="flex items-center space-x-2.5">
            <span className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_#4fdbc8]"></span>
            <span className="font-mono text-xs tracking-[0.25em] text-primary uppercase font-semibold">
              SONAROPS
            </span>
          </div>

          {/* Core Monograph Headline (Newsreader Serif) */}
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-headline text-on-surface tracking-tight font-normal leading-[1.02]">
            SEE WHAT<br />
            LIES<br />
            <span className="italic font-light text-primary underline decoration-primary/20 decoration-1 underline-offset-8">
              BENEATH.
            </span>
          </h1>

          {/* Small Supporting Prose */}
          <p className="font-sans text-base sm:text-lg text-on-surface-variant/90 max-w-md font-light leading-relaxed">
            AI-powered intelligence for underwater exploration.
          </p>

          {/* Primary Action CTA Button */}
          <div className="pt-2 pointer-events-auto">
            <button
              onClick={() => {
                soundFx.playSonarPing(1350, 0.7);
                if (onExplore) onExplore();
              }}
              className="group inline-flex items-center space-x-3 px-6 py-3.5 rounded bg-[#071322]/90 hover:bg-[#0c1e36] border border-primary-container/60 hover:border-primary-container text-on-surface font-sans text-sm tracking-wide font-medium transition-all duration-200 active:scale-95 shadow-[0_16px_36px_-12px_rgba(4,7,13,0.85)] backdrop-blur-md"
            >
              <span>EXPLORE PLATFORM</span>
              <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Subtle Bottom Hydrographic Status Bar */}
      <div className="absolute bottom-4 right-8 z-30 pointer-events-none hidden md:flex items-center space-x-3 font-mono text-[10px] text-on-surface-variant/75 bg-[#040e1c]/70 px-3 py-1.5 rounded border border-outline-variant/30 backdrop-blur-md">
        <span className="w-2 h-2 rounded-full bg-secondary animate-pulse shadow-[0_0_6px_#4fdbc8]"></span>
        <span>ACOUSTIC SIDE-SCAN INSPECTION ACTIVE</span>
        <span className="text-outline-variant">|</span>
        <span className="text-primary">AUV SEA DRAGON</span>
      </div>
    </section>
  );
}
