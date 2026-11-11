// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { bindElementEnvironment, isHTMLElement } from './elementEnvironment';

describe('element document ownership', () => {
  it('rebinds after adoption and releases exactly once on pagehide without Vue unmount', async () => {
    const frame = document.createElement('iframe');
    document.body.append(frame);
    const child = frame.contentDocument!;
    const element = document.createElement('button');
    document.body.append(element);
    const cleanups: ReturnType<typeof vi.fn>[] = [];
    const setup = vi.fn(() => {
      const cleanup = vi.fn();
      cleanups.push(cleanup);
      return cleanup;
    });
    const release = bindElementEnvironment(element, setup);
    child.body.append(element);
    await Promise.resolve();
    expect(setup.mock.calls).toHaveLength(2);
    expect(cleanups[0]).toHaveBeenCalledOnce();
    document.body.append(element);
    await Promise.resolve();
    expect(setup.mock.calls).toHaveLength(3);
    expect(cleanups[1]).toHaveBeenCalledOnce();
    window.dispatchEvent(new Event('pagehide'));
    release();
    release();
    expect(cleanups[2]).toHaveBeenCalledOnce();
    element.remove();
    frame.remove();
  });

  it('tracks an element mounted while detached before its first insertion', async () => {
    const frame = document.createElement('iframe');
    document.body.append(frame);
    const element = document.createElement('button');
    const cleanup = vi.fn();
    const setup = vi.fn(() => cleanup);
    const release = bindElementEnvironment(element, setup);
    frame.contentDocument!.body.append(element);
    await Promise.resolve();
    expect(setup).toHaveBeenCalledTimes(2);
    expect(cleanup).toHaveBeenCalledOnce();
    expect(element.querySelector('m3-document-adoption-sentinel')).toBeNull();
    release();
    frame.remove();
  });

  it('rebinds a detached element after releasing its first binding', async () => {
    const frame = document.createElement('iframe');
    document.body.append(frame);
    const destination = frame.contentDocument!;
    const element = document.createElement('button');
    const first = vi.fn();
    const second = vi.fn();
    const releaseFirst = bindElementEnvironment(element, first);
    const releaseSecond = bindElementEnvironment(element, second);

    try {
      releaseFirst();
      destination.body.append(element);
      await Promise.resolve();
      expect(first.mock.calls).toEqual([[document]]);
      expect(second.mock.calls).toEqual([[document], [destination]]);
    } finally {
      releaseFirst();
      releaseSecond();
      frame.remove();
    }
  });

  it('keeps a late detached binding after an intervening child binding', async () => {
    const frame = document.createElement('iframe');
    document.body.append(frame);
    const destination = frame.contentDocument!;
    const parent = document.createElement('div');
    const child = document.createElement('button');
    const rebound: string[] = [];
    const bind = (element: Element, name: string) =>
      bindElementEnvironment(element, (owner) => {
        if (owner === destination) rebound.push(name);
      });
    const first = bind(parent, 'parent');
    parent.append(child);
    const second = bind(child, 'child');
    const third = bind(parent, 'late parent binding');

    try {
      destination.body.append(parent);
      await Promise.resolve();
      expect(rebound).toEqual(['parent', 'child', 'late parent binding']);
    } finally {
      first();
      second();
      third();
      frame.remove();
    }
  });

  it.each([0, 10, 1000])(
    'preserves registration order when an adopted subtree has %i unregistered descendants',
    async (unregistered) => {
      const frame = document.createElement('iframe');
      const parent = document.createElement('div');
      const child = document.createElement('button');
      const content = unregistered === 1000 ? parent.appendChild(document.createElement('div')) : parent;
      for (let index = 0; index < unregistered; index++) content.append(document.createElement('span'));
      // Put a binding beyond the discovery budget in the wrapped-subtree case.
      content.append(child);
      document.body.append(frame, parent);
      const destination = frame.contentDocument!;
      const rebound: string[] = [];
      const bind = (element: Element, name: string) =>
        bindElementEnvironment(element, (owner) => {
          if (owner === destination) rebound.push(name);
        });
      const releases = [bind(parent, 'parent'), bind(child, 'child'), bind(parent, 'second parent resource')];

      try {
        destination.body.append(parent);
        await Promise.resolve();
        expect(rebound).toEqual(['parent', 'child', 'second parent resource']);
      } finally {
        for (const release of releases) release();
        frame.remove();
      }
    },
  );

  it('rebinds after an element moves from light DOM into a closed shadow tree and its host is adopted', async () => {
    const frame = document.createElement('iframe');
    const host = document.createElement('div');
    const shadow = host.attachShadow({ mode: 'closed' });
    const element = document.createElement('button');
    document.body.append(frame, host, element);
    const destination = frame.contentDocument!;
    const owners: Document[] = [];
    const release = bindElementEnvironment(element, (owner) => {
      owners.push(owner);
    });

    try {
      shadow.append(element);
      await Promise.resolve();
      destination.body.append(host);
      await Promise.resolve();
      expect(owners).toEqual([document, destination]);
    } finally {
      release();
      frame.remove();
    }
  });

  it('rebinds the current shadow bindings in registration order on text replacement', async () => {
    const frame = document.createElement('iframe');
    const status = document.createElement('div');
    status.append('Initial status');
    const host = document.createElement('div');
    const shadow = host.attachShadow({ mode: 'closed' });
    const first = document.createElement('button');
    const second = document.createElement('button');
    const third = document.createElement('button');
    shadow.append(first, second, third);
    document.body.append(frame, status, host);
    const destination = frame.contentDocument!;
    const rebound: string[] = [];
    const bind = (element: HTMLElement, name: string) =>
      bindElementEnvironment(element, (owner) => {
        if (owner === destination) rebound.push(name);
      });
    const releaseFirst = bind(first, 'first');
    const releaseSecond = bind(second, 'second');
    let releaseThird: (() => void) | undefined;

    try {
      status.textContent = 'Updated status';
      await Promise.resolve();
      releaseSecond();
      releaseThird = bind(third, 'third');

      destination.body.append(third, second, first);
      status.textContent = 'Moved';
      await Promise.resolve();
      expect(rebound).toEqual(['first', 'third']);
    } finally {
      releaseFirst();
      releaseSecond();
      releaseThird?.();
      host.remove();
      status.remove();
      frame.remove();
    }
  });

  it('preserves an adopted element when its old window closes before mutation delivery', () => {
    const frame = document.createElement('iframe');
    document.body.append(frame);
    const child = frame.contentDocument!;
    const element = child.createElement('div');
    child.body.append(element);
    const cleanup = vi.fn();
    const setup = vi.fn(() => cleanup);
    const release = bindElementEnvironment(element, setup);
    document.body.append(element);
    child.defaultView!.dispatchEvent(new Event('pagehide'));
    expect(setup).toHaveBeenCalledTimes(2);
    expect(cleanup).toHaveBeenCalledTimes(1);
    release();
    expect(cleanup).toHaveBeenCalledTimes(2);
    element.remove();
    frame.remove();
  });

  it('recognizes both foreign-created and adopted elements', () => {
    const frame = document.createElement('iframe');
    document.body.append(frame);
    const foreign = frame.contentDocument!.createElement('button');
    expect(foreign instanceof HTMLElement).toBe(false);
    expect(isHTMLElement(foreign)).toBe(true);
    document.body.append(foreign);
    expect(isHTMLElement(foreign)).toBe(true);
    foreign.remove();
    frame.remove();
  });
});
