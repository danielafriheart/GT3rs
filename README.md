# GT3 RS

An interactive 3D configurator for the Porsche 911 GT3 RS — paint, wheels, brake calipers, and accents, all rendered in the browser with React Three Fiber. Built as a learning project to deepen my hands-on knowledge of Three.js and the R3F ecosystem.

[Live demo →](#) <!-- TODO: drop the deployed URL here -->

<!-- TODO: replace with a hero screenshot or GIF -->
![GT3 RS configurator hero shot](docs/hero.png)

## Features

- Real-time material recoloring on a full GLTF model — body paint, wheels, calipers, and accents update instantly.
- A floating, draggable customization panel with tabbed palettes and a collapsed pill state.
- Studio-style lighting and contact shadows that ground the car against a neutral backdrop.
- Multi-angle snapshot export — captures the configured car from several preset camera positions in one click.
- Orbit camera with auto-rotate, polar clamping, and constrained zoom so the car always looks composed.

## Tech stack

| Layer | Tools |
| --- | --- |
| Rendering | [Three.js](https://threejs.org/), [@react-three/fiber](https://github.com/pmndrs/react-three-fiber), [@react-three/drei](https://github.com/pmndrs/drei) |
| UI | React 18, Tailwind CSS, [Framer Motion](https://www.framer.com/motion/) |
| State | [Zustand](https://github.com/pmndrs/zustand) |
| Build | Vite |

## Implementation highlights

**Material classification on a third-party GLTF.** The model ships with dozens of materials authored by someone else. Instead of hand-editing the asset, the renderer walks the scene graph on mount, clones each material, and tags it by name (`carpaint`, `wheels_chrome`, `caliper`, `carbon_roof`). Selections then update only the relevant clones, leaving the original PBR setup (normals, roughness maps, env intensity) intact. This was the most interesting part to build — it's also the most reusable, since the same approach works for any GLTF with reasonably-named materials.

**Finish-aware paint tuning.** Body materials get a small PBR tweak based on the swatch's `finish` (solid / metallic / pearl), so a matte color reads clearly while a metallic keeps its sheen. Everything else keeps the model's calibrated values.

**Auto-fitting.** The car's bounding box is measured at load time and a scale + offset is applied so the tyres always sit on the ground plane and the body is sized consistently, regardless of what's in the source file.

**Studio look.** Two stacked `ContactShadows` give a crisp shadow under the tyres plus a wider, softer ambient falloff. The canvas, ground plane, and page background all share one neutral so there's no visible seam between the 3D scene and the surrounding UI.

**Snapshot rig.** A small headless component registers a capture function with a ref. Triggering it temporarily moves the camera through a set of preset angles, renders each, and exports a single combined PNG — handy for sharing builds or producing portfolio shots.

## Challenges

- **Working around a third-party model.** No control over the source meant I had to lean on naming conventions and material cloning rather than mesh-by-mesh edits. Got me comfortable with traversing scene graphs in Three.js.
- **Lighting balance.** Real car configurators look great because of studio HDRIs and carefully tuned exposure. Getting close on a plain page took several passes — environment intensity, tone mapping, contact shadow opacity, and directional rim lights all interact.
- **Avoiding a placeholder flash.** An earlier version showed a procedural stand-in while the GLTF streamed in, which looked toy-like. The Suspense fallback was swapped for a quiet loading indicator so the first thing the user sees is the real car.

## Running locally

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

## Credits

3D model: *"Porsche GT3 RS"* by [Black Snow](https://sketchfab.com/BlackSnow02) on Sketchfab, licensed under [CC-BY-4.0](http://creativecommons.org/licenses/by/4.0/).
# GT3rs
