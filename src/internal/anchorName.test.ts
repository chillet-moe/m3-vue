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

  it('keeps a shared name in acquisition order until its last owner releases it', () => {
    const anchor = document.createElement('button');
    anchor.style.setProperty('anchor-name', '--existing-anchor');

    const releaseFirst = acquireAnchorName(anchor, '--first-anchor');
    const releaseSecond = acquireAnchorName(anchor, '--second-anchor');
    const releaseShared = acquireAnchorName(anchor, '--first-anchor');

    releaseFirst();
    expect(anchor.style.getPropertyValue('anchor-name')).toBe('--existing-anchor, --first-anchor, --second-anchor');

    releaseShared();
    expect(anchor.style.getPropertyValue('anchor-name')).toBe('--existing-anchor, --second-anchor');

    releaseSecond();
    expect(anchor.style.getPropertyValue('anchor-name')).toBe('--existing-anchor');
  });

  it('keeps a single name when a second owner acquires it', () => {
    const anchor = document.createElement('button');
    const releaseFirst = acquireAnchorName(anchor, '--shared-anchor');
    const releaseSecond = acquireAnchorName(anchor, '--shared-anchor');

    releaseSecond();
    expect(anchor.style.getPropertyValue('anchor-name')).toBe('--shared-anchor');

    releaseFirst();
    expect(anchor.style.getPropertyValue('anchor-name')).toBe('');
  });
});
