import '@/styles/themes/default.css';
import { createApp, h, nextTick, ref, type App } from 'vue';
import { Dialog } from '@/index';

import './style.css';

const open = ref(true);
let closeStartedAt = 0;
let closedElapsed: number | null = null;

window.__nativeDialogExitFixture = {
  async close() {
    closeStartedAt = performance.now();
    open.value = false;
    await nextTick();

    const dialog = document.querySelector<HTMLDialogElement>('.m3-dialog')!;
    const animations = dialog.getAnimations({ subtree: true });

    return {
      hasActionsTransition: animations.some(
        (animation) =>
          (animation.effect as KeyframeEffect | null)?.target === dialog.querySelector('.m3-dialog-actions'),
      ),
      hasBackdropTransition: animations.some(
        (animation) => (animation.effect as KeyframeEffect | null)?.pseudoElement === '::backdrop',
      ),
    };
  },
  getClosedElapsed() {
    return closedElapsed;
  },
  async unmountWithPausedExit() {
    open.value = true;
    await nextTick();
    const dialog = document.querySelector<HTMLDialogElement>('.m3-dialog')!;
    const surface = dialog.querySelector<HTMLElement>('.m3-dialog-surface')!;
    const motion = surface.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1_000, iterations: Infinity });
    motion.pause();

    closedElapsed = null;
    open.value = false;
    await nextTick();
    await new Promise<void>((resolve) => setTimeout(resolve, 750));
    if (closedElapsed !== null) throw new Error('The dialog completed its exit while owned motion was paused');

    // Retarget the animation so the consumer can keep it without keeping the dialog as its target.
    const parking = document.createElement('div');
    document.body.append(parking);
    (motion.effect as KeyframeEffect).target = parking;
    const target = new WeakRef(dialog);
    app?.unmount();
    // The development reload callback can still hold the mounted vnode.
    app = undefined;
    return { target, motion };
  },
};

let app: App<Element> | undefined = createApp({
  setup() {
    return () =>
      h(
        Dialog,
        {
          open: open.value,
          'onUpdate:open': (nextOpen: boolean) => {
            open.value = nextOpen;
          },
          onClosed: () => {
            closedElapsed = performance.now() - closeStartedAt;
          },
        },
        {
          headline: () => 'Exit lifecycle',
          default: () => h('span', { class: 'infinite-slot-animation' }, 'Animated slot content'),
          actions: () => h('span', 'Action'),
        },
      );
  },
});
app.mount('#app');

declare global {
  interface Window {
    __nativeDialogExitFixture: {
      close(): Promise<{
        hasActionsTransition: boolean;
        hasBackdropTransition: boolean;
      }>;
      getClosedElapsed(): number | null;
      unmountWithPausedExit(): Promise<{ target: WeakRef<HTMLDialogElement>; motion: Animation }>;
    };
  }
}
