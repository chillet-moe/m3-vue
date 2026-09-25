// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { acquireAnchorName } from './anchorName';

describe('acquireAnchorName', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('keeps multiple acquired anchor names on the same element', () => {
    const anchor = document.createElement('button');
    document.body.appendChild(anchor);

    const releaseFirst = acquireAnchorName(anchor, '--first-anchor');
    const releaseSecond = acquireAnchorName(anchor, '--second-anchor');

    expect(anchor.style.getPropertyValue('anchor-name')).toBe('--first-anchor, --second-anchor');

    releaseSecond();

    expect(anchor.style.getPropertyValue('anchor-name')).toBe('--first-anchor');

    releaseFirst();

    expect(anchor.style.getPropertyValue('anchor-name')).toBe('');
  });

  it('restores an existing inline anchor-name after managed names are released', () => {
    const anchor = document.createElement('button');
    anchor.style.setProperty('anchor-name', '--existing-anchor');
    document.body.appendChild(anchor);

    const release = acquireAnchorName(anchor, '--managed-anchor');

    expect(anchor.style.getPropertyValue('anchor-name')).toBe('--existing-anchor, --managed-anchor');

    release();

    expect(anchor.style.getPropertyValue('anchor-name')).toBe('--existing-anchor');
  });
});
