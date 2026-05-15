import React, { useRef, useState } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { useConfigurator } from '../store/useConfigurator.js';
import { snapshotRef } from '../snapshot.js';
import {
  BODY_COLORS,
  WHEEL_COLORS,
  CALIPER_COLORS,
  ACCENT_COLORS,
} from '../data/palette.js';

const TABS = [
  { id: 'body',    label: 'Paint',   palette: BODY_COLORS,    pick: 'setBody',    selected: 'bodyId'    },
  { id: 'wheels',  label: 'Wheels',  palette: WHEEL_COLORS,   pick: 'setWheel',   selected: 'wheelId'   },
  { id: 'brakes',  label: 'Brakes',  palette: CALIPER_COLORS, pick: 'setCaliper', selected: 'caliperId' },
  { id: 'accents', label: 'Accents', palette: ACCENT_COLORS,  pick: 'setAccent',  selected: 'accentId'  },
];

export default function ConfiguratorPanel() {
  const [collapsed, setCollapsed] = useState(false);
  const [tab, setTab] = useState('body');
  const constraintsRef = useRef(null);
  const dragControls = useDragControls();

  return (
    <>
      <div
        ref={constraintsRef}
        aria-hidden
        className="fixed inset-3 pointer-events-none z-20"
      />

      <motion.div
        drag
        dragListener={false}
        dragControls={dragControls}
        dragMomentum={false}
        dragElastic={0.08}
        dragConstraints={constraintsRef}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="pointer-events-auto fixed top-5 right-5 z-30 select-none"
      >
        <AnimatePresence mode="wait" initial={false}>
          {collapsed ? (
            <motion.div
              key="pill"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.16 }}
            >
              <CollapsedPill
                onExpand={() => setCollapsed(false)}
                startDrag={(e) => dragControls.start(e)}
              />
            </motion.div>
          ) : (
            <motion.div
              key="panel"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.18 }}
            >
              <ExpandedPanel
                tab={tab}
                setTab={setTab}
                onCollapse={() => setCollapsed(true)}
                startDrag={(e) => dragControls.start(e)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}

/* ───────────────────────── Expanded panel ───────────────────────── */

