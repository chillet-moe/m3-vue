import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vite-plus/test';

const componentsDirectory = 'src/components';
const tokenStyles = readFileSync('src/styles/tokens.css', 'utf8');

function collectCssFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      return collectCssFiles(path);
    }

    return entry.isFile() && entry.name.endsWith('.css') ? [path] : [];
  });
}

const componentStyles = collectCssFiles(componentsDirectory).map((path) => ({
  path,
  styles: readFileSync(path, 'utf8'),
}));

describe('semantic cursor tokens', () => {
  it('keeps the backward-compatible action and link defaults', () => {
    expect(tokenStyles).toContain('--md-cursor-action: pointer;');
    expect(tokenStyles).toContain('--md-cursor-link: pointer;');
  });

  it('does not allow component styles to bypass the public pointer policy', () => {
    const filesWithBarePointer = componentStyles
      .filter(({ styles }) => /cursor\s*:\s*pointer\b/.test(styles))
      .map(({ path }) => path);

    expect(filesWithBarePointer).toEqual([]);
  });

  it('routes real component links through the link cursor token', () => {
    const linkSelectors = [
      '.m3-breadcrumb-link:any-link',
      '.m3-button:any-link',
      '.m3-fab-menu-item:any-link',
      '.m3-fab:any-link',
      '.m3-icon-button:any-link',
      '.m3-item:any-link',
      '.m3-menu-item:any-link',
      '.m3-navigation-drawer-item:any-link',
      '.m3-navigation-rail-item:any-link',
      '.m3-tab:any-link',
    ];
    const allComponentStyles = componentStyles.map(({ styles }) => styles).join('\n');

    for (const selector of linkSelectors) {
      expect(allComponentStyles).toContain(`${selector} {\n    cursor: var(--md-cursor-link);`);
    }
  });

  it('preserves cursors with distinct interaction semantics', () => {
    const allComponentStyles = componentStyles.map(({ styles }) => styles).join('\n');

    expect(allComponentStyles).toContain('cursor: grabbing;');
    expect(allComponentStyles).toContain('cursor: inherit;');
    expect(allComponentStyles).toContain('cursor: default;');
  });
});
