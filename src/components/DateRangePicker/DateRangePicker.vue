<script setup lang="ts">
import { computed, nextTick, ref, useId, watch } from 'vue';
import Button from '@/components/Button/Button.vue';
import Icon from '@/components/Icon/Icon.vue';
import IconButton from '@/components/IconButton/IconButton.vue';
import {
  type DateRangePickerCalendars,
  type DateRangePickerModelValue,
  type DateRangePickerRangeValue,
  type DateRangePickerVariant,
  useDateRangePicker,
} from '@/components/DateRangePicker/useDateRangePicker';
import { usePickerPopover } from '@/composables/usePickerPopover';

export type { DateRangePickerCalendars, DateRangePickerModelValue, DateRangePickerRangeValue, DateRangePickerVariant };

export type DateRangePickerProps = {
  /** Optional explicit id for the popover element. */
  id?: string;

  /** Visual and positioning mode. Auto uses docked layout until a narrow/coarse pointer viewport. */
  variant?: DateRangePickerVariant;

  /** Number of calendar months to show. Auto shows two months on wide viewports and one on narrow/coarse inputs. */
  calendars?: DateRangePickerCalendars;

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

  /** BCP 47 locale used for month, weekday, and accessibility labels. */
  locale?: string;

  /** First day of the week, where 0 is Sunday and 6 is Saturday. */
  firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6;

  /** Text for the confirmation button. */
  confirmText?: string;

  /** Text for the cancel button. */
  cancelText?: string;

  /** Text used for the start side of the range. */
  startText?: string;

  /** Text used for the end side of the range. */
  endText?: string;

  /** Date treated as today, formatted as YYYY-MM-DD. Useful for deterministic tests. */
  today?: string;
};

const props = withDefaults(defineProps<DateRangePickerProps>(), {
  id: undefined,
  variant: 'auto',
  calendars: 'auto',
  anchorName: undefined,
  anchorElement: undefined,
  ariaLabel: 'Choose date range',
  min: undefined,
  max: undefined,
  locale: undefined,
  firstDayOfWeek: 0,
  confirmText: 'OK',
  cancelText: 'Cancel',
  startText: 'Start date',
  endText: 'End date',
  today: undefined,
});

const emit = defineEmits<{
  /** Fired when a date range is committed to the model. */
  change: [value: DateRangePickerModelValue];

  /** Fired when the user cancels the draft selection. */
  cancel: [];

  /** Fired when the user confirms the draft selection. */
  confirm: [value: DateRangePickerModelValue];
}>();

const modelValue = defineModel<DateRangePickerModelValue>();
const open = defineModel<boolean>('open', { default: false });

const generatedId = useId();
const popoverRef = ref<HTMLDivElement>();
const surfaceRef = ref<HTMLElement>();

const pickerId = computed(() => {
  return props.id ?? `m3-date-range-picker-${generatedId}`;
});

const popoverStyle = computed(() => {
  return props.anchorName ? { 'position-anchor': props.anchorName } : undefined;
});

const picker = useDateRangePicker({
  modelValue,
  min: () => props.min,
  max: () => props.max,
  today: () => props.today,
  locale: () => props.locale,
  firstDayOfWeek: () => props.firstDayOfWeek,
  onChange: (value) => emit('change', value),
  onCancel: () => emit('cancel'),
  onConfirm: (value) => emit('confirm', value),
});

const activeSelectionLabel = computed(() => {
  return picker.activeSelection.value === 'end' ? props.endText : props.startText;
});

const startValueLabel = computed(() => {
  const start = picker.selectedStartDate.value;

  return start ? picker.mediumDateFormatter.value.format(picker.dateFromIso(start)) : props.startText;
});

const endValueLabel = computed(() => {
  const end = picker.selectedEndDate.value;

  return end ? picker.mediumDateFormatter.value.format(picker.dateFromIso(end)) : props.endText;
});

const renderedCalendarCount = computed(() => {
  return props.calendars === 1 ? 1 : 2;
});

const calendarPages = computed(() => {
  return Array.from({ length: renderedCalendarCount.value }, (_, offset) => ({
    offset,
    ...picker.getCalendarPage(offset),
  }));
});

function getDateButton(date: string) {
  return (
    surfaceRef.value?.querySelector<HTMLButtonElement>(
      `.m3-date-picker-day[data-date="${date}"]:not([data-outside-month='true'])`,
    ) ?? surfaceRef.value?.querySelector<HTMLButtonElement>(`.m3-date-picker-day[data-date="${date}"]`)
  );
}

async function focusDate(date: string) {
  await nextTick();
  getDateButton(date)?.focus();
}

