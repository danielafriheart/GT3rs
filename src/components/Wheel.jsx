import React, { useMemo } from 'react';
import * as THREE from 'three';

/**
 * Procedural wheel: tire + brake disc + caliper + rim (4 styles).
 * Axle points along the X axis. Only used by the procedural fallback car.
 */
export default function Wheel({
  position,
  radius = 0.42,
  rimColor = '#1a1a1c',
  caliperColor = '#c8102e',
  style = 'forged-magnesium',
  side = 'right',
}) {
  const tireR = radius;
  const tireThickness = 0.14;
  const wheelWidth = 0.32;
  const rimR = radius - tireThickness;
  const discR = rimR * 0.78;

  const dir = side === 'right' ? -1 : 1;
  const caliperX = 0.07 * dir;

  return (
    <group position={position}>
      <mesh rotation={[0, Math.PI / 2, 0]} castShadow>
        <torusGeometry args={[tireR - tireThickness / 2, tireThickness, 24, 64]} />
        <meshStandardMaterial color="#0a0a0c" roughness={0.85} metalness={0.05} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[tireR, tireR, wheelWidth, 48, 1, true]} />
        <meshStandardMaterial color="#0a0a0c" roughness={0.95} metalness={0.05} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]} position={[caliperX * 1.5, 0, 0]} castShadow>
        <cylinderGeometry args={[discR, discR, 0.04, 48]} />
        <meshStandardMaterial color="#3a3a3e" metalness={0.85} roughness={0.35} />
      </mesh>
      <group position={[caliperX * 1.4, discR * 0.55, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.06, 0.18, 0.28]} />
          <meshStandardMaterial color={caliperColor} metalness={0.6} roughness={0.35} />
        </mesh>
      </group>
      <RimStyle style={style} rimR={rimR} rimColor={rimColor} side={side} />
    </group>
  );
}

function RimStyle({ style, rimR, rimColor, side }) {
  const offset = side === 'right' ? 0.17 : -0.17;
  const rimMaterial = useMemo(
    () => ({ color: rimColor, metalness: 0.78, roughness: 0.28 }),
    [rimColor]
  );

  if (style === 'turbo-aero') {
    return (
      <group position={[offset, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <mesh castShadow>
          <cylinderGeometry args={[rimR * 0.98, rimR * 0.98, 0.06, 48]} />
          <meshStandardMaterial {...rimMaterial} />
        </mesh>
        <mesh position={[0, 0.035, 0]} castShadow>
          <cylinderGeometry args={[rimR * 0.18, rimR * 0.18, 0.04, 24]} />
          <meshStandardMaterial color="#0a0a0c" metalness={0.6} roughness={0.4} />
        </mesh>
      </group>
    );
  }

  if (style === 'mesh') {
    return (
      <group position={[offset, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[rimR * 0.95, 0.025, 12, 64]} />
          <meshStandardMaterial {...rimMaterial} />
        </mesh>
        <mesh castShadow>
          <cylinderGeometry args={[rimR * 0.2, rimR * 0.2, 0.07, 24]} />
          <meshStandardMaterial {...rimMaterial} />
        </mesh>
        {Array.from({ length: 14 }).map((_, i) => {
          const a = (i / 14) * Math.PI * 2;
          return (
            <mesh key={i} rotation={[0, a, 0]} castShadow>
              <boxGeometry args={[rimR * 0.035, 0.04, rimR * 1.7]} />
              <meshStandardMaterial {...rimMaterial} />
            </mesh>
          );
        })}
      </group>
    );
  }

  if (style === 'twin-five') {
    return (
      <group position={[offset, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[rimR * 0.95, 0.03, 12, 64]} />
          <meshStandardMaterial {...rimMaterial} />
        </mesh>
        <mesh castShadow>
          <cylinderGeometry args={[rimR * 0.22, rimR * 0.22, 0.07, 24]} />
          <meshStandardMaterial {...rimMaterial} />
        </mesh>
        {Array.from({ length: 5 }).map((_, i) => {
          const baseA = (i / 5) * Math.PI * 2;
          return [-0.08, 0.08].map((shift, j) => (
            <mesh key={`${i}-${j}`} rotation={[0, baseA + shift, 0]} castShadow>
              <boxGeometry args={[rimR * 0.07, 0.05, rimR * 1.5]} />
              <meshStandardMaterial {...rimMaterial} />
            </mesh>
          ));
        })}
      </group>
    );
  }

  // forged-magnesium (default)
  return (
    <group position={[offset, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[rimR * 0.95, 0.035, 12, 64]} />
        <meshStandardMaterial {...rimMaterial} />
      </mesh>
      <mesh castShadow>
        <cylinderGeometry args={[rimR * 0.22, rimR * 0.22, 0.08, 24]} />
        <meshStandardMaterial {...rimMaterial} />
      </mesh>
      {Array.from({ length: 7 }).map((_, i) => {
        const a = (i / 7) * Math.PI * 2;
        return (
          <mesh key={i} rotation={[0, a, 0]} castShadow>
            <boxGeometry args={[rimR * 0.12, 0.05, rimR * 1.55]} />
            <meshStandardMaterial {...rimMaterial} />
          </mesh>
        );
      })}
    </group>
  );
}
