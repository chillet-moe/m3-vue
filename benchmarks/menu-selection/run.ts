import { resolve } from 'node:path';
import { runComponentLifecycle } from '../componentLifecycle';

await runComponentLifecycle({
  root: import.meta.dirname,
  variant: 'multiple',
  output: resolve(process.argv[2] ?? '.tmp/menu-selection/lifecycle'),
  counts: [8, 320],
  mountCycles: 4,
  updateCycles: 24,
  subject: '[data-scope="menu-item"][data-part="root"]',
  sample: '[data-menu-bench-row="2"]',
  viewport: { width: 1000, height: 760 },
  reducedMotion: 'reduce',
});
