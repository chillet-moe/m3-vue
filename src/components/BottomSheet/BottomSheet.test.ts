// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it, vi } from 'vite-plus/test';
import { createApp, h, nextTick, ref } from 'vue';
import BottomSheet from './BottomSheet.vue';

function installDialogPolyfill() {
  const prototype = HTMLDialogElement.prototype as HTMLDialogElement & {
    showModal?: () => void;
    close?: (returnValue?: string) => void;
  };

  if (typeof prototype.showModal !== 'function') {
    Object.defineProperty(prototype, 'showModal', {
      configurable: true,
      value: function (this: HTMLDialogElement) {
        if (this.open) {
          return;
        }

        this.setAttribute('open', '');
      },
    });
  }

  if (typeof prototype.close !== 'function') {
    Object.defineProperty(prototype, 'close', {
      configurable: true,
      value: function (this: HTMLDialogElement, returnValue = '') {
        if (!this.open) {
          return;
        }

        this.returnValue = returnValue;
        this.removeAttribute('open');
        this.dispatchEvent(new Event('close'));
      },
    });
  }
}

beforeAll(() => {
  installDialogPolyfill();
});

afterEach(() => {
  document.body.innerHTML = '';
  document.body.removeAttribute('style');
  document.documentElement.removeAttribute('style');
});

function createPointerEvent(
  type: string,
  init: { clientY: number; pointerId?: number; button?: number; pointerType?: string },
) {
  const event = new Event(type, { bubbles: true, cancelable: true }) as PointerEvent;

  Object.defineProperties(event, {
    button: { value: init.button ?? 0 },
    clientY: { value: init.clientY },
    isPrimary: { value: true },
    pointerId: { value: init.pointerId ?? 1 },
    pointerType: { value: init.pointerType ?? 'mouse' },
  });

  return event;
}

function createTouchEvent(type: string, init: { clientY: number }) {
  const touch = { clientY: init.clientY };
  const event = new Event(type, { bubbles: true, cancelable: true }) as TouchEvent;

  Object.defineProperties(event, {
    changedTouches: { value: [touch] },
    touches: { value: type === 'touchend' || type === 'touchcancel' ? [] : [touch] },
  });

  return event;
}

function createTouchPointerCancelEvent() {
  return createPointerEvent('pointercancel', { clientY: 310, pointerType: 'touch' });
}

