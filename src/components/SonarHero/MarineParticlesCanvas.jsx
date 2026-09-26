import React, { useRef, useEffect } from 'react';

// High-performance canvas-based marine snow and particulate system
// - Microscopic suspended sediment floating in water
// - Realistic horizontal current drift (↗ → ↘ ↗)
// - Layered depth: faint distant specks to soft foreground particles
export default function MarineParticlesCanvas() {
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

    // Particle count: 110 particles for optimal 60fps performance
    const count = 110;
    const particles = [];

    for (let i = 0; i < count; i++) {
      const depth = Math.random(); // 0 = distant, 1 = foreground
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: depth > 0.8 ? 1.8 + Math.random() * 1.6 : 0.8 + Math.random() * 1.2,
        opacity: depth > 0.8 ? 0.35 + Math.random() * 0.25 : 0.15 + Math.random() * 0.2,
        vx: 0.15 + Math.random() * 0.35 * (0.8 + depth * 0.4), // Gentle rightward current drift
        vy: (Math.random() - 0.5) * 0.12,                     // Gentle vertical wandering
        phase: Math.random() * Math.PI * 2,
        depth
      });
    }

    let time = 0;

    const render = () => {
      time += 0.016;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < count; i++) {
        const p = particles[i];

        // Horizontal current with undulating vertical drift
        const waveY = Math.sin(time * 0.8 + p.phase) * 0.18;
        p.x += p.vx;
        p.y += p.vy + waveY;

        // Wrap around boundaries
        if (p.x > width + 20) p.x = -20;
        if (p.y > height + 20) p.y = -20;
        if (p.y < -20) p.y = height + 20;

        // Draw soft circular particulate speck
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(215, 240, 255, ${p.opacity})`;
        ctx.fill();

        // Foreground particles have very soft ambient glow
        if (p.depth > 0.85) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(125, 211, 252, ${p.opacity * 0.25})`;
          ctx.fill();
        }
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
