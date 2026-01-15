import { color } from './sys/color.ts';
import { shape } from './sys/shape.ts';
import { motion } from './sys/motion.ts';
import { elevation } from './sys/elevation.ts';

export const md = {
  sys: {
    color,
    elevation,
    motion,
    shape,
  },
} as const;
