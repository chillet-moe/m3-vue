import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { runComponentLifecycle } from '../componentLifecycle';

const variant = process.argv[2] ?? 'icon';
assert(['icon', 'breadcrumb', 'button', 'overrides', 'static-overrides'].includes(variant), 'Unknown fixture variant');
await runComponentLifecycle({
  root: import.meta.dirname,
  variant,
  output: resolve(process.argv[3] ?? `.tmp/icon-styles/${variant}`),
  counts: [1, 240],
  mountCycles: 16,
  updateCycles: 24,
  subject: '[data-scope="icon"]',
  sample: variant === 'breadcrumb' ? 'ol' : undefined,
  subjectsPerRoot: variant === 'breadcrumb' ? 2 : 1,
  verifyUpdate: variant !== 'static-overrides',
  viewport: { width: 1040, height: 820 },
});
