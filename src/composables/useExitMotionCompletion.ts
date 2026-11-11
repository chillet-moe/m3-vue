import { onUnmounted, type Ref } from 'vue';

type ElementRef<T extends HTMLElement> = Readonly<Ref<T | null | undefined>>;

type AnimationQueryOptions = {
  pseudoElement?: string;
  subtree?: boolean;
};

type ExitCycle = { finish?: () => void };

// Keep the promise reaction's scope separate from the component and its DOM.
function waitForExitAnimations(animations: Set<Animation>, exit: ExitCycle) {
  let remaining = animations.size;
  const onAnimationSettled = () => {
    remaining -= 1;
    if (remaining !== 0) return;

    // Match the completion microtask that followed Promise.allSettled().
    void Promise.resolve().then(() => {
      const finish = exit.finish;
      exit.finish = undefined;
      finish?.();
    });
  };

  // Counting completions avoids retaining fulfilled Animation values.
  for (const animation of animations) {
    void Promise.resolve(animation.finished).then(onAnimationSettled, onAnimationSettled);
  }
}

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
  let currentExit: ExitCycle | undefined;
  let unmounted = false;

  const cancel = () => {
    if (currentExit) currentExit.finish = undefined;
    currentExit = undefined;
  };

  const begin = (payload: T, root = options.rootRef.value) => {
    if (!root || currentExit || unmounted) {
      return;
    }

    const exit: ExitCycle = {};
    currentExit = exit;

    queueMicrotask(() => {
      if (currentExit !== exit) return;

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

      if (currentExit !== exit) return;

      const finish = () => {
        if (currentExit !== exit || options.open.value || options.rootRef.value !== root) return;

        // The native toggle event can arrive after a zero-duration exit.
        // Keep this close cycle completed until cancel() starts a new one.
        options.onComplete?.(payload);
      };

      if (animations.size === 0) {
        finish();
        return;
      }

      exit.finish = finish;
      waitForExitAnimations(animations, exit);
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
