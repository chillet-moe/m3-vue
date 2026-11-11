import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { runComponentLifecycle } from '../componentLifecycle';

const variant = process.argv[2] ?? 'reactive';
assert(variant === 'reactive' || variant === 'raw', 'Expected reactive or raw');

await runComponentLifecycle({
  root: import.meta.dirname,
  variant,
  output: resolve(process.argv[3] ?? `.tmp/tree-view/lifecycle/${variant}`),
  counts: [1],
  mountCycles: 6,
  updateCycles: 12,
  subject: '[role="tree"]',
  viewport: { width: 800, height: 700 },
  reducedMotion: 'reduce',
});
