<script setup lang="ts">
import { vFocusRing } from '@/directives/FocusRing';
import { useShape, type M3Shape } from '@/styles/shape';
import { vStateLayer } from '@/components/StateLayer/state-layer';
import { computed, inject, nextTick, ref, unref, useId } from 'vue';
import { datePickerContextKey } from './DatePickerContext';
import Button from '@/components/Button/Button.vue';
import CalendarNavigation from './CalendarNavigation.vue';
import {
  type DatePickerModelValue,
  type DatePickerVariant,
  useDatePicker,
} from '@/components/DatePicker/useDatePicker';
import { usePickerPopover } from '@/composables/usePickerPopover';
import { useM3Locale } from '@/locales/context';
import './DatePicker.css';

export type { DatePickerModelValue, DatePickerVariant };

export type DatePickerProps = {
  /** Corner style; inherits the shared shape default. */
  shape?: M3Shape;
  /** Optional explicit id for the popover element. */
  id?: string;

  /** Visual and positioning mode. Auto uses docked layout until a narrow/coarse pointer viewport. */
  variant?: DatePickerVariant;

  /** CSS anchor name used to position the docked popover. */
  anchorName?: string;

  /** Element passed to showPopover as the source for focus and dismissal semantics. */
  anchorElement?: HTMLElement;

  /** Accessible label for the picker surface. */
  ariaLabel?: string;

  /** Earliest selectable date, formatted as YYYY-MM-DD. */
  min?: string;

  /** Latest selectable date, formatted as YYYY-MM-DD. */
  max?: string;

  /** BCP 47 locale used for month, weekday, and date accessibility labels. */
  locale?: string;

  /** First day of the week, where 0 is Sunday and 6 is Saturday. */
  firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6;

  /** Text for the confirmation button. */
  confirmText?: string;

  /** Text for the cancel button. */
  cancelText?: string;

  /** Date treated as today, formatted as YYYY-MM-DD. Useful for deterministic tests. */
  today?: string;
};

const props = withDefaults(defineProps<DatePickerProps>(), {
  id: undefined,
  variant: 'auto',
  anchorName: undefined,
  anchorElement: undefined,
  ariaLabel: undefined,
  min: undefined,
  max: undefined,
  locale: undefined,
  firstDayOfWeek: undefined,
  confirmText: undefined,
  cancelText: undefined,
  today: undefined,
});

const emit = defineEmits<{
  /** Fired when a date is committed to the model. */
  change: [value: DatePickerModelValue];

  /** Fired when the user cancels the draft selection. */
  cancel: [];

  /** Fired when the user confirms the draft selection. */
  confirm: [value: DatePickerModelValue];

  /** Fired after the DatePicker-owned visual exit finishes. */
  closed: [];
}>();

const modelValue = defineModel<DatePickerModelValue>();
const open = defineModel<boolean>('open', { default: false });

const generatedId = useId();
const popoverRef = ref<HTMLDivElement>();
const surfaceRef = ref<HTMLElement>();
const localeContext = useM3Locale();
const defaults = inject(datePickerContextKey, undefined);

const locale = computed(() => props.locale ?? localeContext.locale.value);
const messages = computed(() => localeContext.messages.value);
const ariaLabel = computed(() => props.ariaLabel ?? messages.value.datePicker.chooseDate);
const confirmText = computed(() => props.confirmText ?? messages.value.common.confirm);
const cancelText = computed(() => props.cancelText ?? messages.value.common.cancel);

const pickerId = computed(() => {
  return props.id ?? `m3-date-picker-${generatedId}`;
});

const popoverStyle = computed(() => {
  return props.anchorName ? { 'position-anchor': props.anchorName } : undefined;
});

const picker = useDatePicker({
  modelValue,
  min: () => props.min,
  max: () => props.max,
  today: () => props.today,
  locale,
  firstDayOfWeek: () => props.firstDayOfWeek ?? unref(defaults?.firstDayOfWeek),
  onChange: (value) => emit('change', value),
  onCancel: () => emit('cancel'),
  onConfirm: (value) => emit('confirm', value),
});

