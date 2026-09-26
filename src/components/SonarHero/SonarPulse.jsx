import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Periodic soft circular/elliptical acoustic pulse expanding across the seabed
export default function SonarPulse({ rovPosition }) {
  const pulseRingsRef = useRef([]);

  // Create two staggered pulses for continuous natural sonar pacing
  const pulses = [
    { period: 3.2, offset: 0 },
    { period: 3.2, offset: 1.6 }
  ];

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    pulseRingsRef.current.forEach((ring, idx) => {
      if (!ring) return;
      const p = pulses[idx];
      // Progress from 0 to 1 over the duration
      const elapsed = (time + p.offset) % p.period;
      const progress = elapsed / p.period;

      // Scale expands outward (e.g. from 0.4 to 5.5 meters across seabed)
      const scale = 0.4 + progress * 5.2;
      ring.scale.set(scale, scale, 1);

      // Follow ROV's horizontal position projected onto seabed plane
      if (rovPosition && rovPosition.current) {
        ring.position.x = rovPosition.current.x;
        ring.position.z = rovPosition.current.z + 0.3;
      }

      // Smooth opacity curve: fade in quickly, fade out gracefully
      let opacity = 0;
      if (progress < 0.2) {
        opacity = (progress / 0.2) * 0.35;
      } else {
        opacity = (1 - (progress - 0.2) / 0.8) * 0.35;
      }

      if (ring.material) {
        ring.material.opacity = Math.max(0, opacity);
      }
    });
  });

  return (
    <group position={[0, -2.65, 0]}>
      {pulses.map((_, i) => (
        <mesh
          key={i}
          ref={(el) => (pulseRingsRef.current[i] = el)}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[0.92, 1.0, 48]} />
          <meshBasicMaterial
            color="#38bdf8"
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}
