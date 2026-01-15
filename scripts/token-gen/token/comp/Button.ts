import { md } from '../md.ts';

export const Button = {
  container: {
    color: md.sys.color.primary,
    height: '40dp',
  },
  elevated: {
    container: {
      color: md.sys.color.surfaceContainerLow,
    },
  },
  xsmall: {
    container: {
      height: '32dp',
    },
  },
} as const;
