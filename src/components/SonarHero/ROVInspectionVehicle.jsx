import React, { useRef, useEffect, useState } from 'react';

// Photorealistic Remote Inspection Submarine / ROV Vehicle
// Features:
// - Photorealistic vehicle cut from the reference image with physical underwater grading
// - Smooth cursor following with heavy underwater inertia and rotation damping
// - Confined strictly to the right/central-right area (never covers the headline)
// - Continuous sweeping sonar search lights scanning the seabed
// - Dynamic flexible tow cable and realistic navigation beacon strobes
export default function ROVInspectionVehicle({ pointer }) {
  const containerRef = useRef(null);
  const animFrameRef = useRef(null);

  // Position and physics state
  const stateRef = useRef({
    x: 56, // Current X in percentage of container width (default 56%)
    y: 32, // Current Y in percentage of container height (default 32%)
    prevX: 56,
    prevY: 32,
    targetX: 56,
    targetY: 32,
    yaw: 0,
    pitch: 0,
    roll: 0,
    scanAngle: 0,
    time: 0
  });

  const [renderState, setRenderState] = useState({
    x: 56,
    y: 32,
    yaw: 0,
    pitch: 0,
    roll: 0,
    scanAngle: 0,
    depthRatio: 0.5
  });

  useEffect(() => {
    let lastTime = performance.now();

    const loop = (currentTime) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.05);
      lastTime = currentTime;

      const st = stateRef.current;
      st.time += dt;

      // 1. Map pointer (-1 to 1) to constrained right/central-right viewport area:
      // Minimum X: 42% (safely away from headline on the left)
      // Maximum X: 76% (safely away from right screen bezel)
      // Minimum Y: 20% (upper water column)
      // Maximum Y: 56% (above the seabed)
      const normX = (pointer.current.x + 1) * 0.5; // 0 to 1
      const normY = (-pointer.current.y + 1) * 0.5; // 0 to 1

      // Remap to safe inspection bounding box
      const targetPercentX = 42 + normX * 34; // 42% to 76%
      const targetPercentY = 20 + normY * 36; // 20% to 56%

      // 2. Add subtle autonomous buoyancy & water drift (natural suspension)
      const buoyancy = Math.sin(st.time * 1.3) * 0.9; // ±0.9% Y oscillation
      const waterDrift = Math.cos(st.time * 0.85) * 0.7; // ±0.7% X drift

      st.targetX = targetPercentX + waterDrift;
      st.targetY = targetPercentY + buoyancy;

      // 3. Smooth underwater inertia and damping lag
      // Lerp factor ~0.045 provides heavy underwater resistance feel
      const inertia = Math.min(1, dt * 2.2);
      st.x += (st.targetX - st.x) * inertia;
      st.y += (st.targetY - st.y) * inertia;

      // 4. Calculate movement delta for banking and rotation
      const vx = st.x - st.prevX;
      const vy = st.y - st.prevY;
      st.prevX = st.x;
      st.prevY = st.y;

      // Target rotations:
      // Yaw: ±10° max
      // Pitch: ±5° max
      // Roll: ±3° max
      const targetYaw = Math.max(-10, Math.min(10, vx * 12.0));
      const targetPitch = Math.max(-5, Math.min(6, vy * 8.0));
      const targetRoll = Math.max(-3, Math.min(3, vx * 3.5));

      // Micro floating rotational sway
      const autoYaw = Math.sin(st.time * 0.7) * 1.2;
      const autoPitch = Math.cos(st.time * 1.1) * 0.8;

      st.yaw += (targetYaw + autoYaw - st.yaw) * (dt * 3.0);
      st.pitch += (targetPitch + autoPitch - st.pitch) * (dt * 3.0);
      st.roll += (targetRoll - st.roll) * (dt * 3.0);

      // 5. Continuous Sonar Scanning Sweep: LEFT -> CENTER -> RIGHT -> CENTER -> LEFT
      st.scanAngle = Math.sin(st.time * 0.9) * 14; // ±14° sweeping angle

      // Depth ratio (0 to 1) for atmospheric depth shading
      const depthRatio = (st.y - 20) / 36;

      setRenderState({
        x: st.x,
        y: st.y,
        yaw: st.yaw,
        pitch: st.pitch,
        roll: st.roll,
        scanAngle: st.scanAngle,
        depthRatio
      });

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [pointer]);

  // Atmospheric perspective filter:
  // As the vehicle descends deeper into the water column, it subtly absorbs more deep-ocean blue
  const depthBlur = 0.2 + renderState.depthRatio * 0.4;
  const depthBrightness = 1.0 - renderState.depthRatio * 0.08;

  // Tow cable start point (vessel at top left) and end point (vehicle tail)
  const vehicleTailX = renderState.x - 7.5;
  const vehicleTailY = renderState.y + 1.2;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {/* ======================================================== */}
      {/* DYNAMIC FLEXIBLE TOW CABLE / UMBILICAL                   */}
      {/* ======================================================== */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <path
          d={`M -20 -10 Q ${vehicleTailX * 0.45} ${vehicleTailY * 0.4} ${vehicleTailX}vw ${vehicleTailY}vh`}
          fill="none"
          stroke="rgba(225, 205, 120, 0.45)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        {/* Faint cable shadow in water */}
        <path
          d={`M -20 -8 Q ${vehicleTailX * 0.45 + 0.5} ${vehicleTailY * 0.4 + 1.5} ${vehicleTailX + 0.5}vw ${vehicleTailY + 1.2}vh`}
          fill="none"
          stroke="rgba(4, 25, 50, 0.35)"
          strokeWidth="2.5"
          filter="blur(2px)"
        />
      </svg>

      {/* ======================================================== */}
      {/* CONTINUOUS SCANNING VOLUMETRIC SONAR SEARCH BEAMS        */}
      {/* ======================================================== */}
      <div
        className="absolute transition-transform duration-75 ease-out"
        style={{
          left: `${renderState.x}%`,
          top: `${renderState.y}%`,
          transform: `translate(-50%, -50%) rotate(${renderState.scanAngle * 0.25}deg)`
        }}
      >
        {/* Downward / Forward Volumetric Acoustic Beam Cone */}
        <svg
          className="overflow-visible pointer-events-none"
          style={{
            position: 'absolute',
            top: '40px',
            left: '20px',
            width: '600px',
            height: '450px',
            transform: `rotate(${renderState.scanAngle}deg)`,
            transformOrigin: '0% 0%',
            transition: 'transform 0.1s ease-out'
          }}
          viewBox="0 0 600 450"
        >
          <defs>
            <radialGradient id="sonarVolumetricGrad" cx="0%" cy="0%" r="90%">
              <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.75" />
              <stop offset="25%" stopColor="#38bdf8" stopOpacity="0.32" />
              <stop offset="65%" stopColor="#0284c7" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#075985" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="beamShaftGrad" x1="0%" y1="0%" x2="40%" y2="100%">
              <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.8" />
              <stop offset="30%" stopColor="#38bdf8" stopOpacity="0.35" />
              <stop offset="70%" stopColor="#0369a1" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#082f49" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Forward Search Beam Fan */}
          <polygon
            points="0,0 280,380 440,340"
            fill="url(#sonarVolumetricGrad)"
            opacity="0.85"
            style={{ filter: 'blur(3px)' }}
          />

          {/* Central Intense Beam Core */}
          <polygon
            points="0,0 320,370 380,355"
            fill="url(#beamShaftGrad)"
            opacity="0.6"
            style={{ filter: 'blur(1.5px)' }}
          />

          {/* Left/Rear Secondary Side-Scan Beam */}
          <polygon
            points="-30,5 -220,360 -70,380"
            fill="url(#sonarVolumetricGrad)"
            opacity="0.6"
            style={{ filter: 'blur(4px)' }}
          />
        </svg>

        {/* Dynamic Illuminated Seabed Footprint */}
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            top: '320px',
            left: `${180 + renderState.scanAngle * 7}px`,
            width: '260px',
            height: '110px',
            background: 'radial-gradient(ellipse at center, rgba(125, 211, 252, 0.45) 0%, rgba(56, 189, 248, 0.2) 45%, transparent 75%)',
            transform: 'rotate(-12deg) skewX(-15deg)',
            filter: 'blur(12px)',
            transition: 'left 0.15s ease-out'
          }}
        />

        {/* Secondary Seabed Footprint on Left Side */}
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            top: '330px',
            left: `${-190 + renderState.scanAngle * 4}px`,
            width: '220px',
            height: '95px',
            background: 'radial-gradient(ellipse at center, rgba(56, 189, 248, 0.3) 0%, rgba(14, 165, 233, 0.12) 50%, transparent 75%)',
            transform: 'rotate(10deg) skewX(10deg)',
            filter: 'blur(14px)',
            transition: 'left 0.15s ease-out'
          }}
        />

        {/* Periodic Acoustic Sonar Pulse Wave Ring */}
        <div
          className="absolute pointer-events-none border border-primary/40 rounded-full"
          style={{
            top: '280px',
            left: '40px',
            width: '320px',
            height: '140px',
            transform: 'translate(-50%, -50%) rotate(-8deg)',
            animation: 'pingSlow 3.0s cubic-bezier(0, 0.2, 0.8, 1) infinite',
            filter: 'blur(1px)'
          }}
        />
      </div>

      {/* ======================================================== */}
      {/* THE PHOTOREALISTIC INSPECTION ROV VEHICLE                */}
      {/* ======================================================== */}
      <div
        ref={containerRef}
        className="absolute cursor-grab active:cursor-grabbing select-none"
        style={{
          left: `${renderState.x}%`,
          top: `${renderState.y}%`,
          transform: `translate(-50%, -50%) 
                      perspective(1000px) 
                      rotateY(${renderState.yaw}deg) 
                      rotateX(${renderState.pitch}deg) 
                      rotateZ(${renderState.roll}deg)`,
          transformOrigin: '50% 50%',
          filter: `drop-shadow(0 20px 28px rgba(2, 10, 24, 0.65)) 
                   brightness(${depthBrightness}) 
                   blur(${depthBlur}px)`,
          transition: 'transform 0.08s ease-out, filter 0.3s ease-out',
          width: 'clamp(210px, 24vw, 340px)'
        }}
      >
        <div className="relative w-full">
          {/* High-Resolution Cutout of the Real Survey Vehicle */}
          <img
            src="/assets/rov_submarine_final.png"
            alt="SONAROPS Autonomous Inspection Vehicle"
            className="w-full h-auto block select-none pointer-events-none"
            draggable={false}
          />

          {/* Forward Transducer Sonar Ping Strobe (On nose cone) */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              top: '58%',
              right: '9%',
              width: '8px',
              height: '8px',
              backgroundColor: '#bae6fd',
              boxShadow: '0 0 16px 6px rgba(56, 189, 248, 0.95), 0 0 32px 12px rgba(125, 211, 252, 0.6)',
              animation: 'pulseSubtle 2.2s infinite'
            }}
          />

          {/* Port Navigation Light (Red on hull) */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              top: '64%',
              left: '18%',
              width: '4px',
              height: '4px',
              backgroundColor: '#ef4444',
              boxShadow: '0 0 8px 3px rgba(239, 68, 68, 0.8)'
            }}
          />

          {/* Antenna Mast Strobe (Cyan beacon on top) */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              top: '4%',
              left: '52%',
              width: '4px',
              height: '4px',
              backgroundColor: '#7dd3fc',
              boxShadow: '0 0 10px 4px rgba(125, 211, 252, 0.85)',
              animation: 'pulseSubtle 1.8s infinite'
            }}
          />
        </div>
      </div>
    </div>
  );
}
