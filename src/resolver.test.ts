import fg from 'fast-glob';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { M3VueResolver, m3VueComponentNames } from './resolver';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

describe('M3VueResolver', () => {
  it('resolves known components to @chillet/m3-vue', () => {
    const resolver = M3VueResolver();

    expect(resolver.resolve?.('Button')).toEqual({
      name: 'Button',
      from: '@chillet/m3-vue',
    });
    expect(resolver.resolve?.('Tooltip')).toEqual({
      name: 'Tooltip',
      from: '@chillet/m3-vue',
    });
    expect(resolver.resolve?.('Unknown')).toBeUndefined();
  });

  it('supports prefixed component names', () => {
    const resolver = M3VueResolver({ prefix: 'M3' });

    expect(resolver.resolve?.('M3Button')).toEqual({
      name: 'Button',
      from: '@chillet/m3-vue',
    });
    expect(resolver.resolve?.('Button')).toBeUndefined();
  });

  it('keeps resolver components in sync with src/components', async () => {
    const componentEntryFiles = await fg('src/components/*/index.ts', {
      cwd: repoRoot,
      onlyFiles: true,
    });

    const componentNames = componentEntryFiles.map((entryFile) => path.basename(path.dirname(entryFile))).sort();

    expect([...m3VueComponentNames].sort()).toEqual(componentNames);
  });
});
