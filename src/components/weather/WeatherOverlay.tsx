'use client';

import { motion } from 'framer-motion';

type WeatherMood = 'clear' | 'rainy' | 'foggy';

type WeatherOverlayProps = {
  mood: WeatherMood;
  fadeOpacity?: number;
};

const rainDropDelays = [0, 0.3, 0.6, 0.9, 1.2, 1.5, 1.8, 2.1, 2.4, 2.7];

export function WeatherOverlay({ mood, fadeOpacity = 1 }: WeatherOverlayProps) {
  if (mood === 'clear') return null;

  if (mood === 'rainy') {
    return (
      <motion.div
        className="pointer-events-none absolute inset-0 z-[1] overflow-hidden"
        style={{ opacity: Math.max(0, Math.min(1, fadeOpacity)) }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        {rainDropDelays.map((delay, index) => (
          <motion.span
            // Simple rain streak animation to keep the background readable.
            key={`rain-${index}`}
            className="absolute top-[-12%] h-20 w-px bg-gradient-to-b from-white/0 via-[#CFE2E0]/55 to-white/0"
            style={{ left: `${(index + 1) * 9}%` }}
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: '120vh', opacity: [0, 0.55, 0.2, 0] }}
            transition={{
              duration: 2.8,
              ease: 'linear',
              repeat: Number.POSITIVE_INFINITY,
              delay,
            }}
          />
        ))}
      </motion.div>
    );
  }

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-[1] overflow-hidden"
      style={{ opacity: Math.max(0, Math.min(1, fadeOpacity)) }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <motion.div
        className="absolute -left-20 -top-10 h-44 w-44 rounded-full bg-white/28 blur-3xl"
        animate={{ x: [0, 24, -4, 0], y: [0, 10, -6, 0], opacity: [0.2, 0.35, 0.24, 0.2] }}
        transition={{ duration: 12, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute right-[-30px] top-6 h-52 w-52 rounded-full bg-white/22 blur-3xl"
        animate={{ x: [0, -20, 10, 0], y: [0, 6, -8, 0], opacity: [0.16, 0.3, 0.2, 0.16] }}
        transition={{ duration: 14, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-[-26px] left-1/3 h-40 w-40 rounded-full bg-white/18 blur-3xl"
        animate={{ x: [0, 14, -10, 0], y: [0, -14, -4, 0], opacity: [0.14, 0.24, 0.16, 0.14] }}
        transition={{ duration: 16, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
      />
    </motion.div>
  );
}
