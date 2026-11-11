import { resolve } from 'node:path';
import { runComponentLifecycle } from '../componentLifecycle';

await runComponentLifecycle({
  root: import.meta.dirname,
  variant: 'numeric',
  output: resolve(process.argv[2] ?? '.tmp/input-otp/lifecycle'),
  counts: [1, 60],
  mountCycles: 8,
  updateCycles: 24,
  subject: '[data-scope="input-otp"][data-part="root"]',
  viewport: { width: 1000, height: 780 },
  reducedMotion: 'reduce',
});
