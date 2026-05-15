// Module-level handle to the snapshot function. SnapshotRig (inside the R3F
// Canvas) registers an async function here on mount; the configurator panel
// invokes it on click. Kept outside the Zustand store because functions don't
// participate in renders.
export const snapshotRef = { current: null };
