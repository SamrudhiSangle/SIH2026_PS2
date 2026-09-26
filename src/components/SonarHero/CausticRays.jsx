import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Subtle light rays filtering through the upper water column
export default function CausticRays() {
  const raysRef = useRef();

  // Create subtle volumetric light beam geometries
  const rayPlanes = useMemo(() => {
    const rays = [];
    const count = 5;
    for (let i = 0; i < count; i++) {
      rays.push({
        x: -4.5 + i * 2.3 + (Math.random() - 0.5) * 0.8,
        z: -2.0 + (Math.random() - 0.5) * 2.0,
        rotationZ: -0.18 + (Math.random() - 0.5) * 0.08,
        width: 1.2 + Math.random() * 0.8,
        height: 10,
        phase: Math.random() * Math.PI * 2,
        speed: 0.25 + Math.random() * 0.2
      });
    }
    return rays;
  }, []);

  useFrame((state) => {
    if (!raysRef.current) return;
    const time = state.clock.getElapsedTime();
    raysRef.current.children.forEach((child, i) => {
      const ray = rayPlanes[i];
      if (ray && child.material) {
        // Subtle opacity and angle pulsation
        const op = 0.08 + Math.sin(time * ray.speed + ray.phase) * 0.04;
        child.material.opacity = op;
        child.rotation.z = ray.rotationZ + Math.sin(time * 0.2 + ray.phase) * 0.02;
      }
    });
  });

  return (
    <group ref={raysRef} position={[0, 4.5, 0]}>
      {rayPlanes.map((ray, i) => (
        <mesh
          key={i}
          position={[ray.x, 0, ray.z]}
          rotation={[0.1, 0, ray.rotationZ]}
        >
          <planeGeometry args={[ray.width, ray.height, 1, 4]} />
          <meshBasicMaterial
            color="#5ce1e6"
            transparent
            opacity={0.09}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}
