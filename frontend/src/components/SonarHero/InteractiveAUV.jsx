import React, { useRef, useEffect } from 'react';
import VolumetricSonarBeams from './VolumetricSonarBeams';

// =========================================================================
// Realistic Sea Dragon AUV Inspection Drone & Volumetric Sonar Beams
// - Zero React re-renders in the animation loop (pure direct DOM updates)
// - Continuous 60 FPS requestAnimationFrame with lerped underwater physics
// - Smooth GPU CSS transforms (translate3d, rotate, scale, opacity)
// - No filter recalculations, no layout thrashing, no SVG blur filters
// =========================================================================
export default function InteractiveAUV() {
  const animFrameRef = useRef(null);

  // Vehicle DOM references
  const auvRef = useRef(null);
  const cablePathRef = useRef(null);
  const cableShadowRef = useRef(null);

  // Beam and seabed illumination references
  const beamsGroupRef = useRef(null);
  const beam1Ref = useRef(null);
  const beam2Ref = useRef(null);
  const beam3Ref = useRef(null);
  const beam4Ref = useRef(null);
  const spot1Ref = useRef(null);
  const spot2Ref = useRef(null);

  const beamRefs = {
    groupRef: beamsGroupRef,
    beam1Ref,
    beam2Ref,
    beam3Ref,
    beam4Ref,
    spot1Ref,
    spot2Ref
  };

  // Position, physics, and rotation state (strictly mutable ref - 0 React re-renders)
  const stateRef = useRef({
    x: 48,
    y: 32,
    prevX: 48,
    prevY: 32,
    targetX: 48,
    targetY: 32,
    yaw: 0,
    pitch: 0,
    roll: 0,
    sweepAngle: 0,
    time: 0
  });

  useEffect(() => {
    let lastTime = performance.now();

    const loop = (currentTime) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.05);
      lastTime = currentTime;

      const st = stateRef.current;
      st.time += dt;

      // 1. Natural ocean hydrodynamics (Autonomous transect drift, zero cursor tracking)
      // Realistic heave and surge of a heavy underwater survey vehicle
      const buoyancyHeave = Math.sin(st.time * 0.85) * 1.1; // ±1.1% vertical heave
      const currentSurge = Math.cos(st.time * 0.5) * 1.4;   // ±1.4% horizontal surge

      st.targetX = 48 + currentSurge;
      st.targetY = 32 + buoyancyHeave;

      // 2. Smooth underwater damping inertia
      const inertia = Math.min(1, dt * 1.8);
      st.x += (st.targetX - st.x) * inertia;
      st.y += (st.targetY - st.y) * inertia;

      // 3. Subtle hydrodynamic attitude stabilization
      const targetYaw = Math.sin(st.time * 0.45) * 2.8;
      const targetPitch = Math.sin(st.time * 0.75) * 2.2;
      const targetRoll = Math.cos(st.time * 0.6) * 1.4;

      st.yaw += (targetYaw - st.yaw) * (dt * 2.0);
      st.pitch += (targetPitch - st.pitch) * (dt * 2.0);
      st.roll += (targetRoll - st.roll) * (dt * 2.0);

      // 4. Continuous acoustic survey beam sweep rhythm
      st.sweepAngle = Math.sin(st.time * 0.85) * 10.5; // ±10.5° steady sweep

      const depthBrightness = 0.96;

      // ========================================================
      // 6. DIRECT GPU-ACCELERATED DOM TRANSFORMS (ZERO REACT LAG)
      // ========================================================

      // A. Sea Dragon AUV Hull Transform
      if (auvRef.current) {
        auvRef.current.style.transform = `translate3d(${st.x}vw, ${st.y}vh, 0) translate(-50%, -50%) perspective(1000px) rotateY(${st.yaw}deg) rotateX(${st.pitch}deg) rotateZ(${st.roll}deg)`;
        auvRef.current.style.filter = `drop-shadow(0 20px 30px rgba(1, 10, 26, 0.65)) brightness(${depthBrightness})`;
      }

      // B. Dynamic Flexible Tow Umbilical Cable
      const tailX = st.x - 7.2;
      const tailY = st.y + 1.2;
      if (cablePathRef.current) {
        cablePathRef.current.setAttribute(
          'd',
          `M -20 -15 Q ${tailX * 0.45} ${tailY * 0.4} ${tailX}vw ${tailY}vh`
        );
      }
      if (cableShadowRef.current) {
        cableShadowRef.current.setAttribute(
          'd',
          `M -20 -15 Q ${tailX * 0.45 + 0.5} ${tailY * 0.4 + 1.2} ${tailX + 0.3}vw ${tailY + 0.8}vh`
        );
      }

      // C. Volumetric Sonar Beams Assembly
      // Anchored at the forward acoustic transducer (+70px X, +20px Y from AUV center)
      if (beamsGroupRef.current) {
        beamsGroupRef.current.style.transform = `translate3d(calc(${st.x}vw + 70px), calc(${st.y}vh + 20px), 0)`;
      }

      const sweep = st.sweepAngle;
      const basePitchAngle = 20 + st.pitch * 0.85; // Downward baseline + follows vehicle pitch

      // Beam 1: Primary soft white/silver volumetric search beam
      if (beam1Ref.current) {
        beam1Ref.current.style.transform = `rotate(${basePitchAngle + sweep * 0.85}deg) scaleY(${1 + Math.sin(st.time * 1.4) * 0.03})`;
        beam1Ref.current.style.opacity = `${0.82 + Math.sin(st.time * 1.1) * 0.08}`;
      }

      // Beam 2: Secondary soft white/slate volumetric ambient beam
      if (beam2Ref.current) {
        beam2Ref.current.style.transform = `rotate(${basePitchAngle - 8 + sweep * 0.7}deg) scaleY(${1 + Math.cos(st.time * 1.3) * 0.03})`;
        beam2Ref.current.style.opacity = `${0.72 + Math.cos(st.time * 1.3) * 0.08}`;
      }

      // Beam 3: Primary narrow focused cyan acoustic scanning beam
      if (beam3Ref.current) {
        beam3Ref.current.style.transform = `rotate(${basePitchAngle + 6 + sweep * 1.12}deg) scale(${1 + Math.sin(st.time * 1.9) * 0.04})`;
        beam3Ref.current.style.opacity = `${0.9 + Math.sin(st.time * 1.6) * 0.1}`;
      }

      // Beam 4: Secondary side-scan acoustic beam
      if (beam4Ref.current) {
        beam4Ref.current.style.transform = `rotate(${basePitchAngle + 14 + sweep * 0.92}deg)`;
        beam4Ref.current.style.opacity = `${0.78 + Math.cos(st.time * 2.1) * 0.1}`;
      }

      // D. Seabed Acoustic Footprints (follows sweep smoothly)
      const spotSweepOffset = sweep * 6.2 + st.pitch * 4.5;
      if (spot1Ref.current) {
        spot1Ref.current.style.transform = `translate3d(${spotSweepOffset + 35}px, 0, 0) scale(${1 + Math.sin(st.time * 1.9) * 0.06}, 1)`;
        spot1Ref.current.style.opacity = `${0.75 + Math.sin(st.time * 1.5) * 0.15}`;
      }
      if (spot2Ref.current) {
        spot2Ref.current.style.transform = `translate3d(${spotSweepOffset * 0.8}px, 0, 0) scale(${1 + Math.cos(st.time * 1.3) * 0.05}, 1)`;
        spot2Ref.current.style.opacity = `${0.65 + Math.cos(st.time * 1.2) * 0.12}`;
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {/* ======================================================== */}
      {/* DYNAMIC FLEXIBLE TOW UMBILICAL CABLE                     */}
      {/* ======================================================== */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {/* Soft cable shadow in water */}
        <path
          ref={cableShadowRef}
          d="M -20 -15 Q 18 14 38.8vw 33.2vh"
          fill="none"
          stroke="rgba(2, 18, 38, 0.4)"
          strokeWidth="2.5"
          filter="blur(2px)"
        />
        {/* Main Tow Cable */}
        <path
          ref={cablePathRef}
          d="M -20 -15 Q 17.5 12.8 38.8vw 33.2vh"
          fill="none"
          stroke="rgba(235, 215, 120, 0.5)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>

      {/* ======================================================== */}
      {/* 4 VOLUMETRIC SCANNING SONAR SEARCH BEAMS                 */}
      {/* ======================================================== */}
      <VolumetricSonarBeams ref={beamRefs} />

      {/* ======================================================== */}
      {/* THE REALISTIC SEA DRAGON AUV INSPECTION VEHICLE          */}
      {/* ======================================================== */}
      <div
        ref={auvRef}
        className="absolute cursor-grab active:cursor-grabbing select-none"
        style={{
          left: 0,
          top: 0,
          transform: 'translate3d(46vw, 32vh, 0) translate(-50%, -50%) perspective(1000px)',
          transformOrigin: '50% 50%',
          width: 'clamp(180px, 24vw, 340px)',
          willChange: 'transform'
        }}
      >
        <div className="relative w-full">
          {/* Authentic High-Resolution Sea Dragon AUV Cutout */}
          <img
            src="/assets/auv_seadragon_clean.png"
            alt="SONAROPS Sea Dragon AUV"
            className="w-full h-auto block select-none pointer-events-none"
            draggable={false}
          />

          {/* Forward Acoustic Strobe on Nose Cone */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              top: '60%',
              right: '9%',
              width: '8px',
              height: '8px',
              backgroundColor: '#e0f2fe',
              boxShadow: '0 0 18px 7px rgba(56, 189, 248, 0.95), 0 0 34px 14px rgba(125, 211, 252, 0.65)',
              animation: 'pulseSubtle 2.2s infinite'
            }}
          />

          {/* Red Port Navigation LED */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              top: '65%',
              left: '19%',
              width: '4px',
              height: '4px',
              backgroundColor: '#ef4444',
              boxShadow: '0 0 8px 3px rgba(239, 68, 68, 0.85)'
            }}
          />

          {/* Cyan Antenna Beacon on Top Mast */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              top: '5%',
              left: '52%',
              width: '4px',
              height: '4px',
              backgroundColor: '#7dd3fc',
              boxShadow: '0 0 10px 4px rgba(125, 211, 252, 0.9)',
              animation: 'pulseSubtle 1.8s infinite'
            }}
          />
        </div>
      </div>
    </div>
  );
}
