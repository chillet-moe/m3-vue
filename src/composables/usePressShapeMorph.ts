import { computed, toValue } from 'vue';
import type { MaybeRefOrGetter } from 'vue';
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
  onClick: (event: MouseEvent) => void;
  onPointerdown: (event: PointerEvent) => void;
  onPointerup: (event: PointerEvent) => void;
  onPointercancel: (event: PointerEvent) => void;
};

export function usePressShapeMorph(options: UsePressShapeMorphOptions = {}) {
  const enabled = computed(() => toValue(options.enabled) ?? true);
  const disabled = computed(() => toValue(options.disabled) ?? false);
  const { pressed: rawPressed, onPointerDown, onPointerUp, onPointerCancel } = usePressedState(options.minDuration);

  const pressed = computed(() => enabled.value && !disabled.value && rawPressed.value);

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
    onClick: handleClick,
    onPointerdown: handlePointerDown,
    onPointerup: handlePointerUp,
    onPointercancel: handlePointerCancel,
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
