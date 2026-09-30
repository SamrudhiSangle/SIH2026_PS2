import React, { useEffect, useState } from 'react';

// Subtle light rays filtering through the upper ocean water column
// Slowly undulating opacity and subtle position drift to evoke deep water
export default function CausticLighting() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let animId;
    let time = 0;
    const loop = () => {
      time += 0.012;
      setOffset(time);
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[5]">
      {/* Primary Sunlight Caustic Shafts */}
      <svg
        className="w-full h-full opacity-40 mix-blend-screen"
        preserveAspectRatio="none"
        viewBox="0 0 1000 600"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="causticGrad1" x1="0%" y1="0%" x2="30%" y2="100%">
            <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.45" />
            <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#0369a1" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="causticGrad2" x1="0%" y1="0%" x2="20%" y2="100%">
            <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.55" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#075985" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Dynamic Ray 1 */}
        <polygon
          points={`${240 + Math.sin(offset * 0.7) * 25},0 ${340 + Math.sin(offset * 0.7) * 30},0 ${440 + Math.cos(offset * 0.6) * 40},550 ${280 + Math.cos(offset * 0.6) * 35},550`}
          fill="url(#causticGrad1)"
          opacity={0.6 + Math.sin(offset * 0.9) * 0.25}
        />

        {/* Dynamic Ray 2 (Central bright shaft) */}
        <polygon
          points={`${420 + Math.sin(offset * 0.5 + 1.2) * 20},0 ${490 + Math.sin(offset * 0.5 + 1.2) * 25},0 ${620 + Math.cos(offset * 0.45) * 30},580 ${510 + Math.cos(offset * 0.45) * 25},580`}
          fill="url(#causticGrad2)"
          opacity={0.7 + Math.cos(offset * 0.75) * 0.2}
        />

        {/* Dynamic Ray 3 (Right shaft over shipwreck) */}
        <polygon
          points={`${650 + Math.sin(offset * 0.6 + 2.5) * 20},0 ${740 + Math.sin(offset * 0.6 + 2.5) * 25},0 ${880 + Math.cos(offset * 0.5) * 35},520 ${760 + Math.cos(offset * 0.5) * 30},520`}
          fill="url(#causticGrad1)"
          opacity={0.5 + Math.sin(offset * 0.8 + 1.0) * 0.2}
        />
      </svg>
    </div>
  );
}
