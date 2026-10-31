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
import type { TextFieldSize } from './TextField.vue';
import type { M3Shape } from '@/styles/shape';

export type FieldLabelBehavior = 'floating' | 'external';

export interface FieldContext {
  /** Whether fields render a floating label or leave visible labeling to the parent. */
  labelBehavior?: MaybeRef<FieldLabelBehavior | undefined>;
  /** Default size for single-line TextField and Select controls. */
  size?: MaybeRef<TextFieldSize | undefined>;
  /** Default block-start clearance reserved for floating labels in this component subtree. */
  labelClearance?: MaybeRef<string | undefined>;
  /** Default shape for text fields in this component subtree. */
  shape?: MaybeRef<M3Shape | undefined>;
}

export const fieldContextKey: InjectionKey<FieldContext> = Symbol('FieldContext');

export function useFieldLabelClearanceStyle(
  labelClearance: MaybeRefOrGetter<string | undefined>,
  labelBehavior: MaybeRefOrGetter<FieldLabelBehavior>,
) {
  const fieldContext = inject(fieldContextKey, undefined);
  const effectiveLabelClearance = computed(() => toValue(labelClearance) ?? unref(fieldContext?.labelClearance));

  return computed<CSSProperties | undefined>(() => {
    if (toValue(labelBehavior) === 'external' || effectiveLabelClearance.value === undefined) return undefined;
    return { marginBlockStart: effectiveLabelClearance.value };
  });
}

export function useFieldSize(size: MaybeRefOrGetter<TextFieldSize | undefined>) {
  const fieldContext = inject(fieldContextKey, undefined);
  return computed<TextFieldSize>(() => toValue(size) ?? unref(fieldContext?.size) ?? 'medium');
}

export function useFieldLabelBehavior(behavior: MaybeRefOrGetter<FieldLabelBehavior | undefined>) {
  const context = inject(fieldContextKey, undefined);
  return computed<FieldLabelBehavior>(() => toValue(behavior) ?? unref(context?.labelBehavior) ?? 'floating');
}
