import { onUnmounted, type Ref } from 'vue';

type ElementRef<T extends HTMLElement> = Readonly<Ref<T | null | undefined>>;

type AnimationQueryOptions = {
  pseudoElement?: string;
  subtree?: boolean;
};

export type UseExitMotionCompletionOptions<T, TElement extends HTMLElement> = {
  rootRef: ElementRef<TElement>;
  open: Readonly<Ref<boolean>>;
  ownedElements?: () => readonly (HTMLElement | null | undefined)[];
  pseudoElements?: readonly string[];
  onComplete?: (payload: T) => void;
};

export function useExitMotionCompletion<T, TElement extends HTMLElement = HTMLElement>(
  options: UseExitMotionCompletionOptions<T, TElement>,
) {
  let sequence = 0;
  let exitPending = false;
  let unmounted = false;

  const cancel = () => {
    sequence += 1;
    exitPending = false;
  };

  const begin = (payload: T, root = options.rootRef.value) => {
    if (!root || exitPending) {
      return;
    }

    exitPending = true;
    const currentSequence = ++sequence;

    queueMicrotask(() => {
      const elements = [root, ...(options.ownedElements?.() ?? [])];
      const animations = new Set(elements.flatMap((element) => element?.getAnimations?.() ?? []));
      const pseudoElements = new Set(options.pseudoElements ?? ['::backdrop']);
      const getRootAnimations = root.getAnimations?.bind(root) as
        | ((options?: AnimationQueryOptions) => Animation[])
        | undefined;

      if (getRootAnimations && pseudoElements.size > 0) {
        for (const pseudoElement of pseudoElements) {
          try {
            for (const animation of getRootAnimations({ pseudoElement })) {
              animations.add(animation);
            }
          } catch {
            // Some browsers do not support querying a pseudo-element directly.
          }
        }

        try {
          for (const animation of getRootAnimations({ subtree: true })) {
            const pseudoElement = (animation.effect as KeyframeEffect | null)?.pseudoElement;
            if (pseudoElement && pseudoElements.has(pseudoElement)) {
              animations.add(animation);
            }
          }
        } catch {
          // Direct pseudo-element queries above cover browsers without subtree queries.
        }
      }

      const finish = () => {
        if (unmounted || currentSequence !== sequence || options.open.value || options.rootRef.value !== root) {
          return;
        }

        // The native toggle event can arrive after a zero-duration exit.
        // Keep this close cycle completed until cancel() starts a new one.
        options.onComplete?.(payload);
      };

      if (animations.size === 0) {
        finish();
        return;
      }

      void Promise.allSettled([...animations].map((animation) => animation.finished)).then(finish);
    });
  };

  onUnmounted(() => {
    unmounted = true;
    cancel();
  });

  return {
    begin,
    cancel,
  };
}
