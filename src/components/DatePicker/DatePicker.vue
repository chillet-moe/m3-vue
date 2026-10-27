<script setup lang="ts">
import { useShape, type M3Shape } from '@/styles/shape';
import { vStateLayer } from '@/components/StateLayer/state-layer';
import { computed, inject, nextTick, ref, unref, useId, watch } from 'vue';
import { datePickerContextKey } from './DatePickerContext';
import Button from '@/components/Button/Button.vue';
import Icon from '@/components/Icon/Icon.vue';
import IconButton from '@/components/IconButton/IconButton.vue';
import {
  type DatePickerModelValue,
  type DatePickerVariant,
  useDatePicker,
} from '@/components/DatePicker/useDatePicker';
import { usePickerPopover } from '@/composables/usePickerPopover';
import { useM3Locale } from '@/locales/context';

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

watch(
  () => modelValue.value,
  () => {
    if (!open.value) {
      picker.resetDraftFromModel();
    }
  },
);

defineExpose({
  popoverEl: popoverRef,
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
      <div class="m3-date-picker-header" data-scope="date-picker" data-part="header">
        <IconButton
          icon="chevron_left"
          variant="standard"
          size="small"
          :disabled="!picker.canGoPreviousMonth.value"
          :aria-label="messages.datePicker.previousMonth"
          data-scope="date-picker"
          data-part="previous-month"
          @click="picker.goToPreviousMonth"
        />

        <Button
          v-state-layer
          class="m3-date-picker-switch m3-state-layer"
          variant="text"
          size="small"
          :press-shape-morph="false"
          :trailing-icon="picker.calendarView.value === 'months' ? 'arrow_drop_up' : 'arrow_drop_down'"
          data-scope="date-picker"
          data-part="month-switch"
          :aria-expanded="picker.calendarView.value === 'months' ? 'true' : 'false'"
          @click="picker.toggleMonthView"
        >
          {{ picker.monthButtonLabel.value }}
        </Button>

        <IconButton
          icon="chevron_right"
          variant="standard"
          size="small"
          :disabled="!picker.canGoNextMonth.value"
          :aria-label="messages.datePicker.nextMonth"
          data-scope="date-picker"
          data-part="next-month"
          @click="picker.goToNextMonth"
        />

        <IconButton
          icon="chevron_left"
          variant="standard"
          size="small"
          :disabled="!picker.canGoPreviousYear.value"
          :aria-label="messages.datePicker.previousYear"
          data-scope="date-picker"
          data-part="previous-year"
          @click="picker.goToPreviousYear"
        />

        <Button
          v-state-layer
          class="m3-date-picker-switch m3-state-layer"
          variant="text"
          size="small"
          :press-shape-morph="false"
          :trailing-icon="picker.calendarView.value === 'years' ? 'arrow_drop_up' : 'arrow_drop_down'"
          data-scope="date-picker"
          data-part="year-switch"
          :aria-expanded="picker.calendarView.value === 'years' ? 'true' : 'false'"
          @click="picker.toggleYearView"
        >
          {{ picker.displayedYearLabel.value }}
        </Button>

        <IconButton
          icon="chevron_right"
          variant="standard"
          size="small"
          :disabled="!picker.canGoNextYear.value"
          :aria-label="messages.datePicker.nextYear"
          data-scope="date-picker"
          data-part="next-year"
          @click="picker.goToNextYear"
        />
      </div>

      <div
        v-if="picker.calendarView.value === 'days'"
        class="m3-date-picker-calendar"
        data-scope="date-picker"
        data-part="calendar"
      >
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
            v-for="day in picker.calendarDays.value"
            :key="day.date"
            type="button"
            role="gridcell"
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
            :aria-label="picker.fullDateFormatter.value.format(picker.dateFromIso(day.date))"
            @click="picker.selectDate(day.date)"
            @keydown="handleCalendarKeydown($event, day.date)"
          >
            {{ day.label }}
          </button>
        </div>
      </div>

      <div
        v-else-if="picker.calendarView.value === 'months'"
        class="m3-date-picker-list"
        data-scope="date-picker"
        data-part="months"
      >
        <button
          v-state-layer
          v-for="monthOption in picker.monthOptions.value"
          :key="monthOption.month"
          type="button"
          class="m3-date-picker-list-item m3-state-layer"
          data-scope="date-picker"
          data-part="month"
          :data-selected="monthOption.selected ? 'true' : undefined"
          :disabled="monthOption.disabled"
          :aria-pressed="monthOption.selected ? 'true' : 'false'"
          @click="picker.selectMonth(monthOption.month)"
        >
          <span class="m3-date-picker-list-icon" data-scope="date-picker" data-part="list-icon" aria-hidden="true">
            <Icon v-if="monthOption.selected" name="check" />
          </span>
          <span class="m3-date-picker-list-label" data-scope="date-picker" data-part="list-label">
            {{ monthOption.label }}
          </span>
        </button>
      </div>

      <div v-else class="m3-date-picker-list" data-scope="date-picker" data-part="years">
        <button
          v-state-layer
          v-for="yearOption in picker.yearOptions.value"
          :key="yearOption.year"
          type="button"
          class="m3-date-picker-list-item m3-state-layer"
          data-scope="date-picker"
          data-part="year"
          :data-selected="yearOption.selected ? 'true' : undefined"
          :disabled="yearOption.disabled"
          :aria-pressed="yearOption.selected ? 'true' : 'false'"
          @click="picker.selectYear(yearOption.year)"
        >
          <span class="m3-date-picker-list-icon" data-scope="date-picker" data-part="list-icon" aria-hidden="true">
            <Icon v-if="yearOption.selected" name="check" />
          </span>
          <span class="m3-date-picker-list-label" data-scope="date-picker" data-part="list-label">
            {{ yearOption.label }}
          </span>
        </button>
      </div>

      <div class="m3-date-picker-actions" data-scope="date-picker" data-part="actions">
        <Button variant="text" @click="handleCancel">{{ cancelText }}</Button>
        <Button variant="text" @click="handleConfirm">{{ confirmText }}</Button>
      </div>
    </div>
  </div>
</template>

<style src="./DatePicker.css"></style>
