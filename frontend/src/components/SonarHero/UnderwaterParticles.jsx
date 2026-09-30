import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Suspended marine particulate (marine snow) moving slowly with underwater currents
export default function UnderwaterParticles({ count = 280, isMobile = false }) {
  const actualCount = isMobile ? 120 : count;
  const pointsRef = useRef();

  // Generate multi-layer particle data with varied depths and sizes
  const { positions, scales, velocities } = useMemo(() => {
    const pos = new Float32Array(actualCount * 3);
    const sca = new Float32Array(actualCount);
    const vel = new Float32Array(actualCount * 3);

    for (let i = 0; i < actualCount; i++) {
      // Spread across underwater volume
      pos[i * 3] = (Math.random() - 0.5) * 22;      // X
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;  // Y
      pos[i * 3 + 2] = (Math.random() - 0.5) * 14;  // Z

      // Layered sizes: foreground particles larger, background particles smaller
      const zDepth = pos[i * 3 + 2];
      const baseScale = zDepth > 2 ? 0.07 : (zDepth < -3 ? 0.025 : 0.045);
      sca[i] = baseScale * (0.6 + Math.random() * 0.8);

      // Subtle horizontal current drift with slow vertical wandering (↗ → ↘ ↗)
      vel[i * 3] = 0.003 + Math.random() * 0.005;            // Gentle rightward drift
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.002;        // Gentle vertical wandering
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.0015;       // Depth micro-drift
    }

    return { positions: pos, scales: sca, velocities: vel };
  }, [actualCount]);

  // Texture for soft circular marine particulate
  const particleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(210, 240, 255, 0.95)');
    grad.addColorStop(0.35, 'rgba(140, 205, 240, 0.45)');
    grad.addColorStop(0.7, 'rgba(70, 160, 210, 0.12)');
    grad.addColorStop(1, 'rgba(10, 40, 80, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const texture = new THREE.CanvasTexture(canvas);
    texture.premultiplyAlpha = true;
    return texture;
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const geom = pointsRef.current.geometry;
    const posAttr = geom.attributes.position;
    const posArr = posAttr.array;

    const time = state.clock.getElapsedTime();

    for (let i = 0; i < actualCount; i++) {
      const idx = i * 3;
      // Drift horizontally with undulating current
      const waveY = Math.sin(time * 0.4 + posArr[idx] * 0.5) * 0.0015;
      posArr[idx] += velocities[idx];
      posArr[idx + 1] += velocities[idx + 1] + waveY;
      posArr[idx + 2] += velocities[idx + 2];

      // Wrap-around boundary constraints
      if (posArr[idx] > 11) posArr[idx] = -11;
      if (posArr[idx + 1] > 6) posArr[idx + 1] = -6;
      if (posArr[idx + 1] < -6) posArr[idx + 1] = 6;
      if (posArr[idx + 2] > 7) posArr[idx + 2] = -7;
      if (posArr[idx + 2] < -7) posArr[idx + 2] = 7;
    }

    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={actualCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.16}
        map={particleTexture}
        transparent
        opacity={0.65}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}
