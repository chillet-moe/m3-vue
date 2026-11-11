import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { runComponentLifecycle } from '../componentLifecycle';

const variant = process.argv[2] ?? 'tabs';
assert(variant === 'tabs' || variant === 'standalone', 'Unknown fixture variant');

await runComponentLifecycle({
  root: import.meta.dirname,
  variant,
  output: resolve(process.argv[3] ?? `.tmp/badge/${variant}`),
  counts: [1, 320],
  mountCycles: 8,
  updateCycles: 16,
  subject: '[data-scope="badge"][data-part="root"]',
  viewport: { width: 1000, height: 760 },
  reducedMotion: 'reduce',
});
