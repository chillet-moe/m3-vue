import type { InjectionKey, MaybeRef } from 'vue';
import type { DatePickerProps } from './DatePicker.vue';

/** Appearance or interaction defaults for descendant DatePicker components. */
export interface DatePickerContext {
  firstDayOfWeek?: MaybeRef<DatePickerProps['firstDayOfWeek']>;
}

export const datePickerContextKey: InjectionKey<DatePickerContext> = Symbol('DatePickerContext');
