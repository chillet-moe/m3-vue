import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { runComponentLifecycle } from '../componentLifecycle';

const variant = process.argv[2] ?? 'default';
assert(variant === 'default' || variant === 'custom', 'Unknown fixture variant');

await runComponentLifecycle({
  root: import.meta.dirname,
  variant,
  output: resolve(process.argv[3] ?? `.tmp/divider/${variant}`),
  counts: [1, 400],
  mountCycles: 12,
  updateCycles: 24,
  subject: '[data-scope="divider"][role="separator"]',
  viewport: { width: 911, height: 773 },
});
