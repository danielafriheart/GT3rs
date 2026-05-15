import React from 'react';
import Scene from './components/Scene.jsx';
import HeroOverlay from './components/HeroOverlay.jsx';
import ConfiguratorPanel from './components/ConfiguratorPanel.jsx';

export default function App() {
  return (
    <main
      className="relative w-screen h-screen overflow-hidden text-neutral-900"
      style={{ background: '#ececed' }}
    >
      <Scene />
      <HeroOverlay />
      <ConfiguratorPanel />
    </main>
  );
}
