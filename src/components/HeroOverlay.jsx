import React from 'react';
import { motion } from 'framer-motion';

/**
 * Minimal overlay — wordmark top-left, interaction hint bottom-left.
 * The configurator panel is now floating + draggable, so no side padding.
 */
export default function HeroOverlay() {
  return (
    <div className="pointer-events-none fixed inset-0 z-10 flex flex-col justify-between">
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="px-8 pt-7 flex items-baseline gap-3"
      >
        <span className="text-[15px] font-semibold tracking-tight text-neutral-900">
          Porsche
        </span>
        <span className="text-[10px] tracking-[0.3em] uppercase text-neutral-400">
          911 GT3 RS
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.6 }}
        className="px-8 pb-7"
      >
        <p className="text-[10px] tracking-[0.3em] uppercase text-neutral-400">
          Drag to rotate · Scroll to zoom
        </p>
      </motion.div>
    </div>
  );
}
