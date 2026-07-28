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

export interface FieldContext {
  /** Default block-start clearance reserved for floating labels in this component subtree. */
  labelClearance?: MaybeRef<string | undefined>;
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
