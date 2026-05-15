import { create } from 'zustand';
import {
  BODY_COLORS,
  WHEEL_COLORS,
  CALIPER_COLORS,
  ACCENT_COLORS,
  RIM_STYLES,
} from '../data/palette.js';

const byId = (list, id) => list.find((c) => c.id === id) ?? list[0];

export const useConfigurator = create((set, get) => ({
  // Defaults match the white-showroom reference image
  bodyId: 'white',
  wheelId: 'satin-black',
  caliperId: 'red',
  accentId: 'carbon',
  rimStyleId: 'forged-magnesium',

  activePart: 'body',

  setBody: (id) => set({ bodyId: id }),
  setWheel: (id) => set({ wheelId: id }),
  setCaliper: (id) => set({ caliperId: id }),
  setAccent: (id) => set({ accentId: id }),
  setRimStyle: (id) => set({ rimStyleId: id }),
  setActivePart: (part) => set({ activePart: part }),

  getBody: () => byId(BODY_COLORS, get().bodyId),
  getWheel: () => byId(WHEEL_COLORS, get().wheelId),
  getCaliper: () => byId(CALIPER_COLORS, get().caliperId),
  getAccent: () => byId(ACCENT_COLORS, get().accentId),
  getRimStyle: () => RIM_STYLES.find((r) => r.id === get().rimStyleId) ?? RIM_STYLES[0],
}));
