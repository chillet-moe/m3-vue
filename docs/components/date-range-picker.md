---
title: DateRangePicker
---

<script setup lang="ts">
import { computed, ref } from 'vue';
import { Button } from '@/components/Button';
import type { DateRangePickerModelValue } from '@/components/DateRangePicker';
import { DateRangePicker } from '@/components/DateRangePicker';

import DateRangePickerDefault from '../demos/date-range-picker/DateRangePickerDefault.vue';
import DateRangePickerDefaultSrc from '../demos/date-range-picker/DateRangePickerDefault.vue?raw';
import DateRangePickerModal from '../demos/date-range-picker/DateRangePickerModal.vue';
import DateRangePickerModalSrc from '../demos/date-range-picker/DateRangePickerModal.vue?raw';
import DateRangePickerConstraints from '../demos/date-range-picker/DateRangePickerConstraints.vue';
import DateRangePickerConstraintsSrc from '../demos/date-range-picker/DateRangePickerConstraints.vue?raw';

const props = ref({
  variant: 'auto',
  min: '',
  max: '',
  firstDayOfWeek: 0,
});

const modelValue = ref<DateRangePickerModelValue>({
  start: '2026-04-10',
  end: '2026-04-14',
});
const open = ref(false);
const anchorEl = ref<HTMLElement>();
const anchorName = '--date-range-picker-doc-anchor';
const buttonLabel = computed(() => {
  const start = modelValue.value?.start;
  const end = modelValue.value?.end;

  return start && end ? `${start} - ${end}` : 'Choose dates';
});
</script>

# DateRangePicker

DateRangePicker is a standalone surface for choosing a start and end date. By default it shows two consecutive months on wide viewports and falls back to one month on narrow or coarse-pointer viewports.

<DemoContainer>
  <div style="display: grid; gap: 1rem; max-inline-size: 22rem;">
    <span ref="anchorEl" :style="{ 'anchor-name': anchorName }" style="display: inline-flex;">
      <Button variant="outlined" @click="open = true">{{ buttonLabel }}</Button>
    </span>
    <DateRangePicker v-bind="props" v-model="modelValue" v-model:open="open" :anchor-name="anchorName" :anchor-element="anchorEl" />
  </div>
</DemoContainer>

`update:open(false)` is emitted when the native popover closes. `closed` follows after the DateRangePicker-owned exit
motion finishes. The current calendar view is preserved during the exit and reset afterward.

## Density

DatePicker and DateRangePicker inherit `--md-density`. Date cells keep equal width and height, while calendar width, weekday rows, month/year lists and action spacing adapt to density. Narrow viewports constrain cells to the available column width. Explicit component dimension tokens take precedence.

## Examples

### Default

<DemoContainer :src="DateRangePickerDefaultSrc">
  <DateRangePickerDefault />
</DemoContainer>

### Modal

<DemoContainer :src="DateRangePickerModalSrc">
  <DateRangePickerModal />
</DemoContainer>

### Constraints

<DemoContainer :src="DateRangePickerConstraintsSrc">
  <DateRangePickerConstraints />
</DemoContainer>

## Reference

<AnatomyTable scope="date-range-picker" />

<ApiTable component="DateRangePicker" v-model="props" :exclude="['id', 'anchorName', 'anchorElement', 'locale', 'today']" />

<StyleTokenTable component="DateRangePicker" />
