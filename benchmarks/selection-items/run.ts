import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { runComponentLifecycle } from '../componentLifecycle';

const variant = process.argv[2] ?? 'chip';
assert(variant === 'chip' || variant === 'button', 'Unknown fixture variant');

await runComponentLifecycle({
  root: import.meta.dirname,
  variant,
  output: resolve(process.argv[3] ?? `.tmp/selection-items/${variant}`),
  counts: [1, 320],
  mountCycles: 8,
  updateCycles: 16,
  subject: 'fieldset input',
  viewport: { width: 1000, height: 780 },
  reducedMotion: 'reduce',
});
