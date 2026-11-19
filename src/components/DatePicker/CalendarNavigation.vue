<script setup lang="ts">
import { vFocusRing } from '@/directives/FocusRing';
import { computed } from 'vue';
import Button from '@/components/Button/Button.vue';
import Icon from '@/components/Icon/Icon.vue';
import IconButton from '@/components/IconButton/IconButton.vue';
import { vStateLayer } from '@/components/StateLayer/state-layer';
import type { M3Messages } from '@/locales/types';
import type { useCalendarNavigation } from '../useCalendarNavigation';

const { picker, scope, messages } = defineProps<{
  picker: Omit<ReturnType<typeof useCalendarNavigation>, 'numberFormatter' | 'setDisplayedMonthFromDate'>;
  scope: 'date-picker' | 'date-range-picker';
  messages: M3Messages['datePicker'];
}>();

const view = computed(() => picker.calendarView.value);
const list = computed(() =>
  view.value === 'months'
    ? { part: 'month', options: picker.monthOptions.value, select: picker.selectMonth }
    : { part: 'year', options: picker.yearOptions.value, select: picker.selectYear },
);
</script>

<template>
  <div class="m3-date-picker-header" :data-scope="scope" data-part="header">
    <IconButton
      icon="chevron_left"
      variant="standard"
      size="small"
      :disabled="!picker.canGoPreviousMonth.value"
      :aria-label="messages.previousMonth"
      :data-scope="scope"
      data-part="previous-month"
      @click="picker.goToPreviousMonth"
    />

    <Button
      class="m3-date-picker-switch m3-state-layer"
      variant="text"
      size="small"
      :press-shape-morph="false"
      :trailing-icon="view === 'months' ? 'arrow_drop_up' : 'arrow_drop_down'"
      :data-scope="scope"
      data-part="month-switch"
      :aria-expanded="view === 'months' ? 'true' : 'false'"
      @click="picker.toggleMonthView"
    >
      {{ picker.monthButtonLabel.value }}
    </Button>

    <IconButton
      icon="chevron_right"
      variant="standard"
      size="small"
      :disabled="!picker.canGoNextMonth.value"
      :aria-label="messages.nextMonth"
      :data-scope="scope"
      data-part="next-month"
      @click="picker.goToNextMonth"
    />

    <IconButton
      icon="chevron_left"
      variant="standard"
      size="small"
      :disabled="!picker.canGoPreviousYear.value"
      :aria-label="messages.previousYear"
      :data-scope="scope"
      data-part="previous-year"
      @click="picker.goToPreviousYear"
    />

    <Button
      class="m3-date-picker-switch m3-state-layer"
      variant="text"
      size="small"
      :press-shape-morph="false"
      :trailing-icon="view === 'years' ? 'arrow_drop_up' : 'arrow_drop_down'"
      :data-scope="scope"
      data-part="year-switch"
      :aria-expanded="view === 'years' ? 'true' : 'false'"
      @click="picker.toggleYearView"
    >
      {{ picker.displayedYearLabel.value }}
    </Button>

    <IconButton
      icon="chevron_right"
      variant="standard"
      size="small"
      :disabled="!picker.canGoNextYear.value"
      :aria-label="messages.nextYear"
      :data-scope="scope"
      data-part="next-year"
      @click="picker.goToNextYear"
    />
  </div>

  <slot v-if="view === 'days'" />
  <div v-else :key="view" class="m3-date-picker-list" :data-scope="scope" :data-part="view">
    <button
      v-state-layer
      v-for="option in list.options"
      :key="option.value"
      type="button"
      v-focus-ring
      class="m3-date-picker-list-item m3-state-layer"
      :data-scope="scope"
      :data-part="list.part"
      :data-selected="option.selected ? 'true' : undefined"
      :disabled="option.disabled"
      :aria-pressed="option.selected"
      @click="list.select(option.value)"
    >
      <span
        v-if="option.selected"
        class="m3-date-picker-list-icon"
        :data-scope="scope"
        data-part="list-icon"
        aria-hidden="true"
      >
        <Icon name="check" />
      </span>
      <span class="m3-date-picker-list-label" :data-scope="scope" data-part="list-label">{{ option.label }}</span>
    </button>
  </div>
</template>
