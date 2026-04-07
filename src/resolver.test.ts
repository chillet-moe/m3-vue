import fg from 'fast-glob';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { M3VueResolver, m3VueComponentNames } from './resolver';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

describe('M3VueResolver', () => {
  it('resolves known components to @chillet/m3-vue', () => {
    const resolver = M3VueResolver();
    const resolve = typeof resolver === 'function'
      ? resolver
      : resolver.resolve;

    expect(resolve('Button')).toEqual({
      name: 'Button',
      from: '@chillet/m3-vue',
    });
    expect(resolve('Tooltip')).toEqual({
      name: 'Tooltip',
      from: '@chillet/m3-vue',
    });
    expect(resolve('Unknown')).toBeUndefined();
  });

  it('supports prefixed component names', () => {
    const resolver = M3VueResolver({ prefix: 'M3' });
    const resolve = typeof resolver === 'function'
      ? resolver
      : resolver.resolve;

    expect(resolve('M3Button')).toEqual({
      name: 'Button',
      from: '@chillet/m3-vue',
    });
    expect(resolve('Button')).toBeUndefined();
  });

  it('keeps resolver components in sync with src/components', async () => {
    const componentEntryFiles = await fg('src/components/*/index.ts', {
      cwd: repoRoot,
      onlyFiles: true,
    });

    const componentNames = (
      await Promise.all(componentEntryFiles.map(async (entryFile) => fs.readFile(path.join(repoRoot, entryFile), 'utf8')))
    )
      .flatMap((entrySource) =>
        Array.from(entrySource.matchAll(/export \{ default as (\w+) \} from '\.\/[^']+\.vue';/g), (match) => match[1]),
      )
      .sort();

    expect([...m3VueComponentNames].sort()).toEqual(componentNames);
  });
});
