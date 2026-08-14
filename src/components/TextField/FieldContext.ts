import {
  computed,
  inject,
  toValue,
  unref,
  type CSSProperties,
  type InjectionKey,
  type MaybeRef,
  type MaybeRefOrGetter,
} from 'vue';
import type { M3Shape } from '@/styles/context';

export interface FieldContext {
  /** Default block-start clearance reserved for floating labels in this component subtree. */
  labelClearance?: MaybeRef<string | undefined>;
  /** Default shape for text fields in this component subtree. */
  shape?: MaybeRef<M3Shape | undefined>;
}

export const fieldContextKey: InjectionKey<FieldContext> = Symbol('FieldContext');

export function useFieldLabelClearanceStyle(labelClearance: MaybeRefOrGetter<string | undefined>) {
  const fieldContext = inject(fieldContextKey, undefined);
  const effectiveLabelClearance = computed(() => toValue(labelClearance) ?? unref(fieldContext?.labelClearance));

  return computed<CSSProperties | undefined>(() =>
    effectiveLabelClearance.value === undefined
      ? undefined
      : {
          marginBlockStart: effectiveLabelClearance.value,
        },
  );
}
