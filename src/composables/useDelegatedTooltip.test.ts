// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { createApp, h, nextTick, ref } from 'vue';
import Tooltip from '@/components/Tooltip/Tooltip.vue';
import { useDelegatedTooltip, type DelegatedTooltipSlot } from './useDelegatedTooltip';

type DelegatedState = ReturnType<typeof useDelegatedTooltip<string>>;

let app: ReturnType<typeof createApp> | undefined;
let state: DelegatedState | undefined;

function mountDelegatedTooltip() {
  app = createApp({
    setup() {
      const container = ref<HTMLDivElement>();
      state = useDelegatedTooltip(
        container,
        'delegated-test-tooltip',
        (anchor) => anchor.dataset.tooltip ?? null,
        (target) => {
          if (!(target instanceof Element)) {
            return null;
          }

          const anchor = target.closest<HTMLElement>('[data-tooltip]');
          return anchor;
        },
        3,
      );

      return () =>
        h('div', { ref: container }, [
          h('button', { id: 'first', 'data-tooltip': 'First' }, 'First'),
          h('button', { id: 'second', 'data-tooltip': 'Second' }, 'Second'),
          ...state!.tooltipSlots.map((slot: DelegatedTooltipSlot<string>) =>
            h(Tooltip, { id: slot.id, key: slot.id }, { default: () => slot.tooltip ?? '' }),
          ),
        ]);
    },
  });

  const host = document.createElement('div');
  document.body.appendChild(host);
  app.mount(host);
  return host;
}

async function flushDelegatedUpdate() {
  await nextTick();
  await nextTick();
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    callback(0);
    return 1;
  });
});

afterEach(() => {
  app?.unmount();
  app = undefined;
  state = undefined;
  vi.runOnlyPendingTimers();
  vi.restoreAllMocks();
  vi.useRealTimers();
  document.body.innerHTML = '';
});

describe('useDelegatedTooltip', () => {
  it('shows immediately on the first pointer hover', async () => {
    const host = mountDelegatedTooltip();
    await nextTick();
    const first = host.querySelector<HTMLElement>('#first')!;

    first.dispatchEvent(new MouseEvent('pointerover', { bubbles: true }));
    await flushDelegatedUpdate();

    expect(state!.tooltipSlots[0]?.state).toBe('open');
    expect(host.querySelector(`#${state!.tooltipSlots[0]?.id}`)?.textContent).toBe('First');
  });

  it('debounces only a pointer switch while keeping the current tooltip open', async () => {
    const host = mountDelegatedTooltip();
    await nextTick();
    const first = host.querySelector<HTMLElement>('#first')!;
    const second = host.querySelector<HTMLElement>('#second')!;

    first.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    await flushDelegatedUpdate();
    second.dispatchEvent(new MouseEvent('pointerover', { bubbles: true }));

    expect(state!.tooltipSlots[0]?.state).toBe('open');
    expect(state!.tooltipSlots[1]?.state).toBe('idle');

    vi.advanceTimersByTime(20);
    await flushDelegatedUpdate();

    expect(state!.tooltipSlots[0]?.state).toBe('closing');
    expect(state!.tooltipSlots[1]?.state).toBe('open');
  });

  it('cancels a pending pointer switch when the pointer returns to the current anchor', async () => {
    const host = mountDelegatedTooltip();
    await nextTick();
    const first = host.querySelector<HTMLElement>('#first')!;
    const second = host.querySelector<HTMLElement>('#second')!;

    first.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    await flushDelegatedUpdate();
    second.dispatchEvent(new MouseEvent('pointerover', { bubbles: true }));
    first.dispatchEvent(new MouseEvent('pointerover', { bubbles: true }));
    await flushDelegatedUpdate();
    vi.advanceTimersByTime(20);

    expect(state!.tooltipSlots[0]?.state).toBe('open');
    expect(state!.tooltipSlots[1]?.state).toBe('idle');
  });

  it('keeps a bounded slot pool while switching active anchors', async () => {
    const host = mountDelegatedTooltip();
    await nextTick();
    const first = host.querySelector<HTMLElement>('#first')!;
    const second = host.querySelector<HTMLElement>('#second')!;

    expect(host.querySelectorAll('.m3-tooltip')).toHaveLength(3);
    first.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    await flushDelegatedUpdate();

    expect(state!.tooltipSlots[0]?.state).toBe('open');
    expect(host.querySelector(`#${state!.tooltipSlots[0]?.id}`)?.textContent).toBe('First');
    expect(first.getAttribute('aria-describedby')).toBe(state!.tooltipSlots[0]?.id);
    expect(first.style.getPropertyValue('anchor-name')).toContain(state!.tooltipSlots[0]?.anchorName);

    second.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    await flushDelegatedUpdate();

    expect(state!.tooltipSlots.filter((slot) => slot.state !== 'idle')).toHaveLength(2);
    expect(host.querySelector(`#${state!.tooltipSlots[1]?.id}`)?.textContent).toBe('Second');
    expect(second.getAttribute('aria-describedby')).toBe(state!.tooltipSlots[1]?.id);

    vi.advanceTimersByTime(120);
    expect(state!.tooltipSlots[0]?.state).toBe('idle');
    expect(first.hasAttribute('aria-describedby')).toBe(false);
  });

  it('refreshes dynamic content without creating another tooltip surface', async () => {
    const host = mountDelegatedTooltip();
    await nextTick();
    const first = host.querySelector<HTMLElement>('#first')!;

    first.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    await flushDelegatedUpdate();
    const tooltipId = state!.tooltipSlots[0]!.id;
    const tooltipElement = host.querySelector(`#${tooltipId}`);

    first.dataset.tooltip = 'Updated';
    state!.refreshTooltip();
    await flushDelegatedUpdate();

    expect(host.querySelectorAll('.m3-tooltip')).toHaveLength(3);
    expect(tooltipElement?.textContent).toBe('Updated');
    expect(state!.tooltipSlots[0]?.tooltip).toBe('Updated');
  });

  it('cleans active anchors and slot controllers when the owner unmounts', async () => {
    const host = mountDelegatedTooltip();
    await nextTick();
    const first = host.querySelector<HTMLElement>('#first')!;

    first.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    await flushDelegatedUpdate();
    expect(first.style.getPropertyValue('anchor-name')).not.toBe('');

    app!.unmount();
    expect(first.style.getPropertyValue('anchor-name')).toBe('');
    expect(first.hasAttribute('aria-describedby')).toBe(false);
  });
});
