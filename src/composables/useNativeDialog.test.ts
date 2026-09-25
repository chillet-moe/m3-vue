// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { createApp, defineComponent, h, nextTick, ref } from 'vue';
import { useNativeDialog } from './useNativeDialog';

function installDialogPolyfill() {
  const prototype = HTMLDialogElement.prototype as HTMLDialogElement & {
    showModal?: () => void;
    close?: (returnValue?: string) => void;
  };

  if (typeof prototype.showModal !== 'function') {
    Object.defineProperty(prototype, 'showModal', {
      configurable: true,
      value: function (this: HTMLDialogElement) {
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

function createControlledAnimation() {
  let finish!: () => void;
  let cancel!: (reason?: unknown) => void;
  const finished = new Promise<void>((resolve, reject) => {
    finish = resolve;
    cancel = reject;
  });

  return {
    animation: { finished } as unknown as Animation,
    cancel,
    finish,
  };
}

async function mountNativeDialog() {
  const container = document.createElement('div');
  const open = ref(true);
  const onClose = vi.fn();
  const onClosed = vi.fn();
  let dialogRef = ref<HTMLDialogElement | null>(null);
  let surfaceRef = ref<HTMLElement | null>(null);
  let ownedChildRef = ref<HTMLElement | null>(null);
  let slotChildRef = ref<HTMLElement | null>(null);

  const app = createApp(
    defineComponent({
      setup() {
        dialogRef = ref<HTMLDialogElement | null>(null);
        surfaceRef = ref<HTMLElement | null>(null);
        ownedChildRef = ref<HTMLElement | null>(null);
        slotChildRef = ref<HTMLElement | null>(null);
        const { onClose: handleClose } = useNativeDialog({
          dialogRef,
          open,
          exitElements: () => [surfaceRef.value, ownedChildRef.value],
          onClose,
          onClosed,
        });

        return () =>
          h('dialog', { ref: dialogRef, onClose: handleClose }, [
            h('div', { ref: surfaceRef }, [h('div', { ref: ownedChildRef }), h('div', { ref: slotChildRef })]),
          ]);
      },
    }),
  );

  document.body.appendChild(container);
  app.mount(container);
  await nextTick();

  return {
    app,
    dialog: dialogRef.value!,
    onClose,
    onClosed,
    open,
    ownedChild: ownedChildRef.value!,
    slotChild: slotChildRef.value!,
    surface: surfaceRef.value!,
  };
}

beforeAll(installDialogPolyfill);

afterEach(() => {
  document.body.innerHTML = '';
  document.body.removeAttribute('style');
  document.body.removeAttribute('data-m3-scroll-lock');
  document.documentElement.removeAttribute('style');
});

describe('useNativeDialog', () => {
  it('waits for owned elements and the backdrop without waiting for slot animations', async () => {
    const mounted = await mountNativeDialog();
    const rootExit = createControlledAnimation();
    const surfaceExit = createControlledAnimation();
    const ownedChildExit = createControlledAnimation();
    const backdropExit = createControlledAnimation();
    const slotAnimation = createControlledAnimation();

    Object.defineProperty(mounted.dialog, 'getAnimations', {
      configurable: true,
      value: (options?: { pseudoElement?: string; subtree?: boolean }) => {
        if (options?.pseudoElement === '::backdrop') {
          return [backdropExit.animation];
        }

        if (options?.subtree) {
          return [
            rootExit.animation,
            surfaceExit.animation,
            ownedChildExit.animation,
            backdropExit.animation,
            slotAnimation.animation,
          ];
        }

        return [rootExit.animation];
      },
    });
    Object.defineProperty(mounted.surface, 'getAnimations', {
      configurable: true,
      value: () => [surfaceExit.animation],
    });
    Object.defineProperty(mounted.ownedChild, 'getAnimations', {
      configurable: true,
      value: () => [ownedChildExit.animation],
    });
    Object.defineProperty(mounted.slotChild, 'getAnimations', {
      configurable: true,
      value: () => [slotAnimation.animation],
    });

    mounted.dialog.close('saved');

    expect(mounted.onClose).toHaveBeenCalledWith('saved', expect.any(Event));
    expect(mounted.onClosed).not.toHaveBeenCalled();

    await Promise.resolve();
    rootExit.finish();
    surfaceExit.finish();
    ownedChildExit.finish();
    await rootExit.animation.finished;
    await Promise.resolve();
    expect(mounted.onClosed).not.toHaveBeenCalled();

    backdropExit.finish();
    await backdropExit.animation.finished;
    await Promise.resolve();
    expect(mounted.onClosed).toHaveBeenCalledOnce();
    expect(mounted.onClosed).toHaveBeenCalledWith('saved');

    mounted.app.unmount();
  });

  it('finds backdrop animations through the subtree fallback', async () => {
    const mounted = await mountNativeDialog();
    const backdropExit = createControlledAnimation();
    Object.defineProperty(backdropExit.animation, 'effect', {
      configurable: true,
      value: { pseudoElement: '::backdrop' },
    });

    Object.defineProperty(mounted.dialog, 'getAnimations', {
      configurable: true,
      value: (options?: { pseudoElement?: string; subtree?: boolean }) => {
        if (options?.pseudoElement) {
          throw new TypeError('pseudoElement is unsupported');
        }

        return options?.subtree ? [backdropExit.animation] : [];
      },
    });

    mounted.dialog.close('fallback');
    await Promise.resolve();
    expect(mounted.onClosed).not.toHaveBeenCalled();

    backdropExit.finish();
    await backdropExit.animation.finished;
    await Promise.resolve();

    expect(mounted.onClosed).toHaveBeenCalledWith('fallback');
    mounted.app.unmount();
  });

  it('treats canceled exit animations as completed', async () => {
    const mounted = await mountNativeDialog();
    const exit = createControlledAnimation();

    Object.defineProperty(mounted.surface, 'getAnimations', {
      configurable: true,
      value: () => [exit.animation],
    });

    mounted.dialog.close('canceled-animation');
    await Promise.resolve();
    exit.cancel(new DOMException('Canceled', 'AbortError'));
    await Promise.resolve();
    await Promise.resolve();

    expect(mounted.onClosed).toHaveBeenCalledWith('canceled-animation');
    mounted.app.unmount();
  });

  it('invalidates an old close cycle when reopened', async () => {
    const mounted = await mountNativeDialog();
    const firstExit = createControlledAnimation();

    Object.defineProperty(mounted.surface, 'getAnimations', {
      configurable: true,
      value: () => [firstExit.animation],
    });

    mounted.dialog.close('first');
    await Promise.resolve();

    mounted.open.value = true;
    await nextTick();
    firstExit.finish();
    await firstExit.animation.finished;
    await Promise.resolve();

    expect(mounted.dialog.open).toBe(true);
    expect(mounted.onClosed).not.toHaveBeenCalled();

    Object.defineProperty(mounted.surface, 'getAnimations', {
      configurable: true,
      value: () => [],
    });
    mounted.dialog.close('second');
    await Promise.resolve();
    await Promise.resolve();

    expect(mounted.onClosed).toHaveBeenCalledOnce();
    expect(mounted.onClosed).toHaveBeenCalledWith('second');
    mounted.app.unmount();
  });

  it('emits closed only once for repeated close events in one cycle', async () => {
    const mounted = await mountNativeDialog();
    const exit = createControlledAnimation();

    Object.defineProperty(mounted.surface, 'getAnimations', {
      configurable: true,
      value: () => [exit.animation],
    });

    mounted.dialog.close('once');
    mounted.dialog.dispatchEvent(new Event('close'));
    await Promise.resolve();
    exit.finish();
    await exit.animation.finished;
    await Promise.resolve();

    expect(mounted.onClosed).toHaveBeenCalledOnce();
    expect(mounted.onClosed).toHaveBeenCalledWith('once');
    mounted.app.unmount();
  });

  it('does not report closed after the owner unmounts', async () => {
    const mounted = await mountNativeDialog();
    const exit = createControlledAnimation();

    Object.defineProperty(mounted.surface, 'getAnimations', {
      configurable: true,
      value: () => [exit.animation],
    });

    mounted.dialog.close('unmounted');
    await Promise.resolve();
    mounted.app.unmount();
    exit.finish();
    await exit.animation.finished;
    await Promise.resolve();

    expect(mounted.onClosed).not.toHaveBeenCalled();
  });
});
