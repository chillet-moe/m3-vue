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
When `format` is omitted, it uses the configured or browser locale's preferred hour cycle.

<DemoContainer>
  <div style="display: grid; gap: 1rem; max-inline-size: 22rem;">
    <span ref="anchorEl" :style="{ 'anchor-name': anchorName }" style="display: inline-flex;">
      <Button variant="outlined" @click="open = true">{{ modelValue ?? 'Choose time' }}</Button>
    </span>
    <TimePicker v-bind="props" v-model="modelValue" v-model:open="open" :anchor-name="anchorName" :anchor-element="anchorEl" />
    <TextField v-model="textFieldValue" type="time" label="TextField time" />
  </div>
</DemoContainer>

<AnatomyTable scope="time-picker" />

<ApiTable component="TimePicker" v-model="props" :exclude="['id', 'anchorName', 'anchorElement']" />

<StyleTokenTable component="TimePicker" />

`update:open(false)` is emitted when the native popover closes. Use `closed` for cleanup that must wait until the
TimePicker-owned visual exit finishes.

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

## Shared Defaults

Set `timePickerDefaults.format` and `timePickerDefaults.inputMode` through `M3VuePlugin`, or provide `timePickerContextKey`. Explicit props win. TextField time pickers inherit these preferences; without a format preference, TextField retains its 24-hour fallback while standalone TimePicker follows the locale.

See [Other Component Defaults](/getting-started#other-component-defaults) for application and subtree examples.
