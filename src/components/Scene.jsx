import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  OrbitControls,
  Environment,
  ContactShadows,
  PerspectiveCamera,
  Html,
} from '@react-three/drei';
import * as THREE from 'three';
import Car from './Car.jsx';
import SnapshotRig from './SnapshotRig.jsx';

function Loader() {
  return (
    <Html center>
      <div className="text-neutral-500 text-[10px] tracking-[0.3em] uppercase animate-pulse">
        Loading
      </div>
    </Html>
  );
}

export default function Scene() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{
        antialias: true,
        powerPreference: 'high-performance',
        // Required so offscreen render targets and toDataURL fallbacks work
        // reliably across browsers.
        preserveDrawingBuffer: true,
      }}
      onCreated={({ gl, scene }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        // Match the studio backdrop set on <main> for a seamless background.
        scene.background = new THREE.Color('#ececed');
      }}
      className="!fixed inset-0"
    >
      <PerspectiveCamera makeDefault position={[6.2, 2.4, 6.8]} fov={30} />

      <ambientLight intensity={0.9} />
      <directionalLight
        position={[6, 9, 4]}
        intensity={1.4}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />
      <directionalLight position={[-6, 4, -4]} intensity={0.55} color="#dfeaff" />
      <directionalLight position={[0, 3, -8]} intensity={0.35} color="#fff2e0" />

      <Suspense fallback={<Loader />}>
        <Environment preset="city" environmentIntensity={0.7} />
        <Car />
      </Suspense>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#ececed" metalness={0.0} roughness={1.0} />
      </mesh>

      {/* Soft grounding shadow directly under the car */}
      <ContactShadows
        position={[0, 0.002, 0]}
        opacity={0.85}
        scale={12}
        blur={2.2}
        far={4.5}
        resolution={2048}
        color="#000"
      />
      {/* Wider, fainter ambient shadow for studio-style falloff */}
      <ContactShadows
        position={[0, 0.001, 0]}
        opacity={0.35}
        scale={22}
        blur={4.5}
        far={6}
        resolution={1024}
        color="#000"
      />

      <OrbitControls
        enablePan={false}
        enableZoom
        minDistance={4}
        maxDistance={14}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={Math.PI / 2.05}
        autoRotate
        autoRotateSpeed={0.35}
        dampingFactor={0.08}
        target={[0, 0.55, 0]}
      />

      {/* Registers the snapshot function; renders nothing. */}
      <SnapshotRig />
    </Canvas>
  );
}
