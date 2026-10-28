---
title: TimePicker
---

<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@/components/Button';
import type { TimePickerModelValue } from '@/components/TimePicker';
import { TimePicker } from '@/components/TimePicker';
import { TextField } from '@/components/TextField';

import TimePickerDefault from '../demos/time-picker/TimePickerDefault.vue';
import TimePickerDefaultSrc from '../demos/time-picker/TimePickerDefault.vue?raw';
import TimePicker24Hour from '../demos/time-picker/TimePicker24Hour.vue';
import TimePicker24HourSrc from '../demos/time-picker/TimePicker24Hour.vue?raw';
import TimePickerKeyboard from '../demos/time-picker/TimePickerKeyboard.vue';
import TimePickerKeyboardSrc from '../demos/time-picker/TimePickerKeyboard.vue?raw';

const props = ref({
  variant: 'auto',
  format: undefined,
  inputMode: undefined,
  titleText: 'Select time',
});

const modelValue = ref<TimePickerModelValue>('09:30');
const open = ref(false);
const anchorEl = ref<HTMLElement>();
const anchorName = '--time-picker-doc-anchor';
const textFieldValue = ref('09:30');
</script>

# TimePicker

TimePicker is a standalone time selection surface. TextField uses it automatically for `type="time"`.

<DemoContainer>
  <div style="display: grid; gap: 1rem; max-inline-size: 22rem;">
    <span ref="anchorEl" :style="{ 'anchor-name': anchorName }" style="display: inline-flex;">
      <Button variant="outlined" @click="open = true">{{ modelValue ?? 'Choose time' }}</Button>
    </span>
    <TimePicker v-bind="props" v-model="modelValue" v-model:open="open" :anchor-name="anchorName" :anchor-element="anchorEl" />
    <TextField v-model="textFieldValue" type="time" label="TextField time" />
  </div>
</DemoContainer>

`update:open(false)` is emitted when the native popover closes. Use `closed` for cleanup that must wait until the
TimePicker-owned visual exit finishes.

## Density

TimePicker inherits `--md-density` for its numeric display, keyboard inputs, period controls and surrounding spacing. The clock face, clock labels and hand geometry keep their dimensions so pointer selection remains consistent.

## Format and Input Mode

`format` selects `12h` or `24h`; `inputMode` selects `clock` or `keyboard`. Explicit props override the corresponding
values in `timePickerContextKey`. Without a format preference, standalone TimePicker follows the configured or
browser locale, while TextField's embedded time picker uses `24h`. Without an input-mode preference, 12-hour pickers
start with the clock and 24-hour pickers start with keyboard input. Users can switch modes within an open picker.

Set `timePickerDefaults.format` and `timePickerDefaults.inputMode` through `M3VuePlugin`, or provide the context for
a subtree. Both standalone and TextField time pickers inherit these preferences. See
[component defaults](/getting-started#component-defaults).

## Examples

### Default

<DemoContainer :src="TimePickerDefaultSrc">
  <TimePickerDefault />
</DemoContainer>

### 24-hour

<DemoContainer :src="TimePicker24HourSrc">
  <TimePicker24Hour />
</DemoContainer>

### Keyboard input

<DemoContainer :src="TimePickerKeyboardSrc">
  <TimePickerKeyboard />
</DemoContainer>

## Reference

<AnatomyTable scope="time-picker" />

<ApiTable component="TimePicker" v-model="props" :exclude="['id', 'anchorName', 'anchorElement']" />

<StyleTokenTable component="TimePicker" />
