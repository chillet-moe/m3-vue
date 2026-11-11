import { resolve } from 'node:path';
import { runComponentLifecycle } from '../componentLifecycle';

await runComponentLifecycle({
  root: import.meta.dirname,
  variant: 'expressive',
  output: resolve(process.argv[2] ?? '.tmp/slider-stops/lifecycle'),
  counts: [1, 60],
  mountCycles: 4,
  updateCycles: 24,
  subject: '[data-scope="slider"][data-part="root"]',
  viewport: { width: 1000, height: 760 },
  reducedMotion: 'reduce',
});
