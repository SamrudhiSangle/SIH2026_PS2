import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import ROV from './ROV';
import Seabed from './Seabed';
import SonarPulse from './SonarPulse';
import UnderwaterParticles from './UnderwaterParticles';
import CausticRays from './CausticRays';

// Camera controller for very subtle mouse parallax
function CameraParallax({ pointer }) {
  useFrame((state, delta) => {
    const cam = state.camera;
    // Extremely subtle camera response (ROV is the primary interactive object)
    const targetCamX = pointer.current.x * 0.32;
    const targetCamY = 0.4 + pointer.current.y * 0.18;

    cam.position.x = THREE.MathUtils.lerp(cam.position.x, targetCamX, delta * 1.4);
    cam.position.y = THREE.MathUtils.lerp(cam.position.y, targetCamY, delta * 1.4);
    cam.lookAt(0, 0, 0);
  });

  return null;
}

export default function SonarScene({ pointer, isMobile = false }) {
  const rovPositionRef = useRef(new THREE.Vector3(-0.4, 0.9, 0.2));

  return (
    <Canvas
      camera={{ position: [0, 0.4, 5.4], fov: 46, near: 0.1, far: 35 }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance'
      }}
      dpr={isMobile ? [1, 1.5] : [1, 2]}
      className="w-full h-full"
    >
      {/* Deep Ocean Water Fog & Background Color */}
      <color attach="background" args={['#04152d']} />
      <fog attach="fog" args={['#04152d', 3.5, 22]} />

      {/* Camera Parallax */}
      <CameraParallax pointer={pointer} />

      {/* Underwater Lighting System */}
      {/* Ambient water column luminescence */}
      <ambientLight color="#0b2447" intensity={0.7} />

      {/* Downward surface sunlight filtering through deep water */}
      <directionalLight
        position={[2.5, 12, 5]}
        color="#7dd3fc"
        intensity={1.4}
        castShadow={!isMobile}
      />

      {/* Soft abyss rim light from depth */}
      <directionalLight
        position={[-4, -2, -3]}
        color="#082f49"
        intensity={0.5}
      />

      {/* Atmospheric Caustic Rays from surface */}
      <CausticRays />

      {/* The Seabed with Pipeline, Shipwreck and Debris */}
      <Seabed />

      {/* Periodic Acoustic Sonar Pulse */}
      <SonarPulse rovPosition={rovPositionRef} />

      {/* Autonomous Survey Vehicle / ROV */}
      <ROV pointer={pointer} rovPositionRef={rovPositionRef} />

      {/* Drifting Marine Snow & Particulate Particles */}
      <UnderwaterParticles count={260} isMobile={isMobile} />
    </Canvas>
  );
}
