import React, { useEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useConfigurator } from '../store/useConfigurator.js';
import { resolveAccentHex } from '../data/palette.js';

/**
 * GLTF-backed car renderer for the TwiXeR 992 GT3 RS model.
 *
 * Classification is done by *material name*. For each classified material
 * we ONLY change the colour — the model's original PBR values (metalness,
 * roughness, env map intensity, normal/spec maps) are left intact so the
 * model keeps the look the original author calibrated. The one exception
 * is the body's PBR tuning, which honours the swatch's `finish` so solid
 * paint shows its colour clearly while metallic paint keeps its sheen.
 */
function classifyMaterial(name) {
  const n = (name || '').toLowerCase();
  if (n.includes('carpaint')) return 'body';
  if (n.includes('wheels_chrome') || n.includes('gt3rs_black')) return 'wheel';
  if (n.includes('caliper')) return 'caliper';
  if (n.includes('carbon_roof')) return 'accent';
  return null;
}

// Body PBR is the only part we override — and only enough to let the chosen
// colour read through while keeping the paint looking sleek.
function tuneBody(mat, finish) {
  if (!mat) return;
  if (finish === 'metallic') {
    mat.metalness = 0.65;
    mat.roughness = 0.25;
  } else if (finish === 'pearl') {
    mat.metalness = 0.75;
    mat.roughness = 0.22;
  } else {
    // Solid — middle ground: visible colour but still reflective.
    mat.metalness = 0.5;
    mat.roughness = 0.3;
  }
}

export default function GltfCar({ url }) {
  const { scene } = useGLTF(url);

  const bodyId    = useConfigurator((s) => s.bodyId);
  const wheelId   = useConfigurator((s) => s.wheelId);
  const caliperId = useConfigurator((s) => s.caliperId);
  const accentId  = useConfigurator((s) => s.accentId);

  const body = useConfigurator.getState().getBody();
  const wheelHex   = useConfigurator.getState().getWheel().hex;
  const caliperHex = useConfigurator.getState().getCaliper().hex;
  const accentHex  = resolveAccentHex(accentId, body.hex);

  // Walk the scene once — clone every material so re-colours don't bleed
  // across meshes that originally shared a material, and tag each mesh
  // with its part.
  const classified = useMemo(() => {
    const out = [];
    scene.traverse((child) => {
      if (!child.isMesh) return;
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      const taggedMats = mats.map((m) => {
        if (!m) return { mat: m, part: null };
        const clone = m.clone();
        return { mat: clone, part: classifyMaterial(clone.name) };
      });
      child.material = Array.isArray(child.material)
        ? taggedMats.map((t) => t.mat)
        : taggedMats[0].mat;
      child.castShadow = true;
      child.receiveShadow = true;
      out.push({ mesh: child, parts: taggedMats });
    });
    return out;
  }, [scene]);

  // Re-colour whenever a selection changes. Only the body has its PBR
  // values tweaked; everything else keeps its original look.
  useEffect(() => {
    const palette = {
      body: body.hex,
      wheel: wheelHex,
      caliper: caliperHex,
      accent: accentHex,
    };
    for (const { parts } of classified) {
      for (const { mat, part } of parts) {
        if (!mat || !part) continue;
        const target = palette[part];
        if (!target) continue;
        if (mat.color) mat.color.set(target);
        if (part === 'body') tuneBody(mat, body.finish);
        mat.needsUpdate = true;
      }
    }
  }, [classified, bodyId, wheelId, caliperId, accentId, body.hex, body.finish, wheelHex, caliperHex, accentHex]);

  // Auto-fit: position at origin, sized so the car is ~4.4 units long, with
  // the lowest point of the bounding box (tyre contact patch) sitting on
  // the ground plane.
  const fit = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const desired = 4.4;
    const scale = desired / Math.max(size.x, size.z, 0.001);
    return {
      scale,
      offset: [-center.x * scale, -box.min.y * scale, -center.z * scale],
    };
  }, [scene]);

  return (
    <group position={fit.offset} scale={fit.scale}>
      <primitive object={scene} />
    </group>
  );
}
