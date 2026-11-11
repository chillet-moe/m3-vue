import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { runComponentLifecycle } from '../../componentLifecycle';

const variant = process.argv[2] ?? 'titled';
assert(variant === 'titled' || variant === 'untitled', 'Expected titled or untitled');

await runComponentLifecycle({
  root: import.meta.dirname,
  variant,
  output: resolve(process.argv[3] ?? `.tmp/action-title-tooltip/lifecycle/${variant}`),
  counts: [1, 240, 1200],
  mountCycles: 6,
  updateCycles: 12,
  subject: 'button[data-action]',
  viewport: { width: 1000, height: 760 },
  reducedMotion: 'reduce',
});
