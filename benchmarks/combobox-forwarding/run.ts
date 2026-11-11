import { resolve } from 'node:path';
import { runComponentLifecycle } from '../componentLifecycle';

await runComponentLifecycle({
  root: import.meta.dirname,
  variant: 'combobox-attrs',
  output: resolve(process.argv[2] ?? '.tmp/combobox-forwarding'),
  counts: [1, 120],
  mountCycles: 8,
  updateCycles: 16,
  subject: 'input[role="combobox"]',
  sample: '[data-scope="select"][data-part="root"]',
  viewport: { width: 1000, height: 760 },
  reducedMotion: 'reduce',
});
