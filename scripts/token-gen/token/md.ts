import { color } from './sys/color';
import { shape } from './sys/shape';
import { motion } from './sys/motion';
import { elevation } from './sys/elevation';

export const mdRaw = {
  sys: {
    color,
    elevation,
    motion,
    shape,
  },
} as const;

// Type utility to convert camelCase to kebab-case
type CamelToKebab<S extends string> = S extends `${infer T}${infer U}`
  ? U extends Uncapitalize<U>
    ? `${Lowercase<T>}${CamelToKebab<U>}`
    : `${Lowercase<T>}-${CamelToKebab<Uncapitalize<U>>}`
  : S;

// Type utility to recursively transform object types
type DeepToCssVars<T, Prefix extends string = ''> = {
  [K in keyof T]: T[K] extends string | number
    ? `var(--${CamelToKebab<`${Prefix}${string & K}`>})`
    : T[K] extends object
    ? DeepToCssVars<T[K], `${Prefix}${string & K}-`>
    : T[K];
};

// Helper function to convert camelCase to kebab-case
function camelToKebab(str: string): string {
  return str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
}

// Recursive function to transform object to CSS variables
function toCssVars<T extends object>(obj: T, prefix: string = ''): DeepToCssVars<T, ''> {
  const result: any = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      const cssKey = camelToKebab(key);
      const fullKey = prefix ? `${prefix}-${cssKey}` : cssKey;

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        result[key] = toCssVars(value, fullKey);
      } else {
        result[key] = `var(--${fullKey})`;
      }
    }
  }

  return result;
}

export const md = {
  sys: {
    color: toCssVars(mdRaw.sys.color, 'md-sys-color'),
    elevation: toCssVars(mdRaw.sys.elevation, 'md-sys-elevation'),
    motion: toCssVars(mdRaw.sys.motion, 'md-sys-motion'),
    shape: toCssVars(mdRaw.sys.shape, 'md-sys-shape'),
  },
} as const;
