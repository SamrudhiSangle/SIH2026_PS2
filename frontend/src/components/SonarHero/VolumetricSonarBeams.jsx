import React, { forwardRef } from 'react';

// =========================================================================
// High-Performance GPU-Accelerated Volumetric Sonar Scanning Beams
// - 4 volumetric beams rendered ONCE using smooth conic and linear gradients
// - ZERO per-frame SVG filter blur, box-shadow, or DOM element recreation
// - Animated strictly via GPU transforms (translate3d, rotate, scale, opacity)
// - will-change: transform, opacity applied ONLY to the animated beam elements
// =========================================================================
const VolumetricSonarBeams = forwardRef(function VolumetricSonarBeams(props, ref) {
  const {
    groupRef,
    beam1Ref,
    beam2Ref,
    beam3Ref,
    beam4Ref,
    spot1Ref,
    spot2Ref
  } = ref;

  return (
    <div
      ref={groupRef}
      className="absolute pointer-events-none overflow-visible z-[15]"
      style={{
        left: 0,
        top: 0,
        width: '1px',
        height: '1px',
        willChange: 'transform'
      }}
    >
      {/* ======================================================== */}
      {/* 1. PRIMARY SOFT WHITE/SILVER VOLUMETRIC SEARCH BEAM      */}
      {/* ======================================================== */}
      <div
        ref={beam1Ref}
        className="absolute pointer-events-none"
        style={{
          top: 0,
          left: '-260px',
          width: '520px',
          height: '470px',
          transformOrigin: '50% 0%',
          background: 'conic-gradient(from 163deg at 50% 0%, transparent 0deg, rgba(240, 248, 255, 0.04) 3deg, rgba(240, 248, 255, 0.32) 17deg, rgba(224, 242, 254, 0.14) 25deg, rgba(240, 248, 255, 0.03) 31deg, transparent 34deg)',
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.72) 32%, rgba(0,0,0,0.2) 72%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.72) 32%, rgba(0,0,0,0.2) 72%, transparent 100%)',
          willChange: 'transform, opacity'
        }}
      />

      {/* ======================================================== */}
      {/* 2. SECONDARY SOFT WHITE/SLATE VOLUMETRIC BEAM (AMBIENT)  */}
      {/* ======================================================== */}
      <div
        ref={beam2Ref}
        className="absolute pointer-events-none"
        style={{
          top: 0,
          left: '-290px',
          width: '580px',
          height: '450px',
          transformOrigin: '50% 0%',
          background: 'conic-gradient(from 158deg at 50% 0%, transparent 0deg, rgba(226, 232, 240, 0.03) 4deg, rgba(248, 250, 252, 0.22) 22deg, rgba(203, 213, 225, 0.05) 38deg, transparent 44deg)',
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.58) 35%, rgba(0,0,0,0.12) 78%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.58) 35%, rgba(0,0,0,0.12) 78%, transparent 100%)',
          willChange: 'transform, opacity'
        }}
      />

      {/* ======================================================== */}
      {/* 3. PRIMARY NARROW FOCUSED CYAN ACOUSTIC SCANNING BEAM    */}
      {/* ======================================================== */}
      <div
        ref={beam3Ref}
        className="absolute pointer-events-none"
        style={{
          top: 0,
          left: '-240px',
          width: '480px',
          height: '490px',
          transformOrigin: '50% 0%',
          background: 'conic-gradient(from 171deg at 50% 0%, transparent 0deg, rgba(56, 189, 248, 0.16) 2.5deg, rgba(224, 242, 254, 0.78) 9deg, rgba(56, 189, 248, 0.26) 15.5deg, transparent 18deg)',
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.82) 35%, rgba(0,0,0,0.26) 80%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.82) 35%, rgba(0,0,0,0.26) 80%, transparent 100%)',
          willChange: 'transform, opacity'
        }}
      />

      {/* ======================================================== */}
      {/* 4. SECONDARY SIDE-SCAN ACOUSTIC BEAM                     */}
      {/* ======================================================== */}
      <div
        ref={beam4Ref}
        className="absolute pointer-events-none"
        style={{
          top: 0,
          left: '-230px',
          width: '460px',
          height: '460px',
          transformOrigin: '50% 0%',
          background: 'conic-gradient(from 166deg at 50% 0%, transparent 0deg, rgba(14, 165, 233, 0.08) 3deg, rgba(125, 211, 252, 0.40) 14deg, rgba(2, 132, 199, 0.11) 24deg, transparent 28deg)',
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.62) 40%, rgba(0,0,0,0.14) 75%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.62) 40%, rgba(0,0,0,0.14) 75%, transparent 100%)',
          willChange: 'transform, opacity'
        }}
      />

      {/* ======================================================== */}
      {/* TRANSDUCER APERTURE GLOW FLARE AT THE NOZZLE             */}
      {/* ======================================================== */}
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          top: 0,
          left: 0,
          width: '12px',
          height: '12px',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, #e0f2fe 30%, #38bdf8 70%, transparent 100%)',
          boxShadow: '0 0 16px 6px rgba(56, 189, 248, 0.9), 0 0 32px 12px rgba(125, 211, 252, 0.5)'
        }}
      />

      {/* ======================================================== */}
      {/* ILLUMINATED SEABED ACOUSTIC FOOTPRINTS                   */}
      {/* ======================================================== */}
      {/* Primary Seabed Footprint under Forward/Cyan Beam */}
      <div
        ref={spot1Ref}
        className="absolute pointer-events-none rounded-full"
        style={{
          top: '350px',
          left: '-140px',
          width: '280px',
          height: '90px',
          background: 'radial-gradient(ellipse at center, rgba(56, 189, 248, 0.38) 0%, rgba(2, 132, 199, 0.14) 45%, transparent 75%)',
          transformOrigin: 'center center',
          willChange: 'transform, opacity'
        }}
      />

      {/* Secondary Seabed Footprint under Rear/White Beam */}
      <div
        ref={spot2Ref}
        className="absolute pointer-events-none rounded-full"
        style={{
          top: '340px',
          left: '-160px',
          width: '320px',
          height: '100px',
          background: 'radial-gradient(ellipse at center, rgba(240, 248, 255, 0.28) 0%, rgba(148, 163, 184, 0.08) 50%, transparent 75%)',
          transformOrigin: 'center center',
          willChange: 'transform, opacity'
        }}
      />
    </div>
  );
});

export default VolumetricSonarBeams;