async function focusActiveDate() {
  await nextTick();

  const selectedStart = picker.selectedStartDate.value;
  const selectedEnd = picker.selectedEndDate.value;
  const activeDate =
    picker.activeSelection.value === 'end' ? (selectedEnd ?? selectedStart) : (selectedStart ?? selectedEnd);
  const visibleDays = calendarPages.value.flatMap((page) => page.days);
  const preferred =
    (activeDate && visibleDays.some((day) => day.date === activeDate) ? activeDate : undefined) ??
    visibleDays.find((day) => day.today && !day.disabled)?.date ??
    visibleDays.find((day) => !day.disabled && !day.outsideMonth)?.date ??
    visibleDays.find((day) => !day.disabled)?.date;

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
  onBeforeClose: () => {
    picker.calendarView.value = 'days';
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
</script>

<template>
  <div
    :id="pickerId"
    ref="popoverRef"
    class="m3-date-picker m3-date-range-picker"
    popover="auto"
    role="dialog"
    data-scope="date-range-picker"
    data-part="root"
    :data-variant="props.variant"
    :data-calendars="props.calendars"
    :aria-label="props.ariaLabel"
    :style="popoverStyle"
    @toggle="popover.handlePopoverToggle"
  >
    <div ref="surfaceRef" class="m3-date-picker-surface" data-scope="date-range-picker" data-part="surface">
      <div class="m3-date-range-picker-summary" data-scope="date-range-picker" data-part="summary">
        <span class="m3-date-range-picker-prompt" data-scope="date-range-picker" data-part="prompt">
          {{ activeSelectionLabel }}
        </span>
        <div class="m3-date-range-picker-endpoints" data-scope="date-range-picker" data-part="endpoints">
          <button
            type="button"
            class="m3-date-range-picker-endpoint m3-state-layer"
            data-scope="date-range-picker"
            data-part="start-selector"
            :data-active="picker.activeSelection.value === 'start' ? 'true' : 'false'"
            :aria-pressed="picker.activeSelection.value === 'start' ? 'true' : 'false'"
            @click="picker.setActiveSelection('start')"
          >
            <span class="m3-date-range-picker-value" data-scope="date-range-picker" data-part="value">
              {{ startValueLabel }}
            </span>
          </button>
          <button
            type="button"
            class="m3-date-range-picker-endpoint m3-state-layer"
            data-scope="date-range-picker"
            data-part="end-selector"
            :data-active="picker.activeSelection.value === 'end' ? 'true' : 'false'"
            :aria-pressed="picker.activeSelection.value === 'end' ? 'true' : 'false'"
            @click="picker.setActiveSelection('end')"
          >
            <span class="m3-date-range-picker-value" data-scope="date-range-picker" data-part="value">
              {{ endValueLabel }}
            </span>
          </button>
        </div>
      </div>

      <div class="m3-date-picker-header" data-scope="date-range-picker" data-part="header">
        <IconButton
          icon="chevron_left"
          variant="standard"
          size="small"
          :disabled="!picker.canGoPreviousMonth.value"
          aria-label="Previous month"
          data-scope="date-range-picker"
          data-part="previous-month"
          @click="picker.goToPreviousMonth"
        />

        <Button
          class="m3-date-picker-switch m3-state-layer"
          variant="text"
          size="small"
          :press-shape-morph="false"
          :trailing-icon="picker.calendarView.value === 'months' ? 'arrow_drop_up' : 'arrow_drop_down'"
          data-scope="date-range-picker"
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
          aria-label="Next month"
          data-scope="date-range-picker"
          data-part="next-month"
          @click="picker.goToNextMonth"
        />

        <IconButton
          icon="chevron_left"
          variant="standard"
          size="small"
          :disabled="!picker.canGoPreviousYear.value"
          aria-label="Previous year"
          data-scope="date-range-picker"
          data-part="previous-year"
          @click="picker.goToPreviousYear"
        />

        <Button
          class="m3-date-picker-switch m3-state-layer"
          variant="text"
          size="small"
          :press-shape-morph="false"
          :trailing-icon="picker.calendarView.value === 'years' ? 'arrow_drop_up' : 'arrow_drop_down'"
          data-scope="date-range-picker"
          data-part="year-switch"
          :aria-expanded="picker.calendarView.value === 'years' ? 'true' : 'false'"
          @click="picker.toggleYearView"
        >
          {{ picker.displayedYear.value }}
        </Button>

        <IconButton
          icon="chevron_right"
          variant="standard"
          size="small"
          :disabled="!picker.canGoNextYear.value"
          aria-label="Next year"
          data-scope="date-range-picker"
          data-part="next-year"
          @click="picker.goToNextYear"
        />
      </div>

      <div
        v-if="picker.calendarView.value === 'days'"
        class="m3-date-range-picker-calendars"
        data-scope="date-range-picker"
        data-part="calendars"
      >
        <section
          v-for="page in calendarPages"
          :key="page.key"
          class="m3-date-range-picker-calendar-pane"
          data-scope="date-range-picker"
          data-part="calendar-pane"
          :data-month-offset="page.offset"
        >
          <div class="m3-date-range-picker-calendar-title" data-scope="date-range-picker" data-part="calendar-title">
            {{ page.label }}
          </div>

          <div class="m3-date-picker-weekdays" data-scope="date-range-picker" data-part="weekdays" aria-hidden="true">
            <span
              v-for="weekday in picker.weekdayLabels.value"
              :key="weekday.key"
              class="m3-date-picker-weekday"
              data-scope="date-range-picker"
              data-part="weekday"
              >{{ weekday.label }}</span
            >
          </div>

          <div
            role="grid"
            class="m3-date-picker-grid"
            data-scope="date-range-picker"
            data-part="grid"
            :aria-label="page.label"
          >
            <span
              v-for="day in page.days"
              :key="`${page.key}-${day.date}`"
              class="m3-date-range-picker-day-cell"
              data-scope="date-range-picker"
              data-part="day-cell"
              :data-date="day.date"
              :data-selected="day.selected ? 'true' : undefined"
              :data-selected-start="day.selectedStart ? 'true' : undefined"
              :data-selected-end="day.selectedEnd ? 'true' : undefined"
              :data-in-range="day.inRange ? 'true' : undefined"
              :data-range-start="day.rangeStart ? 'true' : undefined"
              :data-range-end="day.rangeEnd ? 'true' : undefined"
              :data-today="day.today ? 'true' : undefined"
              :data-outside-month="day.outsideMonth ? 'true' : undefined"
              :data-disabled="day.disabled ? 'true' : undefined"
            >
              <button
                type="button"
                role="gridcell"
                class="m3-date-picker-day m3-state-layer"
                data-scope="date-range-picker"
                data-part="day"
                :data-date="day.date"
                :data-selected="day.selected ? 'true' : undefined"
                :data-selected-start="day.selectedStart ? 'true' : undefined"
                :data-selected-end="day.selectedEnd ? 'true' : undefined"
                :data-in-range="day.inRange ? 'true' : undefined"
                :data-range-start="day.rangeStart ? 'true' : undefined"
                :data-range-end="day.rangeEnd ? 'true' : undefined"
                :data-today="day.today ? 'true' : undefined"
                :data-outside-month="day.outsideMonth ? 'true' : undefined"
                :disabled="day.disabled"
                :aria-selected="day.selected ? 'true' : 'false'"
                :aria-current="day.today ? 'date' : undefined"
                :aria-label="picker.getDateAriaLabel(day.date)"
                @click="picker.selectDate(day.date)"
                @keydown="handleCalendarKeydown($event, day.date)"
              >
                {{ day.label }}
              </button>
            </span>
          </div>
        </section>
      </div>

      <div
        v-else-if="picker.calendarView.value === 'months'"
        class="m3-date-picker-list"
        data-scope="date-range-picker"
        data-part="months"
      >
        <button
          v-for="monthOption in picker.monthOptions.value"
          :key="monthOption.month"
          type="button"
          class="m3-date-picker-list-item m3-state-layer"
          data-scope="date-range-picker"
          data-part="month"
          :data-selected="monthOption.selected ? 'true' : undefined"
          :disabled="monthOption.disabled"
          :aria-pressed="monthOption.selected ? 'true' : 'false'"
          @click="picker.selectMonth(monthOption.month)"
        >
          <span
            class="m3-date-picker-list-icon"
            data-scope="date-range-picker"
            data-part="list-icon"
            aria-hidden="true"
          >
            <Icon v-if="monthOption.selected" name="check" />
          </span>
          <span class="m3-date-picker-list-label" data-scope="date-range-picker" data-part="list-label">
            {{ monthOption.label }}
          </span>
        </button>
      </div>

      <div v-else class="m3-date-picker-list" data-scope="date-range-picker" data-part="years">
        <button
          v-for="yearOption in picker.yearOptions.value"
          :key="yearOption.year"
          type="button"
          class="m3-date-picker-list-item m3-state-layer"
          data-scope="date-range-picker"
          data-part="year"
          :data-selected="yearOption.selected ? 'true' : undefined"
          :disabled="yearOption.disabled"
          :aria-pressed="yearOption.selected ? 'true' : 'false'"
          @click="picker.selectYear(yearOption.year)"
        >
          <span
            class="m3-date-picker-list-icon"
            data-scope="date-range-picker"
            data-part="list-icon"
            aria-hidden="true"
          >
            <Icon v-if="yearOption.selected" name="check" />
          </span>
          <span class="m3-date-picker-list-label" data-scope="date-range-picker" data-part="list-label">
            {{ yearOption.year }}
          </span>
        </button>
      </div>

      <div class="m3-date-picker-actions" data-scope="date-range-picker" data-part="actions">
        <Button variant="text" @click="handleCancel">{{ props.cancelText }}</Button>
        <Button variant="text" @click="handleConfirm">{{ props.confirmText }}</Button>
      </div>
    </div>
  </div>
</template>

<style src="./DateRangePicker.css"></style>
