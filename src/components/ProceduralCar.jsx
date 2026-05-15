import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { useConfigurator } from '../store/useConfigurator.js';
import { resolveAccentHex } from '../data/palette.js';
import Wheel from './Wheel.jsx';

/**
 * Stylized GT3 RS built from primitives. Used as a fallback if the real GLTF
 * model isn't available. All paint surfaces respond to the configurator.
 */
export default function ProceduralCar() {
  const body = useConfigurator((s) => s.bodyId);
  const wheel = useConfigurator((s) => s.wheelId);
  const caliper = useConfigurator((s) => s.caliperId);
  const accent = useConfigurator((s) => s.accentId);
  const rimStyle = useConfigurator((s) => s.rimStyleId);

  const bodyHex = useConfigurator.getState().getBody().hex;
  const wheelHex = useConfigurator.getState().getWheel().hex;
  const caliperHex = useConfigurator.getState().getCaliper().hex;
  const accentHex = resolveAccentHex(accent, bodyHex);

  void body; void wheel; void caliper; void accent; void rimStyle;

  const bodyMaterialProps = useMemo(
    () => ({ color: new THREE.Color(bodyHex), metalness: 0.65, roughness: 0.32, envMapIntensity: 1.1 }),
    [bodyHex]
  );

  const accentMaterialProps = useMemo(() => {
    const accentObj = useConfigurator.getState().getAccent();
    if (accentObj.id === 'carbon') {
      return { color: new THREE.Color('#1a1a1e'), metalness: 0.55, roughness: 0.45, envMapIntensity: 1.0 };
    }
    return { color: new THREE.Color(accentHex), metalness: 0.55, roughness: 0.4, envMapIntensity: 1.0 };
  }, [accentHex, accent]);

  const root = useRef();
  useFrame((state) => {
    if (!root.current) return;
    const t = state.clock.getElapsedTime();
    root.current.position.y = 0.02 + Math.sin(t * 0.6) * 0.005;
  });

  const wheelbase = 2.6;
  const trackFront = 1.7;
  const trackRear = 1.82;
  const wheelRadius = 0.42;

  return (
    <group ref={root}>
      {/* Lower body slab */}
      <RoundedBox args={[2.0, 0.48, 4.4]} radius={0.18} smoothness={6} position={[0, 0.55, 0]} castShadow receiveShadow>
        <meshStandardMaterial {...bodyMaterialProps} />
      </RoundedBox>
      {/* Rear haunches */}
      <RoundedBox args={[2.18, 0.52, 1.8]} radius={0.22} smoothness={6} position={[0, 0.58, -1.1]} castShadow receiveShadow>
        <meshStandardMaterial {...bodyMaterialProps} />
      </RoundedBox>
      {/* Front fenders */}
      <RoundedBox args={[2.05, 0.46, 1.6]} radius={0.2} smoothness={6} position={[0, 0.6, 1.1]} castShadow receiveShadow>
        <meshStandardMaterial {...bodyMaterialProps} />
      </RoundedBox>
      {/* Roof */}
      <RoundedBox args={[1.5, 0.18, 1.85]} radius={0.12} smoothness={6} position={[0, 1.34, 0.02]} castShadow>
        <meshStandardMaterial {...bodyMaterialProps} />
      </RoundedBox>
      {/* Greenhouse */}
      <mesh position={[0, 1.08, 0.05]} castShadow>
        <boxGeometry args={[1.55, 0.5, 2.0]} />
        <meshStandardMaterial {...bodyMaterialProps} />
      </mesh>
      {/* Hood */}
      <RoundedBox args={[1.8, 0.08, 1.2]} radius={0.06} smoothness={6} position={[0, 0.86, 1.25]} castShadow>
        <meshStandardMaterial {...bodyMaterialProps} />
      </RoundedBox>
      {/* Engine deck bulge */}
      <RoundedBox args={[1.6, 0.18, 1.1]} radius={0.1} smoothness={6} position={[0, 0.92, -1.2]} castShadow>
        <meshStandardMaterial {...bodyMaterialProps} />
      </RoundedBox>

      {/* Glass */}
      <mesh position={[0, 1.18, 0.95]} rotation={[-0.55, 0, 0]}>
        <planeGeometry args={[1.45, 0.85]} />
        <meshPhysicalMaterial color="#0a0e14" metalness={0.2} roughness={0.05} transmission={0.35} transparent opacity={0.65} />
      </mesh>
      <mesh position={[0, 1.18, -0.95]} rotation={[0.6, 0, 0]}>
        <planeGeometry args={[1.45, 0.82]} />
        <meshPhysicalMaterial color="#0a0e14" metalness={0.2} roughness={0.05} transmission={0.3} transparent opacity={0.6} />
      </mesh>

      {/* Accents */}
      <RoundedBox args={[2.05, 0.06, 0.25]} radius={0.03} smoothness={4} position={[0, 0.32, 2.2]} castShadow>
        <meshStandardMaterial {...accentMaterialProps} />
      </RoundedBox>
      {[-1, 1].map((side) => (
        <RoundedBox key={`skirt-${side}`} args={[0.12, 0.16, 2.6]} radius={0.04} smoothness={4} position={[side * 1.02, 0.36, 0]} castShadow>
          <meshStandardMaterial {...accentMaterialProps} />
        </RoundedBox>
      ))}
      <RoundedBox args={[2.0, 0.18, 0.4]} radius={0.04} smoothness={4} position={[0, 0.35, -2.15]} castShadow>
        <meshStandardMaterial {...accentMaterialProps} />
      </RoundedBox>

      {/* Swan-neck wing */}
      {[-0.55, 0.55].map((x) => (
        <mesh key={`pillar-${x}`} position={[x, 1.35, -1.7]} castShadow>
          <boxGeometry args={[0.06, 0.45, 0.25]} />
          <meshStandardMaterial color="#0a0a0c" metalness={0.5} roughness={0.4} />
        </mesh>
      ))}
      <RoundedBox args={[2.05, 0.06, 0.55]} radius={0.02} smoothness={4} position={[0, 1.6, -1.7]} castShadow>
        <meshStandardMaterial {...accentMaterialProps} />
      </RoundedBox>

      {/* Wheels */}
      <Wheel position={[trackFront / 2,  wheelRadius,  wheelbase / 2]} radius={wheelRadius} rimColor={wheelHex} caliperColor={caliperHex} style={rimStyle} side="right" />
      <Wheel position={[-trackFront / 2, wheelRadius,  wheelbase / 2]} radius={wheelRadius} rimColor={wheelHex} caliperColor={caliperHex} style={rimStyle} side="left"  />
      <Wheel position={[trackRear / 2,   wheelRadius, -wheelbase / 2]} radius={wheelRadius} rimColor={wheelHex} caliperColor={caliperHex} style={rimStyle} side="right" />
      <Wheel position={[-trackRear / 2,  wheelRadius, -wheelbase / 2]} radius={wheelRadius} rimColor={wheelHex} caliperColor={caliperHex} style={rimStyle} side="left"  />
    </group>
  );
}
