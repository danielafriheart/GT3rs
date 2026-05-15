import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { snapshotRef } from '../snapshot.js';
import { useConfigurator } from '../store/useConfigurator.js';
import { BODY_COLORS } from '../data/palette.js';

/**
 * Lives inside the R3F Canvas. Registers an async `takeSnapshot()` function
 * with a module-level ref so the configurator panel can trigger it.
 *
 * Strategy: render the scene into an offscreen MSAA render target with a
 * temporary camera at each preset angle, then read pixels and composite the
 * resulting images into one PNG. The visible canvas is never touched, so
 * there's no flicker in the live view.
 *
 * Framing uses different distance/FOV per angle so each tile is tightly
 * cropped around the car.
 */
export default function SnapshotRig() {
  const { gl, scene } = useThree();

  useEffect(() => {
    // Each angle: where the camera sits, what it looks at, and how wide its
    // lens is. Tighter FOV + closer distance = car fills more of the tile.
    const ANGLES = [
      { name: 'Front Three-Quarter', pos: [4.6, 1.7, 4.8],  target: [0, 0.55, 0], fov: 22 },
      { name: 'Rear Three-Quarter',  pos: [-4.6, 1.7, -4.8], target: [0, 0.55, 0], fov: 22 },
      { name: 'Driver Side',         pos: [6.4, 0.85, 0.0],  target: [0, 0.55, 0], fov: 24 },
      { name: 'Passenger Side',      pos: [-6.4, 0.85, 0.0], target: [0, 0.55, 0], fov: 24 },
      { name: 'Top Down',            pos: [0, 6.0, 0.001],   target: [0, 0,    0], fov: 32 },
      { name: 'Rear',                pos: [0, 0.95, -5.5],   target: [0, 0.55, 0], fov: 26 },
    ];

    const SHOT_W = 1200;
    const SHOT_H = 750;

    snapshotRef.current = async () => {
      // MSAA render target — antialiased snapshots offscreen.
      const target = new THREE.WebGLRenderTarget(SHOT_W, SHOT_H, {
        type: THREE.UnsignedByteType,
        format: THREE.RGBAFormat,
        samples: 4,
      });

      const tmpCam = new THREE.PerspectiveCamera(28, SHOT_W / SHOT_H, 0.1, 200);

      // Save renderer state so we can restore it once we're done.
      const previousRenderTarget = gl.getRenderTarget();
      const previousClearAlpha = gl.getClearAlpha();
      const previousClearColor = new THREE.Color();
      gl.getClearColor(previousClearColor);
      const previousBackground = scene.background;

      // Match the live scene's background colour while shooting.
      gl.setClearColor(new THREE.Color('#f4f4f5'), 1);
      scene.background = new THREE.Color('#f4f4f5');

      const shots = [];
      try {
        for (const angle of ANGLES) {
          tmpCam.fov = angle.fov;
          tmpCam.aspect = SHOT_W / SHOT_H;
          tmpCam.position.set(...angle.pos);
          tmpCam.lookAt(new THREE.Vector3(...angle.target));
          tmpCam.updateProjectionMatrix();

          gl.setRenderTarget(target);
          gl.clear();
          gl.render(scene, tmpCam);

          // Read raw pixels and copy into a 2D canvas with a Y-flip.
          const raw = new Uint8Array(SHOT_W * SHOT_H * 4);
          gl.readRenderTargetPixels(target, 0, 0, SHOT_W, SHOT_H, raw);

          const tile = document.createElement('canvas');
          tile.width = SHOT_W;
          tile.height = SHOT_H;
          const tctx = tile.getContext('2d');
          const imageData = tctx.createImageData(SHOT_W, SHOT_H);
          const rowBytes = SHOT_W * 4;
          for (let y = 0; y < SHOT_H; y++) {
            const srcStart = y * rowBytes;
            const dstStart = (SHOT_H - 1 - y) * rowBytes;
            imageData.data.set(
              raw.subarray(srcStart, srcStart + rowBytes),
              dstStart
            );
          }
          tctx.putImageData(imageData, 0, 0);
          shots.push({ canvas: tile, label: angle.name });
        }
      } finally {
        // Restore renderer state no matter what.
        gl.setRenderTarget(previousRenderTarget);
        gl.setClearColor(previousClearColor, previousClearAlpha);
        scene.background = previousBackground;
        target.dispose();
      }

      const collageDataUrl = composeCollage(shots);
      triggerDownload(collageDataUrl);
    };

    return () => {
      snapshotRef.current = null;
    };
  }, [gl, scene]);

  return null;
}

/* ───────────────────────── Collage composer ───────────────────────── */

function composeCollage(shots) {
  const cols = 2;
  const rows = Math.ceil(shots.length / cols);
  const cellW = 900;
  const cellH = 562; // ≈ 1200×750 aspect ratio (0.625)
  const gap = 18;
  const padX = 36;
  const padTop = 110;
  const padBottom = 60;

  const width = padX * 2 + cols * cellW + (cols - 1) * gap;
  const height = padTop + padBottom + rows * cellH + (rows - 1) * gap;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Header
  ctx.fillStyle = '#18181b';
  ctx.font = '800 36px Inter, system-ui, sans-serif';
  ctx.textBaseline = 'top';
  ctx.fillText('Porsche 911 GT3 RS', padX, 32);

  ctx.font = '500 14px Inter, system-ui, sans-serif';
  ctx.fillStyle = '#71717a';
  const dateStr = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  ctx.fillText(`Custom configuration · ${dateStr}`, padX, 76);

  // Tiles
  shots.forEach((s, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = padX + col * (cellW + gap);
    const y = padTop + row * (cellH + gap);

    ctx.fillStyle = '#f4f4f5';
    roundRect(ctx, x, y, cellW, cellH, 14);
    ctx.fill();

    ctx.save();
    roundRect(ctx, x, y, cellW, cellH, 14);
    ctx.clip();
    drawCover(ctx, s.canvas, x, y, cellW, cellH);
    ctx.restore();

    // Label chip
    ctx.font = '600 12px Inter, system-ui, sans-serif';
    const labelText = s.label.toUpperCase();
    const labelW = ctx.measureText(labelText).width + 18;
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    roundRect(ctx, x + 12, y + cellH - 30, labelW, 22, 11);
    ctx.fill();
    ctx.fillStyle = '#18181b';
    ctx.fillText(labelText, x + 21, y + cellH - 22);
  });

  // Footer
  ctx.font = '500 11px Inter, system-ui, sans-serif';
  ctx.fillStyle = '#a1a1aa';
  ctx.fillText('Generated by GT3 RS Configurator', padX, height - 38);

  return canvas.toDataURL('image/png');
}

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawCover(ctx, img, dx, dy, dw, dh) {
  const iw = img.width;
  const ih = img.height;
  const scale = Math.max(dw / iw, dh / ih);
  const w = iw * scale;
  const h = ih * scale;
  const ox = dx + (dw - w) / 2;
  const oy = dy + (dh - h) / 2;
  ctx.drawImage(img, ox, oy, w, h);
}

function triggerDownload(dataUrl) {
  const a = document.createElement('a');
  a.href = dataUrl;
  const stamp = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\..+/, '');
  const body = BODY_COLORS.find(
    (c) => c.id === useConfigurator.getState().bodyId
  );
  const slug = body?.id ?? 'gt3rs';
  a.download = `gt3rs-${slug}-${stamp}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