describe('BottomSheet', () => {
  it('syncs v-model:open with the native dialog open state', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const open = ref(true);
    const app = createApp({
      setup() {
        return () =>
          h(
            BottomSheet,
            {
              open: open.value,
              'onUpdate:open': (value: boolean) => {
                open.value = value;
              },
            },
            {
              headline: () => 'Filters',
              default: () => 'Choose visible content.',
            },
          );
      },
    });

    app.mount(container);
    await nextTick();

    const dialog = container.querySelector('dialog') as HTMLDialogElement | null;
    const dragHandle = container.querySelector('[data-part="drag-handle"]');

    expect(dialog).not.toBeNull();
    expect(dialog?.open).toBe(true);
    expect(dialog?.dataset.scope).toBe('bottom-sheet');
    expect(dragHandle).not.toBeNull();
    expect(document.body.style.overflow).toBe('hidden');
    expect(document.body.style.position).toBe('fixed');
    expect(document.documentElement.style.overflow).toBe('hidden');

    open.value = false;
    await nextTick();

    expect(dialog?.open).toBe(false);
    expect(document.body.style.overflow).toBe('');
    expect(document.body.style.position).toBe('');
    expect(document.documentElement.style.overflow).toBe('');

    app.unmount();
  });

  it('updates the model and emits the return value when closed', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const open = ref(true);
    const onClose = vi.fn();
    const app = createApp({
      setup() {
        return () =>
          h(BottomSheet, {
            open: open.value,
            'onUpdate:open': (value: boolean) => {
              open.value = value;
            },
            onClose,
          });
      },
    });

    app.mount(container);
    await nextTick();

    const dialog = container.querySelector('dialog') as HTMLDialogElement | null;

    dialog?.close('applied');
    await nextTick();

    expect(open.value).toBe(false);
    expect(onClose).toHaveBeenCalledWith('applied');
    expect(document.body.style.overflow).toBe('');
    expect(document.documentElement.style.overflow).toBe('');

    app.unmount();
  });

  it('supports backdrop closing and custom max height', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const open = ref(true);
    const app = createApp({
      setup() {
        return () =>
          h(BottomSheet, {
            open: open.value,
            maxHeight: '70vh',
            showDragHandle: false,
            'onUpdate:open': (value: boolean) => {
              open.value = value;
            },
          });
      },
    });

    app.mount(container);
    await nextTick();

    const dialog = container.querySelector('dialog') as HTMLDialogElement | null;

    expect(dialog?.dataset.hasDragHandle).toBe('false');
    expect(dialog?.style.getPropertyValue('--md-bottom-sheet-max-height')).toBe('70vh');

    dialog?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await nextTick();

    expect(open.value).toBe(false);

    app.unmount();
  });

  it('closes when dragged down past the distance threshold', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const open = ref(true);
    const app = createApp({
      setup() {
        return () =>
          h(BottomSheet, {
            open: open.value,
            'onUpdate:open': (value: boolean) => {
              open.value = value;
            },
          });
      },
    });

    app.mount(container);
    await nextTick();

    const dialog = container.querySelector('dialog') as HTMLDialogElement | null;
    const surface = container.querySelector('[data-part="surface"]') as HTMLElement | null;

    expect(surface).not.toBeNull();

    surface?.dispatchEvent(createPointerEvent('pointerdown', { clientY: 300 }));
    surface?.dispatchEvent(createPointerEvent('pointermove', { clientY: 420 }));
    surface?.dispatchEvent(createPointerEvent('pointerup', { clientY: 420 }));
    await nextTick();

    expect(open.value).toBe(false);
    expect(dialog?.open).toBe(false);

    app.unmount();
  });

  it('keeps touch dragging active when the browser cancels pointer events', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const open = ref(true);
    const app = createApp({
      setup() {
        return () =>
          h(BottomSheet, {
            open: open.value,
            'onUpdate:open': (value: boolean) => {
              open.value = value;
            },
          });
      },
    });

    app.mount(container);
    await nextTick();

    const dialog = container.querySelector('dialog') as HTMLDialogElement | null;
    const surface = container.querySelector('[data-part="surface"]') as HTMLElement | null;

    surface?.dispatchEvent(createTouchEvent('touchstart', { clientY: 300 }));
    surface?.dispatchEvent(createTouchEvent('touchmove', { clientY: 330 }));
    surface?.dispatchEvent(createTouchPointerCancelEvent());
    surface?.dispatchEvent(createTouchEvent('touchmove', { clientY: 430 }));
    surface?.dispatchEvent(createTouchEvent('touchend', { clientY: 430 }));
    await nextTick();

    expect(open.value).toBe(false);
    expect(dialog?.open).toBe(false);

    app.unmount();
  });

  it('resists upward dragging and springs back when released', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(BottomSheet, {
        open: true,
      }),
    );

    app.mount(container);
    await nextTick();

    const dialog = container.querySelector('dialog') as HTMLDialogElement | null;
    const surface = container.querySelector('[data-part="surface"]') as HTMLElement | null;

    surface?.dispatchEvent(createPointerEvent('pointerdown', { clientY: 300 }));
    surface?.dispatchEvent(createPointerEvent('pointermove', { clientY: 240 }));
    await nextTick();

    expect(dialog?.style.getPropertyValue('--md-bottom-sheet-drag-offset')).toBe('-13.2px');
    expect(dialog?.style.getPropertyValue('--md-bottom-sheet-translate-offset')).toBe('0px');
    expect(dialog?.style.getPropertyValue('--md-bottom-sheet-background-extension')).toBe('13.2px');

    surface?.dispatchEvent(createPointerEvent('pointerup', { clientY: 240 }));
    await nextTick();

    expect(dialog?.open).toBe(true);
    expect(dialog?.style.getPropertyValue('--md-bottom-sheet-drag-offset')).toBe('0px');
    expect(dialog?.style.getPropertyValue('--md-bottom-sheet-translate-offset')).toBe('0px');
    expect(dialog?.style.getPropertyValue('--md-bottom-sheet-background-extension')).toBe('0px');

    app.unmount();
  });
});
