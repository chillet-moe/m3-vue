import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const surfaces = [
  {
    name: 'Dialog',
    styles: readFileSync('src/components/Dialog/Dialog.css', 'utf8'),
    token: '--md-dialog-content-visual-overflow-inset',
    privateToken: '--_dialog-content-visual-overflow-inset',
  },
  {
    name: 'BottomSheet',
    styles: readFileSync('src/components/BottomSheet/BottomSheet.css', 'utf8'),
    token: '--md-bottom-sheet-content-visual-overflow-inset',
    privateToken: '--_bottom-sheet-content-visual-overflow-inset',
  },
  {
    name: 'SideSheet',
    styles: readFileSync('src/components/SideSheet/SideSheet.css', 'utf8'),
    token: '--md-side-sheet-content-visual-overflow-inset',
    privateToken: '--_side-sheet-content-visual-overflow-inset',
  },
] as const;

const popoverStyles = readFileSync('src/components/Popover/Popover.css', 'utf8');

describe('scrollable public content visual overflow', () => {
  it.each(surfaces)('$name keeps a default block-axis visual-overflow inset', ({ styles, token, privateToken }) => {
    expect(styles).toContain(`${token}: initial`);
    expect(styles).toContain(`${privateToken}: var(`);
    expect(styles).toContain(`margin-block: calc(-1 * var(${privateToken}))`);
    expect(styles).toContain(`padding-block: var(${privateToken})`);
    expect(styles).toContain(`scroll-padding-block: var(${privateToken})`);
  });

  it('keeps Popover authored content inside its padded scrollport', () => {
    expect(popoverStyles).toContain('--_popover-padding: var(--md-popover-padding, 1rem)');
    expect(popoverStyles).toMatch(
      /\.m3-popover-surface\s*\{[^}]*overflow: auto;[^}]*padding: var\(--_popover-padding\)/s,
    );
  });
});
