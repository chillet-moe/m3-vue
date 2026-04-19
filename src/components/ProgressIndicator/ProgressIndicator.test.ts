// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vite-plus/test';
import { createApp, h, nextTick } from 'vue';
import ProgressIndicator from './ProgressIndicator.vue';

async function mountProgressIndicator(props: Record<string, unknown> = {}) {
  const container = document.createElement('div');
  document.body.appendChild(container);

  const app = createApp({
    render() {
      return h(ProgressIndicator, props);
    },
  });

  app.mount(container);
  await nextTick();

  return {
    app,
    container,
    root: container.querySelector('.m3-progress-indicator') as HTMLElement | null,
  };
}

describe('ProgressIndicator', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders a determinate linear progressbar by default', async () => {
    const { app, container, root } = await mountProgressIndicator();

    expect(root).not.toBeNull();
    expect(root?.dataset.variant).toBe('linear');
    expect(root?.dataset.behavior).toBe('determinate');
    expect(root?.dataset.shape).toBe('flat');
    expect(root?.getAttribute('role')).toBe('progressbar');
    expect(root?.getAttribute('aria-valuemin')).toBe('0');
    expect(root?.getAttribute('aria-valuemax')).toBe('100');
    expect(root?.getAttribute('aria-valuenow')).toBe('0');
    expect(container.querySelector('[data-part="segments"]')).toBeNull();
    expect(container.querySelector('[data-part="gap"]')).toBeNull();
    expect(container.querySelector('[data-part="stop-indicator"]')).not.toBeNull();

    app.unmount();
  });

  it('clamps determinate values to the provided range', async () => {
    const { app, root } = await mountProgressIndicator({
      min: 10,
      max: 30,
      value: 200,
    });

    expect(root?.getAttribute('aria-valuenow')).toBe('30');
    expect(root?.style.getPropertyValue('--md-progress-indicator-active-ratio')).toBe('1');

    app.unmount();
  });

  it('omits determinate aria values for indeterminate progress', async () => {
    const { app, container, root } = await mountProgressIndicator({
      behavior: 'indeterminate',
    });

    expect(root?.getAttribute('aria-valuenow')).toBeNull();
    expect(root?.getAttribute('aria-valuemin')).toBeNull();
    expect(root?.getAttribute('aria-valuemax')).toBeNull();
    expect(root?.getAttribute('aria-busy')).toBe('true');
    expect(container.querySelector('[data-part="stop-indicator"]')).toBeNull();
    expect(container.querySelector('[data-part="active-indicator"]')?.className).toContain('indeterminate');

    app.unmount();
  });

  it('supports circular wavy progress with custom size and thickness', async () => {
    const { app, container, root } = await mountProgressIndicator({
      variant: 'circular',
      shape: 'wavy',
      value: 75,
      size: 64,
      thickness: 6,
    });

    const activeIndicator = container.querySelector('[data-part="active-indicator"]') as SVGPathElement | null;

    expect(activeIndicator).not.toBeNull();
    expect(activeIndicator?.tagName).toBe('path');
    expect(activeIndicator?.getAttribute('stroke-dasharray')).toBe('75 25');
    expect(root?.style.getPropertyValue('--md-progress-indicator-resolved-size')).toBe('4rem');
    expect(root?.style.getPropertyValue('--md-progress-indicator-resolved-thickness')).toBe('0.375rem');

    app.unmount();
  });

  it('uses partial dash lengths for circular determinate progress', async () => {
    const { app, container } = await mountProgressIndicator({
      variant: 'circular',
      value: 25,
    });

    const track = container.querySelector('[data-part="track"]') as SVGCircleElement | null;
    const activeIndicator = container.querySelector('[data-part="active-indicator"]') as SVGCircleElement | null;

    expect(track).not.toBeNull();
    expect(activeIndicator).not.toBeNull();
    expect(activeIndicator?.getAttribute('stroke-dasharray')).toBe('25 75');
    expect(track?.getAttribute('stroke-dasharray')).toBe('72.5 27.5');
    expect(track?.getAttribute('stroke-dashoffset')).toBe('-27.5');

    app.unmount();
  });
});
