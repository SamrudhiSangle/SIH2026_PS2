import React, { useMemo } from 'react';
import * as THREE from 'three';

// Realistic deep-ocean survey seabed based directly on reference image:
// - Sand rippled seafloor with subtle undulations
// - Large industrial subsea pipeline with joint collars
// - Sunken wooden shipwreck with mast and hull ribs on the right
// - Scattered rocks, anchor, and debris
export default function Seabed() {
  // Procedural sand ripples and seabed undulation
  const { geometry: terrainGeo, sandTexture } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(36, 26, 64, 48);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      // Subtle sand ripple ripples + mound elevation on the right
      const ripple = Math.sin(x * 3.5 + y * 0.8) * 0.04 + Math.sin(x * 1.2) * 0.08;
      // Slight rise towards the right and back (where rocks and shipwreck sit)
      const mound = (x > 1 ? (x - 1) * 0.12 : 0) + (y > 2 ? (y - 2) * 0.08 : 0);
      pos.setZ(i, ripple + mound);
    }
    geo.computeVertexNormals();

    // Procedural sand normal canvas texture
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#101a2c';
    ctx.fillRect(0, 0, 256, 256);
    // Draw sand ripple bands
    for (let y = 0; y < 256; y += 4) {
      const alpha = 0.08 + Math.sin(y * 0.35) * 0.06;
      ctx.fillStyle = `rgba(32, 60, 95, ${alpha})`;
      ctx.fillRect(0, y, 256, 2);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(16, 12);

    return { geometry: geo, sandTexture: tex };
  }, []);

  return (
    <group position={[0, -2.8, -1.5]}>
      {/* Main Ocean Floor Terrain */}
      <mesh
        geometry={terrainGeo}
        rotation={[-Math.PI / 2 + 0.12, 0, 0]}
        receiveShadow
      >
        <meshStandardMaterial
          color="#0d1b2a"
          roughness={0.92}
          metalness={0.08}
          map={sandTexture}
        />
      </mesh>

      {/* ======================================================== */}
      {/* SUBSEA INDUSTRIAL PIPELINE (Left / Foreground)           */}
      {/* ======================================================== */}
      <group position={[-2.2, 0.22, 1.2]} rotation={[0.06, 0.42, -0.04]}>
        {/* Main Pipe Cylinders */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.26, 0.26, 7.5, 24]} />
          <meshStandardMaterial
            color="#2a2522" // Rusted/patinated subsea iron
            roughness={0.88}
            metalness={0.3}
          />
        </mesh>

        {/* Flange Open Bell Mouth at front */}
        <mesh position={[-3.75, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.34, 0.27, 0.35, 24]} />
          <meshStandardMaterial color="#1f1c1a" roughness={0.9} metalness={0.35} />
        </mesh>
        <mesh position={[-3.92, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.34, 0.34, 0.06, 24]} />
          <meshStandardMaterial color="#352e29" roughness={0.85} metalness={0.4} />
        </mesh>

        {/* Pipe Joint Collars */}
        {[-1.8, 0.2, 2.2].map((xOffset, idx) => (
          <mesh key={idx} position={[xOffset, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.31, 0.31, 0.18, 20]} />
            <meshStandardMaterial color="#3a3028" roughness={0.85} metalness={0.35} />
          </mesh>
        ))}

        {/* Concrete Saddle / Anode Weights under pipe */}
        <mesh position={[-0.8, -0.22, 0]}>
          <boxGeometry args={[0.5, 0.28, 0.85]} />
          <meshStandardMaterial color="#1a202c" roughness={0.95} />
        </mesh>
      </group>

      {/* ======================================================== */}
      {/* SUNKEN WOODEN SHIPWRECK (Right Seafloor)                 */}
      {/* ======================================================== */}
      <group position={[4.5, 0.45, -2.8]} rotation={[-0.12, -0.65, 0.18]}>
        {/* Ship Hull Body */}
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[3.8, 1.1, 1.4]} />
          <meshStandardMaterial
            color="#131922" // Weathered dark encrusted timber
            roughness={0.95}
            metalness={0.05}
          />
        </mesh>

        {/* Pointed Bow / Keel Nose */}
        <mesh position={[-2.1, 0.35, 0]} rotation={[0, 0, 0.4]}>
          <coneGeometry args={[0.72, 1.2, 4]} />
          <meshStandardMaterial color="#0f151c" roughness={0.95} />
        </mesh>

        {/* Deck Cabin / Wheelhouse */}
        <mesh position={[0.7, 0.95, 0]}>
          <boxGeometry args={[1.2, 0.65, 1.0]} />
          <meshStandardMaterial color="#18202b" roughness={0.9} />
        </mesh>

        {/* Tall Wooden Mast (Tilted backwards into the water column) */}
        <group position={[-0.3, 0.8, 0]} rotation={[0.08, 0, -0.32]}>
          <mesh position={[0, 2.2, 0]}>
            <cylinderGeometry args={[0.05, 0.08, 4.4, 12]} />
            <meshStandardMaterial color="#1b2430" roughness={0.9} />
          </mesh>
          {/* Mast Crossbar */}
          <mesh position={[0, 3.2, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.035, 0.035, 1.5, 8]} />
            <meshStandardMaterial color="#18202b" roughness={0.9} />
          </mesh>
        </group>

        {/* Exposed Hull Ribs */}
        {[-1.2, -0.6, 0.0, 0.6, 1.2].map((xOffset, idx) => (
          <mesh key={idx} position={[xOffset, 0.85, 0.68]}>
            <boxGeometry args={[0.08, 0.45, 0.08]} />
            <meshStandardMaterial color="#0e141c" roughness={0.95} />
          </mesh>
        ))}
      </group>

      {/* ======================================================== */}
      {/* SCATTERED MARINE ARTIFACTS: ROCKS, ANCHOR & DEBRIS       */}
      {/* ======================================================== */}
      {/* Old Rusted Marine Anchor */}
      <group position={[0.6, 0.05, 0.4]} rotation={[0.4, 0.2, 0.8]}>
        <mesh>
          <cylinderGeometry args={[0.04, 0.04, 1.1, 10]} />
          <meshStandardMaterial color="#2c221e" roughness={0.9} metalness={0.3} />
        </mesh>
        {/* Anchor Ring */}
        <mesh position={[0, 0.55, 0]}>
          <torusGeometry args={[0.1, 0.03, 8, 16]} />
          <meshStandardMaterial color="#2c221e" roughness={0.9} metalness={0.3} />
        </mesh>
        {/* Anchor Flukes */}
        <mesh position={[0, -0.45, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.32, 0.04, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#2c221e" roughness={0.9} metalness={0.3} />
        </mesh>
      </group>

      {/* Discarded Subsea Tire / Ring */}
      <mesh position={[1.4, 0.06, 0.2]} rotation={[Math.PI / 2, 0, 0.4]}>
        <torusGeometry args={[0.22, 0.08, 12, 24]} />
        <meshStandardMaterial color="#12161c" roughness={0.95} />
      </mesh>

      {/* Seabed Boulders & Rock Outcrops on the right */}
      {[
        { pos: [3.2, 0.15, -1.2], scale: [0.65, 0.35, 0.55], rot: [0.2, 0.4, 0.1] },
        { pos: [2.6, 0.1, -0.6], scale: [0.45, 0.25, 0.4], rot: [0.1, -0.5, 0.3] },
        { pos: [4.1, 0.3, -0.8], scale: [0.85, 0.45, 0.75], rot: [-0.2, 0.8, 0.2] },
        { pos: [5.2, 0.2, -2.1], scale: [0.75, 0.5, 0.6], rot: [0.3, -0.2, 0.1] },
        { pos: [-0.5, 0.08, 0.8], scale: [0.35, 0.18, 0.3], rot: [0.4, 0.1, -0.2] },
        { pos: [-3.8, 0.12, -0.5], scale: [0.55, 0.28, 0.45], rot: [-0.1, 0.6, 0.2] }
      ].map((rock, i) => (
        <mesh key={i} position={rock.pos} rotation={rock.rot} scale={rock.scale}>
          <dodecahedronGeometry args={[1, 1]} />
          <meshStandardMaterial
            color="#141d28"
            roughness={0.95}
            metalness={0.05}
          />
        </mesh>
      ))}
    </group>
  );
}