function getDateButton(date: string) {
  return surfaceRef.value?.querySelector<HTMLButtonElement>(`[data-date="${date}"]`);
}

async function focusDate(date: string) {
  await nextTick();
  getDateButton(date)?.focus();
}

async function focusActiveDate() {
  await nextTick();

  const selected = picker.selectedDate.value;
  const preferred =
    (selected && picker.calendarDays.value.some((day) => day.date === selected) ? selected : undefined) ??
    picker.calendarDays.value.find((day) => day.today && !day.disabled)?.date ??
    picker.calendarDays.value.find((day) => !day.disabled && !day.outsideMonth)?.date ??
    picker.calendarDays.value.find((day) => !day.disabled)?.date;

  if (preferred) {
    await focusDate(preferred);
  }
}

async function handleCalendarKeydown(event: KeyboardEvent, date: string) {
  const nextDate = picker.getNavigationDate(date, event.key);

  if (!nextDate) {
    return;
  }

  event.preventDefault();
  await focusDate(nextDate);
}

const popover = usePickerPopover({
  open,
  popoverRef,
  anchorElement: () => props.anchorElement,
  onBeforeOpen: () => {
    picker.resetDraftFromModel();
  },
  onAfterOpen: focusActiveDate,
  exitElements: () => [surfaceRef.value],
  onAfterClose: () => {
    picker.calendarView.value = 'days';
    emit('closed');
  },
});

function handleCancel() {
  picker.cancelDraft();
  popover.hide();
}

function handleConfirm() {
  picker.confirmDraft();
  popover.hide();
}

defineExpose({
  show: popover.show,
  hide: popover.hide,
  toggle: popover.toggle,
});
const shape = useShape(() => props.shape);
</script>

<template>
  <div
    :id="pickerId"
    ref="popoverRef"
    class="m3-date-picker"
    popover="auto"
    role="dialog"
    data-scope="date-picker"
    data-part="root"
    data-m3-shape
    :data-shape="shape"
    :data-variant="props.variant"
    :aria-label="ariaLabel"
    :style="popoverStyle"
    @toggle="popover.handlePopoverToggle"
  >
    <div ref="surfaceRef" class="m3-date-picker-surface" data-scope="date-picker" data-part="surface">
      <CalendarNavigation :picker="picker" scope="date-picker" :messages="messages.datePicker">
        <div class="m3-date-picker-calendar" data-scope="date-picker" data-part="calendar">
          <div class="m3-date-picker-weekdays" data-scope="date-picker" data-part="weekdays" aria-hidden="true">
            <span
              v-for="weekday in picker.weekdayLabels.value"
              :key="weekday.key"
              class="m3-date-picker-weekday"
              data-scope="date-picker"
              data-part="weekday"
              >{{ weekday.label }}</span
            >
          </div>

          <div
            role="grid"
            class="m3-date-picker-grid"
            data-scope="date-picker"
            data-part="grid"
            :aria-label="picker.calendarLabel.value"
          >
            <button
              v-state-layer
              v-for="(day, index) in picker.calendarDays.value"
              :key="day.date"
              type="button"
              role="gridcell"
              v-focus-ring
              class="m3-date-picker-day m3-state-layer"
              data-scope="date-picker"
              data-part="day"
              :data-date="day.date"
              :data-selected="day.selected ? 'true' : undefined"
              :data-today="day.today ? 'true' : undefined"
              :data-outside-month="day.outsideMonth ? 'true' : undefined"
              :disabled="day.disabled"
              :aria-selected="day.selected ? 'true' : 'false'"
              :aria-current="day.today ? 'date' : undefined"
              :aria-label="picker.calendarDayLabels.value[index]"
              @click="picker.selectDate(day.date)"
              @keydown="handleCalendarKeydown($event, day.date)"
            >
              {{ day.label }}
            </button>
          </div>
        </div>
      </CalendarNavigation>

      <div class="m3-date-picker-actions" data-scope="date-picker" data-part="actions">
        <Button variant="text" @click="handleCancel">{{ cancelText }}</Button>
        <Button variant="text" @click="handleConfirm">{{ confirmText }}</Button>
      </div>
    </div>
  </div>
</template>
