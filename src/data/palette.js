// Curated Porsche-style color palette for the GT3 RS configurator.

export const BODY_COLORS = [
  { id: 'white',         name: 'Carrara White',      hex: '#ececec', finish: 'solid'    },
  { id: 'gt-silver',     name: 'GT Silver Metallic', hex: '#a7adb3', finish: 'metallic' },
  { id: 'chalk',         name: 'Chalk',              hex: '#cfcec7', finish: 'solid'    },
  { id: 'guards-red',    name: 'Guards Red',         hex: '#c8102e', finish: 'solid'    },
  { id: 'shark-blue',    name: 'Shark Blue',         hex: '#3a7ed1', finish: 'metallic' },
  { id: 'python-green',  name: 'Python Green',       hex: '#5d7a2a', finish: 'metallic' },
  { id: 'racing-yellow', name: 'Racing Yellow',      hex: '#f6d000', finish: 'solid'    },
  { id: 'gentian-blue',  name: 'Gentian Blue',       hex: '#1f3a93', finish: 'metallic' },
  { id: 'black',         name: 'Jet Black Metallic', hex: '#0e0e10', finish: 'metallic' },
  { id: 'lava-orange',   name: 'Lava Orange',        hex: '#e85412', finish: 'solid'    },
  { id: 'gulf-blue',     name: 'Gulf Blue',          hex: '#5fb3d4', finish: 'solid'    },
  { id: 'crayon',        name: 'Crayon',             hex: '#7c7d7a', finish: 'solid'    },
];

export const WHEEL_COLORS = [
  { id: 'satin-black',   name: 'Satin Black',        hex: '#1a1a1c', finish: 'metallic' },
  { id: 'silver',        name: 'Brilliant Silver',   hex: '#c4c6c8', finish: 'metallic' },
  { id: 'white-gold',    name: 'White Gold',         hex: '#d6c79a', finish: 'metallic' },
  { id: 'neodyme',       name: 'Neodyme',            hex: '#b78b5a', finish: 'metallic' },
  { id: 'aurum',         name: 'Aurum',              hex: '#7e6a44', finish: 'metallic' },
  { id: 'magnesium',     name: 'Magnesium Forged',   hex: '#5a5d63', finish: 'metallic' },
];

export const CALIPER_COLORS = [
  { id: 'red',           name: 'Brake Red',          hex: '#c8102e', finish: 'solid' },
  { id: 'pccb-yellow',   name: 'PCCB Yellow',        hex: '#f6c400', finish: 'solid' },
  { id: 'black',         name: 'Satin Black',        hex: '#111114', finish: 'solid' },
  { id: 'white',         name: 'White',              hex: '#f2f2f2', finish: 'solid' },
  { id: 'acid-green',    name: 'Acid Green',         hex: '#7fdb00', finish: 'solid' },
  { id: 'gulf-blue',     name: 'Gulf Blue',          hex: '#5fb3d4', finish: 'solid' },
];

export const ACCENT_COLORS = [
  { id: 'body-color',    name: 'Body Color',         hex: null,      finish: 'match' },
  { id: 'carbon',        name: 'Exposed Carbon',     hex: '#1c1c20', finish: 'carbon' },
  { id: 'satin-black',   name: 'Satin Black',        hex: '#141417', finish: 'solid' },
  { id: 'silver',        name: 'GT Silver',          hex: '#a7adb3', finish: 'metallic' },
  { id: 'guards-red',    name: 'Guards Red',         hex: '#c8102e', finish: 'solid' },
  { id: 'racing-yellow', name: 'Racing Yellow',      hex: '#f6d000', finish: 'solid' },
];

export const RIM_STYLES = [
  { id: 'forged-magnesium', name: 'Forged Magnesium', description: 'Lightweight 7-spoke center-lock.', spokes: 7,  style: 'spoke' },
  { id: 'turbo-aero',       name: 'Turbo Aero',       description: 'Closed turbofan aero disc.',       spokes: 0,  style: 'aero'  },
  { id: 'twin-five',        name: 'Twin-Five Classic',description: 'Double 5-spoke heritage design.',  spokes: 10, style: 'spoke' },
  { id: 'mesh',             name: 'Motorsport Mesh',  description: 'Open mesh for brake cooling.',     spokes: 14, style: 'mesh'  },
];

// Resolve an accent color id to a hex string, using body color as fallback.
export function resolveAccentHex(accentId, bodyHex) {
  if (accentId === 'body-color' || !accentId) return bodyHex;
  const found = ACCENT_COLORS.find((c) => c.id === accentId);
  return found?.hex ?? bodyHex;
}
