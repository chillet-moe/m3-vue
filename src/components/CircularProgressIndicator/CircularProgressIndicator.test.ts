// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vite-plus/test';
import { createApp, h, nextTick } from 'vue';
import CircularProgressIndicator from './CircularProgressIndicator.vue';

async function mountCircularProgressIndicator(props: Record<string, unknown> = {}) {
  const container = document.createElement('div');
  document.body.appendChild(container);

  const app = createApp({
    render() {
      return h(CircularProgressIndicator, props);
    },
  });

  app.mount(container);
  await nextTick();

  return {
    app,
    container,
    root: container.querySelector('.m3-circular-progress-indicator') as HTMLElement | null,
  };
}

describe('CircularProgressIndicator', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders a determinate circular progressbar by default', async () => {
    const { app, container, root } = await mountCircularProgressIndicator({
      value: 25,
      min: 0,
      max: 100,
      ariaLabel: 'Loading records',
    });

    const track = container.querySelector('.m3-circular-progress-indicator-track');
    const active = container.querySelector('.m3-circular-progress-indicator-active');

    expect(root).not.toBeNull();
    expect(root?.getAttribute('role')).toBe('progressbar');
    expect(root?.getAttribute('aria-label')).toBe('Loading records');
    expect(root?.getAttribute('aria-valuemin')).toBe('0');
    expect(root?.getAttribute('aria-valuemax')).toBe('100');
    expect(root?.getAttribute('aria-valuenow')).toBe('25');
    expect(root?.getAttribute('aria-valuetext')).toBe('25%');
    expect(root?.dataset.indeterminate).toBe('false');
    expect(root?.dataset.shape).toBe('flat');
    expect(root?.dataset.progressState).toBe('partial');
    expect(root?.style.getPropertyValue('--md-circular-progress-indicator-progress')).toBe('0.25');
    expect(track).not.toBeNull();
    expect(active?.classList.contains('m3-circular-progress-indicator-active-determinate')).toBe(true);
    expect(track?.tagName.toLowerCase()).toBe('path');
    expect(active?.tagName.toLowerCase()).toBe('path');
    expect(track?.getAttribute('d')).not.toBe(active?.getAttribute('d'));

    app.unmount();
  });

  it('supports custom size, thickness, and counterclockwise direction', async () => {
    const { app, root } = await mountCircularProgressIndicator({
      value: 1,
      direction: 'counterclockwise',
      size: '3rem',
      thickness: '0.375rem',
      trackGap: '0.25rem',
    });

    expect(root?.dataset.direction).toBe('counterclockwise');
    expect(root?.dataset.progressState).toBe('complete');
    expect(root?.style.getPropertyValue('--md-circular-progress-indicator-current-size')).toBe('3rem');
    expect(root?.style.getPropertyValue('--md-circular-progress-indicator-size')).toBe('3rem');
    expect(root?.style.getPropertyValue('--md-circular-progress-indicator-track-thickness')).toBe('0.375rem');
    expect(root?.style.getPropertyValue('--md-circular-progress-indicator-track-active-indicator-gap')).toBe('0.25rem');

    app.unmount();
  });

  it('renders an indeterminate advance animation without determinate aria values', async () => {
    const { app, container, root } = await mountCircularProgressIndicator({
      indeterminate: true,
      ariaValueText: 'Loading',
    });

    const active = container.querySelector('.m3-circular-progress-indicator-active');

    expect(root?.dataset.indeterminate).toBe('true');
    expect(root?.getAttribute('aria-valuemin')).toBeNull();
    expect(root?.getAttribute('aria-valuemax')).toBeNull();
    expect(root?.getAttribute('aria-valuenow')).toBeNull();
    expect(root?.getAttribute('aria-valuetext')).toBe('Loading');
    expect(container.querySelector('.m3-circular-progress-indicator-track')).not.toBeNull();
    expect(active?.classList.contains('m3-circular-progress-indicator-active-indeterminate')).toBe(true);

    app.unmount();
  });

  it('hides the determinate active arc at zero progress', async () => {
    const { app, root } = await mountCircularProgressIndicator({
      value: -1,
      min: 0,
      max: 1,
    });

    expect(root?.getAttribute('aria-valuenow')).toBe('0');
    expect(root?.dataset.progressState).toBe('empty');
    expect(root?.style.getPropertyValue('--md-circular-progress-indicator-progress')).toBe('0');

    app.unmount();
  });

  it('renders a wavy active arc as a cubic path while keeping the track as a separate arc', async () => {
    const { app, container, root } = await mountCircularProgressIndicator({
      value: 0.5,
      shape: 'wavy',
    });

    const track = container.querySelector('.m3-circular-progress-indicator-track');
    const active = container.querySelector('.m3-circular-progress-indicator-active');

    expect(root?.dataset.shape).toBe('wavy');
    expect(track?.getAttribute('d')).toContain('A');
    expect(active?.getAttribute('d')).toContain('C');
    expect(track?.getAttribute('d')).not.toBe(active?.getAttribute('d'));

    app.unmount();
  });
});
