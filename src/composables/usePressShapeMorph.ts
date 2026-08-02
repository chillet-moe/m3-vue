import { getPressShapeMorphRuntime } from '@/internal/pressShapeMorph';
import { computed, ref, toValue } from 'vue';
import type { MaybeRefOrGetter, VNode } from 'vue';
import { usePressedState } from './pressedState';

export type UsePressShapeMorphOptions = {
  /** Whether the press morph interaction is enabled. */
  enabled?: MaybeRefOrGetter<boolean | undefined>;

  /** Whether interactions should be blocked as disabled. */
  disabled?: MaybeRefOrGetter<boolean | undefined>;

  /** Minimum time in milliseconds to keep the pressed state visible. */
  minDuration?: number;
};

export type PressShapeMorphAttrs = {
  'data-pressed': 'true' | 'false';
  onVnodeMounted: (vnode: VNode) => void;
  onVnodeUpdated: (vnode: VNode) => void;
  onVnodeBeforeUnmount: () => void;
};

export function usePressShapeMorph(options: UsePressShapeMorphOptions = {}) {
  const enabled = computed(() => toValue(options.enabled) ?? true);
  const disabled = computed(() => toValue(options.disabled) ?? false);
  const { pressed: rawPressed, onPointerDown, onPointerUp, onPointerCancel } = usePressedState(options.minDuration);
  const delegatedPressed = ref(false);
  let registeredElement: HTMLElement | null = null;
  let unregister: (() => void) | null = null;

  const pressed = computed(() => enabled.value && !disabled.value && (rawPressed.value || delegatedPressed.value));

  const registration = () => ({
    disabled: () => disabled.value,
    enabled: () => enabled.value,
    minDuration: options.minDuration ?? 200,
    setPressed: (value: boolean) => {
      delegatedPressed.value = value;
    },
  });

  const handleVnodeMounted = (vnode: VNode) => {
    const element = vnode.el;
    if (!(element instanceof HTMLElement)) return;

    registeredElement = element;
    unregister = getPressShapeMorphRuntime(element.ownerDocument).register(element, registration());
  };

  const handleVnodeUpdated = (vnode: VNode) => {
    const element = vnode.el;
    if (!(element instanceof HTMLElement) || registeredElement !== element) return;

    getPressShapeMorphRuntime(element.ownerDocument).update(element, registration());
  };

  const handleVnodeBeforeUnmount = () => {
    unregister?.();
    unregister = null;
    registeredElement = null;
  };

  const guardDisabledInteraction = (event: Event) => {
    if (!disabled.value) {
      return false;
    }

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    return true;
  };

  const handlePointerDown = (event: PointerEvent) => {
    if (guardDisabledInteraction(event)) return;
    if (!enabled.value) return;

    onPointerDown(event);
  };

  const handlePointerUp = (event: PointerEvent) => {
    onPointerUp(event);
    guardDisabledInteraction(event);
  };

  const handlePointerCancel = (event: PointerEvent) => {
    onPointerCancel(event);
    guardDisabledInteraction(event);
  };

  const handleClick = (event: MouseEvent) => {
    guardDisabledInteraction(event);
  };

  const pressShapeMorphAttrs = computed<PressShapeMorphAttrs>(() => ({
    'data-pressed': pressed.value ? 'true' : 'false',
    onVnodeMounted: handleVnodeMounted,
    onVnodeUpdated: handleVnodeUpdated,
    onVnodeBeforeUnmount: handleVnodeBeforeUnmount,
  }));

  return {
    pressed,
    pressShapeMorphAttrs,
    guardDisabledInteraction,
    onClick: handleClick,
    onPointerDown: handlePointerDown,
    onPointerUp: handlePointerUp,
    onPointerCancel: handlePointerCancel,
  };
}
