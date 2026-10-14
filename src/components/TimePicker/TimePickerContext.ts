import type { InjectionKey, MaybeRef } from 'vue';
import type { TimePickerProps } from './TimePicker.vue';

/** Appearance or interaction defaults for descendant TimePicker components. */
export interface TimePickerContext {
  format?: MaybeRef<TimePickerProps['format']>;
  inputMode?: MaybeRef<TimePickerProps['inputMode']>;
}

export const timePickerContextKey: InjectionKey<TimePickerContext> = Symbol('TimePickerContext');
