import { createApp, h, nextTick, ref } from 'vue';
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
};

createApp({
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
}).mount('#app');

declare global {
  interface Window {
    __nativeDialogExitFixture: {
      close(): Promise<{
        hasActionsTransition: boolean;
        hasBackdropTransition: boolean;
      }>;
      getClosedElapsed(): number | null;
    };
  }
}
