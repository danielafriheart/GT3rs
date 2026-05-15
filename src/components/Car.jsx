import React, { Suspense } from 'react';

// Real model path. The GLTF references scene.bin + textures/ at the same level.
const MODEL_URL = '/models/gt3rs/scene.gltf';

const GltfCar = React.lazy(() => import('./GltfCar.jsx'));

export default function Car() {
  // No placeholder model — render nothing while the GLTF streams in.
  // Scene.jsx's <Suspense> wrapper shows the "Loading" indicator instead.
  return (
    <Suspense fallback={null}>
      <GltfCar url={MODEL_URL} />
    </Suspense>
  );
}
