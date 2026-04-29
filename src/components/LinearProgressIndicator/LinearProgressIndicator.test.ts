// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vite-plus/test';
import { createApp, h, nextTick, ref } from 'vue';
import LinearProgressIndicator from './LinearProgressIndicator.vue';

async function mountLinearProgressIndicator(props: Record<string, unknown> = {}) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const propsRef = ref(props);

  const app = createApp({
    render() {
      return h(LinearProgressIndicator, propsRef.value);
    },
  });

  app.mount(container);
  await nextTick();

  return {
    app,
    container,
    root: container.querySelector('.m3-linear-progress-indicator') as HTMLElement | null,
    async updateProps(nextProps: Record<string, unknown>) {
      propsRef.value = {
        ...propsRef.value,
        ...nextProps,
      };
      await nextTick();
    },
  };
}

async function nextAnimationFrame() {
  await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
}

describe('LinearProgressIndicator', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders a determinate progressbar by default', async () => {
    const { app, container, root } = await mountLinearProgressIndicator({
      value: 3,
      min: 0,
      max: 10,
      ariaLabel: 'Loading records',
    });

    expect(root).not.toBeNull();
    expect(root?.getAttribute('role')).toBe('progressbar');
    expect(root?.getAttribute('aria-label')).toBe('Loading records');
    expect(root?.getAttribute('aria-valuemin')).toBe('0');
    expect(root?.getAttribute('aria-valuemax')).toBe('10');
    expect(root?.getAttribute('aria-valuenow')).toBe('3');
    expect(root?.getAttribute('aria-valuetext')).toBe('30%');
    expect(root?.dataset.indeterminate).toBe('false');
    expect(root?.dataset.shape).toBe('flat');
    expect(root?.dataset.progressState).toBe('partial');
    expect(root?.style.getPropertyValue('--_progress')).toBe('0.3');
    expect(root?.style.getPropertyValue('--_active-track-gap-size')).toBe('var(--_track-active-indicator-gap)');
    expect(container.querySelector('[data-part="track"]')).not.toBeNull();
    expect(container.querySelector('[data-part="active-indicator"]')).not.toBeNull();
    expect(container.querySelector('[data-part="stop-indicator"]')).not.toBeNull();

    app.unmount();
  });

  it('clamps determinate values and allows custom dimensions', async () => {
    const { app, root } = await mountLinearProgressIndicator({
      value: 14,
      min: 0,
      max: 10,
      thickness: '0.5rem',
      trackGap: '0.25rem',
      stopIndicatorSize: '0.75rem',
    });

    expect(root?.getAttribute('aria-valuenow')).toBe('10');
    expect(root?.getAttribute('aria-valuetext')).toBe('100%');
    expect(root?.dataset.progressState).toBe('complete');
    expect(root?.style.getPropertyValue('--_progress')).toBe('1');
    expect(root?.style.getPropertyValue('--_active-track-gap-size')).toBe('0px');
    expect(root?.style.getPropertyValue('--md-linear-progress-indicator-track-thickness')).toBe('0.5rem');
    expect(root?.style.getPropertyValue('--md-linear-progress-indicator-track-active-indicator-gap')).toBe('0.25rem');
    expect(root?.style.getPropertyValue('--md-linear-progress-indicator-stop-indicator-size')).toBe('0.75rem');

    app.unmount();
  });

  it('animates the displayed determinate value while exposing the real value', async () => {
    const { app, root, updateProps } = await mountLinearProgressIndicator({
      value: 0,
      min: 0,
      max: 1,
    });

    await updateProps({ value: 1 });

    expect(root?.getAttribute('aria-valuenow')).toBe('1');
    expect(root?.getAttribute('aria-valuetext')).toBe('100%');
    expect(root?.style.getPropertyValue('--_progress')).toBe('0');

    await nextAnimationFrame();
    await nextAnimationFrame();
    await nextTick();

    const displayedProgress = Number(root?.style.getPropertyValue('--_progress'));
    expect(displayedProgress).toBeGreaterThan(0);
    expect(displayedProgress).not.toBe(1);

    app.unmount();
  });

  it('renders indeterminate disjoint segments without determinate aria values', async () => {
    const { app, container, root } = await mountLinearProgressIndicator({
      indeterminate: true,
      direction: 'rtl',
      ariaValueText: 'Loading',
    });

    expect(root?.dataset.indeterminate).toBe('true');
    expect(root?.dataset.direction).toBe('rtl');
    expect(root?.getAttribute('aria-valuemin')).toBeNull();
    expect(root?.getAttribute('aria-valuemax')).toBeNull();
    expect(root?.getAttribute('aria-valuenow')).toBeNull();
    expect(root?.getAttribute('aria-valuetext')).toBe('Loading');
    expect(container.querySelectorAll('.m3-linear-progress-indicator-active-indeterminate')).toHaveLength(2);
    expect(container.querySelector('[data-part="stop-indicator"]')).toBeNull();

    app.unmount();
  });

  it('can hide the stop indicator', async () => {
    const { app, container } = await mountLinearProgressIndicator({
      value: 0.4,
      stopIndicator: false,
    });

    expect(container.querySelector('[data-part="stop-indicator"]')).toBeNull();

    app.unmount();
  });

  it('renders a source-shaped wavy active indicator path', async () => {
    const { app, container, root } = await mountLinearProgressIndicator({
      value: 0.5,
      shape: 'wavy',
    });

    const wavy = container.querySelector('[data-part="active-indicator-wavy"]');
    const path = wavy?.querySelector('path');

    expect(root?.dataset.shape).toBe('wavy');
    expect(wavy).not.toBeNull();
    expect(path?.getAttribute('d')).toContain('C');

    app.unmount();
  });
});
