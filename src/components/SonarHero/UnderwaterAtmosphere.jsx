import React, { useRef, useEffect } from 'react';

// Lightweight, 60fps Canvas for Underwater Atmosphere:
// - Subtle multi-layered marine snow and drifting sediment
// - Subtle schools of tiny distant fish swimming naturally near the shipwreck
// - Subtle caustic sunlight shimmer in upper water column
export default function UnderwaterAtmosphere() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // 1. Marine particles (marine snow & microscopic sediment)
    const particleCount = 85;
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      const depth = Math.random(); // 0 = far, 1 = near
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: depth > 0.8 ? 1.5 + Math.random() * 1.5 : 0.6 + Math.random() * 0.9,
        opacity: depth > 0.8 ? 0.35 + Math.random() * 0.25 : 0.12 + Math.random() * 0.18,
        vx: 0.12 + Math.random() * 0.25 * (0.8 + depth * 0.5), // Gentle rightward current drift
        vy: (Math.random() - 0.5) * 0.08,                      // Subtle vertical wandering
        phase: Math.random() * Math.PI * 2,
        depth
      });
    }

    // 2. Subtle tiny fish school swimming naturally in the distance near the shipwreck/midwater
    const fishCount = 18;
    const fishes = [];
    for (let i = 0; i < fishCount; i++) {
      fishes.push({
        x: width * 0.6 + (Math.random() - 0.5) * width * 0.25,
        y: height * 0.3 + (Math.random() - 0.5) * height * 0.15,
        speed: 0.35 + Math.random() * 0.35,
        length: 4 + Math.random() * 4,
        wigglePhase: Math.random() * Math.PI * 2,
        heading: -0.15 + (Math.random() - 0.5) * 0.1,
        opacity: 0.3 + Math.random() * 0.25
      });
    }

    let time = 0;

    const render = () => {
      time += 0.016;
      ctx.clearRect(0, 0, width, height);

      // Render Marine Particles
      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];
        const waveY = Math.sin(time * 0.8 + p.phase) * 0.14;
        p.x += p.vx;
        p.y += p.vy + waveY;

        if (p.x > width + 20) p.x = -20;
        if (p.y > height + 20) p.y = -20;
        if (p.y < -20) p.y = height + 20;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(210, 240, 255, ${p.opacity})`;
        ctx.fill();

        // Subtle soft halo for foreground particles
        if (p.depth > 0.82) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(125, 211, 252, ${p.opacity * 0.22})`;
          ctx.fill();
        }
      }

      // Render Subtle Distant Fish Silhouettes
      for (let i = 0; i < fishCount; i++) {
        const f = fishes[i];
        f.x -= f.speed; // Swim leftwards
        f.y += Math.sin(time * 1.5 + f.wigglePhase) * 0.12;

        if (f.x < width * 0.45) {
          f.x = width * 0.85 + Math.random() * 60;
          f.y = height * 0.25 + Math.random() * height * 0.2;
        }

        // Draw small streamlined fish silhouette
        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(f.heading + Math.sin(time * 3 + f.wigglePhase) * 0.08);

        ctx.beginPath();
        ctx.ellipse(0, 0, f.length, f.length * 0.32, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(10, 25, 50, ${f.opacity})`;
        ctx.fill();

        // Small tail fin
        ctx.beginPath();
        ctx.moveTo(f.length * 0.8, 0);
        ctx.lineTo(f.length * 1.3, -f.length * 0.28);
        ctx.lineTo(f.length * 1.3, f.length * 0.28);
        ctx.closePath();
        ctx.fillStyle = `rgba(10, 25, 50, ${f.opacity * 0.8})`;
        ctx.fill();

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-10 w-full h-full"
    />
  );
}