function ExpandedPanel({ tab, setTab, onCollapse, startDrag }) {
  const active = TABS.find((t) => t.id === tab) ?? TABS[0];
  const activeId = useConfigurator((s) => s[active.selected]);
  const setter = useConfigurator((s) => s[active.pick]);
  const current = active.palette.find((c) => c.id === activeId) ?? active.palette[0];

  return (
    <div className="w-[232px] rounded-xl bg-white/95 backdrop-blur-xl border border-black/[0.06] shadow-[0_16px_50px_-20px_rgba(0,0,0,0.25)] overflow-hidden">
      {/* Drag handle */}
      <div
        onPointerDown={startDrag}
        className="flex items-center justify-between px-3 py-2 cursor-grab active:cursor-grabbing hover:bg-black/[0.02] transition-colors"
      >
        <div className="flex items-center gap-1.5 text-neutral-400">
          <DragDots />
          <span className="text-[9px] tracking-[0.28em] uppercase font-medium">
            Customize
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          <SnapshotButton />
          <IconButton onClick={onCollapse} ariaLabel="Collapse panel">
            <MinusIcon />
          </IconButton>
        </div>
      </div>

      <div className="h-px bg-black/[0.05]" />

      {/* Tabs */}
      <div className="px-2 pt-2 flex gap-0.5">
        {TABS.map((t) => {
          const isActive = t.id === tab;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={[
                'flex-1 text-[10px] font-medium py-1 rounded-md transition-colors',
                isActive
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-500 hover:text-neutral-900 hover:bg-black/[0.04]',
              ].join(' ')}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Current selection */}
      <div className="px-3 pt-2.5 pb-0.5 flex items-center gap-2">
        <span
          className="w-5 h-5 rounded-full ring-1 ring-black/10 shrink-0"
          style={
            current?.hex == null
              ? {
                  background:
                    'conic-gradient(from 180deg, #c8102e, #f6d000, #5fb3d4, #c8102e)',
                }
              : { background: current.hex }
          }
        />
        <div className="min-w-0">
          <p className="text-[8px] tracking-[0.28em] uppercase text-neutral-400 leading-none">
            {active.label}
          </p>
          <p className="text-[11px] font-medium text-neutral-900 truncate leading-tight">
            {current?.name}
          </p>
        </div>
      </div>

      {/* Swatches */}
      <div className="px-3 pt-2 pb-3 grid grid-cols-7 gap-1.5">
        {active.palette.map((c) => {
          const isOn = c.id === activeId;
          const isMulti = c.hex == null;
          return (
            <button
              key={c.id}
              onClick={() => setter(c.id)}
              title={c.name}
              aria-label={c.name}
              className={[
                'relative aspect-square rounded-full transition-all',
                'ring-1 ring-inset',
                isOn
                  ? 'ring-[2px] ring-neutral-900 scale-[1.12]'
                  : 'ring-black/10 hover:ring-black/30 hover:scale-[1.08]',
              ].join(' ')}
              style={
                isMulti
                  ? {
                      background:
                        'conic-gradient(from 180deg, #c8102e, #f6d000, #5fb3d4, #c8102e)',
                    }
                  : { background: c.hex }
              }
            />
          );
        })}
      </div>
    </div>
  );
}

/* ───────────────────────── Collapsed pill ───────────────────────── */

function CollapsedPill({ onExpand, startDrag }) {
  const bodyId    = useConfigurator((s) => s.bodyId);
  const wheelId   = useConfigurator((s) => s.wheelId);
  const caliperId = useConfigurator((s) => s.caliperId);
  const accentId  = useConfigurator((s) => s.accentId);

  const dots = [
    BODY_COLORS.find((c) => c.id === bodyId),
    WHEEL_COLORS.find((c) => c.id === wheelId),
    CALIPER_COLORS.find((c) => c.id === caliperId),
    ACCENT_COLORS.find((c) => c.id === accentId),
  ];

  return (
    <div
      onPointerDown={startDrag}
      className="flex items-center gap-2.5 pl-3 pr-1.5 py-1.5 rounded-full bg-white/95 backdrop-blur-xl border border-black/[0.06] shadow-[0_10px_30px_-12px_rgba(0,0,0,0.25)] cursor-grab active:cursor-grabbing"
    >
      <span className="flex -space-x-1.5">
        {dots.map((d, i) => (
          <span
            key={i}
            className="w-4 h-4 rounded-full ring-2 ring-white"
            style={
              d?.hex == null
                ? {
                    background:
                      'conic-gradient(from 180deg, #c8102e, #f6d000, #5fb3d4, #c8102e)',
                  }
                : { background: d?.hex ?? '#ccc' }
            }
          />
        ))}
      </span>
      <button
        onClick={onExpand}
        onPointerDown={(e) => e.stopPropagation()}
        aria-label="Expand panel"
        className="w-7 h-7 flex items-center justify-center rounded-full text-neutral-500 hover:text-neutral-900 hover:bg-black/[0.04] transition-colors"
      >
        <PlusIcon />
      </button>
    </div>
  );
}

/* ───────────────────────── Snapshot button ───────────────────────── */

function SnapshotButton() {
  const [state, setState] = useState('idle'); // 'idle' | 'capturing' | 'done'

  const onClick = async () => {
    if (state !== 'idle' || !snapshotRef.current) return;
    setState('capturing');
    try {
      // Yield a frame so the spinner can mount before the heavy render
      await new Promise((r) => requestAnimationFrame(() => r()));
      await snapshotRef.current();
      setState('done');
      setTimeout(() => setState('idle'), 1400);
    } catch (err) {
      console.error('Snapshot failed:', err);
      setState('idle');
    }
  };

  return (
    <button
      onClick={onClick}
      onPointerDown={(e) => e.stopPropagation()}
      aria-label="Save snapshot"
      title="Save snapshot of all angles"
      className={[
        'w-6 h-6 flex items-center justify-center rounded-md transition-colors',
        state === 'done'
          ? 'text-emerald-600 bg-emerald-50'
          : state === 'capturing'
          ? 'text-neutral-400'
          : 'text-neutral-400 hover:text-neutral-900 hover:bg-black/[0.04]',
      ].join(' ')}
      disabled={state !== 'idle'}
    >
      {state === 'capturing' ? <Spinner /> : state === 'done' ? <CheckIcon /> : <CameraIcon />}
    </button>
  );
}

function IconButton({ onClick, ariaLabel, children }) {
  return (
    <button
      onClick={onClick}
      onPointerDown={(e) => e.stopPropagation()}
      aria-label={ariaLabel}
      className="w-6 h-6 flex items-center justify-center rounded-md text-neutral-400 hover:text-neutral-900 hover:bg-black/[0.04] transition-colors"
    >
      {children}
    </button>
  );
}

/* ───────────────────────── Icons ───────────────────────── */

function DragDots() {
  return (
    <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor" aria-hidden>
      <circle cx="2"  cy="3"  r="1" />
      <circle cx="2"  cy="7"  r="1" />
      <circle cx="2"  cy="11" r="1" />
      <circle cx="8"  cy="3"  r="1" />
      <circle cx="8"  cy="7"  r="1" />
      <circle cx="8"  cy="11" r="1" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
      <line x1="3" y1="7" x2="11" y2="7" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
      <line x1="3" y1="7" x2="11" y2="7" />
      <line x1="7" y1="3" x2="7" y2="11" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
      <path d="M2 5.5A1.5 1.5 0 0 1 3.5 4h1.7l1-1.4A1 1 0 0 1 7 2.2h2a1 1 0 0 1 .8.4l1 1.4h1.7A1.5 1.5 0 0 1 14 5.5v6A1.5 1.5 0 0 1 12.5 13h-9A1.5 1.5 0 0 1 2 11.5v-6Z" />
      <circle cx="8" cy="8.5" r="2.4" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="3 7.5 6 10.5 11 4.5" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className="animate-spin">
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1.5" />
      <path d="M12 7a5 5 0 0 0-5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
