import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Dual volumetric sonar search beams projecting toward the seabed with continuous sweeping animation
export default function SonarBeam({ leftBeam = true }) {
  const beamGroupRef = useRef();
  const spotMeshRef = useRef();

  useFrame((state) => {
    if (!beamGroupRef.current) return;
    const time = state.clock.getElapsedTime();

    // Smooth rhythmic sonar sweep: LEFT -> CENTER -> RIGHT -> CENTER -> LEFT
    // Phase offset between left and right beams for realistic side-scan coverage
    const sweepAngle = Math.sin(time * 0.95 + (leftBeam ? 0 : 0.4)) * 0.18; // approx ±10°
    const lateralTilt = leftBeam ? -0.32 : 0.32; // Side-scan outward angle

    beamGroupRef.current.rotation.z = lateralTilt + sweepAngle;
    beamGroupRef.current.rotation.x = 0.12 + Math.cos(time * 0.75) * 0.04;

    // Subtle breathing intensity in beam opacity
    if (spotMeshRef.current && spotMeshRef.current.material) {
      spotMeshRef.current.material.opacity = 0.18 + Math.sin(time * 1.5) * 0.04;
    }
  });

  return (
    <group ref={beamGroupRef} position={[leftBeam ? -0.25 : 0.25, -0.15, 0.4]}>
      {/* Volumetric Fan/Cone extending toward seabed */}
      {/* Using truncated cylinder / cone with soft additive blend */}
      <mesh position={[0, -2.2, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.06, 1.4, 4.4, 24, 1, true]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.14}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Inner brighter core beam */}
      <mesh position={[0, -1.6, 0]}>
        <cylinderGeometry args={[0.03, 0.7, 3.2, 16, 1, true]} />
        <meshBasicMaterial
          color="#7dd3fc"
          transparent
          opacity={0.16}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Lens aperture glow ring right at the transducer housing */}
      <mesh position={[0, -0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.06, 16]} />
        <meshBasicMaterial
          color="#93c5fd"
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Illuminated Seabed Spot / Acoustic Footprint */}
      <mesh
        ref={spotMeshRef}
        position={[0, -4.3, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[2.2, 1.6]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.18}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
