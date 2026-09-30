import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import SonarBeam from './SonarBeam';

// Autonomous Underwater Survey Vehicle (AUV / Towfish / ROV)
// Matches exact visual characteristics of reference image:
// - Hydrodynamic yellow/canary casing with dark lower sensor chassis
// - Stabilizer fins, rudder, propeller duct, and upward tow cable
// - Smooth cursor following with heavy underwater inertia and rotation damping
export default function ROV({ pointer, rovPositionRef }) {
  const groupRef = useRef();

  // Internal state for smooth inertia and rotation
  const stateRef = useRef({
    currentPos: new THREE.Vector3(-0.4, 0.9, 0.2),
    targetPos: new THREE.Vector3(-0.4, 0.9, 0.2),
    currentRot: new THREE.Euler(0, 0, 0),
    targetRot: new THREE.Euler(0, 0, 0),
    prevPos: new THREE.Vector3(-0.4, 0.9, 0.2),
    velocity: new THREE.Vector3(0, 0, 0)
  });

  // Stencil texture for "HL-000416 · SONAROPS" side marking
  const stencilTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 512, 128);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 36px "JetBrains Mono", monospace';
    ctx.letterSpacing = '4px';
    ctx.fillText('HL-000416', 40, 56);
    ctx.font = '22px "JetBrains Mono", monospace';
    ctx.fillStyle = '#1e293b';
    ctx.fillText('SONAROPS · SURVEY-RX', 40, 96);
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    const st = stateRef.current;

    // 1. Map normalized pointer (-1 to 1) to bounded 3D target coordinates
    // Constrained inside viewport bounds
    const targetX = THREE.MathUtils.clamp(pointer.current.x * 3.8, -3.2, 3.2);
    const targetY = THREE.MathUtils.clamp(pointer.current.y * 1.8 + 0.6, -0.6, 1.8);
    const targetZ = THREE.MathUtils.clamp(pointer.current.y * -0.6 + 0.2, -0.8, 1.0);

    // 2. Add autonomous buoyancy & current drift (subconscious floating motion)
    const buoyancyY = Math.sin(time * 1.4) * 0.045;
    const driftX = Math.cos(time * 0.9) * 0.035;
    const microSwayZ = Math.sin(time * 1.1) * 0.02;

    st.targetPos.set(targetX + driftX, targetY + buoyancyY, targetZ + microSwayZ);

    // 3. Smooth underwater inertia (heavy damping lag)
    // Low factor (1.6 * delta) gives a distinct feeling of underwater resistance
    const lerpSpeed = Math.min(1, delta * 1.8);
    st.currentPos.lerp(st.targetPos, lerpSpeed);

    // Update external ref so SonarPulse can track ROV position
    if (rovPositionRef) {
      rovPositionRef.current.copy(st.currentPos);
    }

    // 4. Calculate movement delta for banking & rotation
    const dx = st.currentPos.x - st.prevPos.x;
    const dy = st.currentPos.y - st.prevPos.y;
    st.prevPos.copy(st.currentPos);

    // 5. Constrained rotation towards movement direction:
    // Yaw: ±12° (±0.21 rad)
    // Pitch: ±6° (±0.10 rad)
    // Roll: ±3° (±0.05 rad)
    const targetYaw = THREE.MathUtils.clamp(dx * 4.2, -0.21, 0.21);
    const targetPitch = THREE.MathUtils.clamp(-dy * 3.5, -0.10, 0.10);
    const targetRoll = THREE.MathUtils.clamp(-dx * 1.8, -0.05, 0.05);

    // Autonomous micro-rotation in water
    const autoPitch = Math.sin(time * 1.3) * 0.015;
    const autoRoll = Math.cos(time * 1.0) * 0.012;

    st.targetRot.set(targetPitch + autoPitch, targetYaw, targetRoll + autoRoll);

    // Smoothly interpolate rotations
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, st.targetRot.x, delta * 2.2);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, st.targetRot.y, delta * 2.2);
    groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, st.targetRot.z, delta * 2.2);

    // Apply interpolated position
    groupRef.current.position.copy(st.currentPos);
  });

  return (
    <group ref={groupRef} position={[-0.4, 0.9, 0.2]}>
      {/* ======================================================== */}
      {/* ROV MAIN BODY CASING (Scientific Canary Yellow)          */}
      {/* ======================================================== */}
      {/* Upper Torpedo / Hydrodynamic Shell */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <capsuleGeometry args={[0.34, 1.7, 16, 24]} />
        {/* Rotate capsule horizontally along Z-axis */}
        <meshStandardMaterial
          color="#f59e0b" // Rich scientific maritime yellow
          roughness={0.35}
          metalness={0.15}
        />
      </mesh>

      {/* Dark Lower Sensor Chassis / Bathymetric Keel */}
      <mesh position={[0, -0.14, 0]}>
        <boxGeometry args={[0.54, 0.24, 1.8]} />
        <meshStandardMaterial
          color="#0f172a" // Deep naval charcoal/black
          roughness={0.65}
          metalness={0.4}
        />
      </mesh>

      {/* Acoustic Side-Scan Transducer Array Panels (Left & Right) */}
      <mesh position={[-0.28, -0.12, 0]}>
        <boxGeometry args={[0.04, 0.12, 1.1]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0.28, -0.12, 0]}>
        <boxGeometry args={[0.04, 0.12, 1.1]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Rounded Dome Nose / Forward Sonar Pinger */}
      <mesh position={[0, 0.04, 1.05]} rotation={[Math.PI / 2, 0, 0]}>
        <sphereGeometry args={[0.3, 20, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.5} />
      </mesh>

      {/* Technical Stencil Decal Panels (Sides) */}
      <mesh position={[0.35, 0.08, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.2, 0.3]} />
        <meshBasicMaterial map={stencilTexture} transparent opacity={0.88} />
      </mesh>
      <mesh position={[-0.35, 0.08, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[1.2, 0.3]} />
        <meshBasicMaterial map={stencilTexture} transparent opacity={0.88} />
      </mesh>

      {/* ======================================================== */}
      {/* TAIL ASSEMBLY: STABILIZERS, RUDDER & THRUSTER SHROUD      */}
      {/* ======================================================== */}
      {/* Vertical Rudder Fin (Top) */}
      <mesh position={[0, 0.35, -0.92]}>
        <boxGeometry args={[0.04, 0.42, 0.48]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.4} />
      </mesh>
      {/* Vertical Rudder Trim (Bottom) */}
      <mesh position={[0, -0.28, -0.92]}>
        <boxGeometry args={[0.04, 0.22, 0.38]} />
        <meshStandardMaterial color="#0f172a" roughness={0.6} />
      </mesh>

      {/* Horizontal Stabilizer Wings (Left & Right) */}
      <mesh position={[-0.38, 0.05, -0.92]}>
        <boxGeometry args={[0.5, 0.035, 0.42]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.4} />
      </mesh>
      <mesh position={[0.38, 0.05, -0.92]}>
        <boxGeometry args={[0.5, 0.035, 0.42]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.4} />
      </mesh>

      {/* Tail Propeller Shroud Duct */}
      <mesh position={[0, 0.02, -1.25]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.22, 16, 1, true]} />
        <meshStandardMaterial color="#0f172a" roughness={0.5} metalness={0.6} />
      </mesh>
      {/* Propeller Hub */}
      <mesh position={[0, 0.02, -1.25]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.28, 8]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* ======================================================== */}
      {/* TOW CABLE / UMBILICAL (Extending upward into water)      */}
      {/* ======================================================== */}
      <mesh position={[0, 0.38, -0.25]}>
        <cylinderGeometry args={[0.02, 0.025, 0.22, 8]} />
        <meshStandardMaterial color="#334155" metalness={0.7} />
      </mesh>
      {/* Tow Cable line angled back toward vessel surface */}
      <mesh position={[-0.8, 1.4, -1.4]} rotation={[0.5, 0.3, -0.45]}>
        <cylinderGeometry args={[0.012, 0.012, 3.2, 6]} />
        <meshStandardMaterial color="#475569" roughness={0.8} />
      </mesh>

      {/* Navigation Lights (Port Red, Starboard Green, Mast White) */}
      {/* Port Light (Red) */}
      <mesh position={[-0.32, 0.12, 0.4]}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
      {/* Starboard Light (Green) */}
      <mesh position={[0.32, 0.12, 0.4]}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshBasicMaterial color="#10b981" />
      </mesh>
      {/* Mast Antenna Light (Cyan/White) */}
      <mesh position={[0, 0.52, -0.25]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial color="#7dd3fc" />
      </mesh>

      {/* ======================================================== */}
      {/* DUAL SONAR SEARCH BEAMS (Left & Right Volumetric Sweeps) */}
      {/* ======================================================== */}
      <SonarBeam leftBeam={true} />
      <SonarBeam leftBeam={false} />
    </group>
  );
}
