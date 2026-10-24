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
