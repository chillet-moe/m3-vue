---
title: DatePicker
---

<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@/components/Button';
import type { DatePickerModelValue } from '@/components/DatePicker';
import { DatePicker } from '@/components/DatePicker';
import { TextField } from '@/components/TextField';

import DatePickerDefault from '../demos/date-picker/DatePickerDefault.vue';
import DatePickerDefaultSrc from '../demos/date-picker/DatePickerDefault.vue?raw';
import DatePickerModal from '../demos/date-picker/DatePickerModal.vue';
import DatePickerModalSrc from '../demos/date-picker/DatePickerModal.vue?raw';
import DatePickerConstraints from '../demos/date-picker/DatePickerConstraints.vue';
import DatePickerConstraintsSrc from '../demos/date-picker/DatePickerConstraints.vue?raw';

const props = ref({
  variant: 'auto',
  min: '',
  max: '',
  firstDayOfWeek: 0,
});

const modelValue = ref<DatePickerModelValue>('2026-04-28');
const open = ref(false);
const anchorEl = ref<HTMLElement>();
const anchorName = '--date-picker-doc-anchor';
const textFieldValue = ref('2026-04-28');
</script>

# DatePicker

DatePicker is a standalone date surface. TextField uses it automatically for `type="date"` and `type="datetime-local"`.

<DemoContainer>
  <div style="display: grid; gap: 1rem; max-inline-size: 22rem;">
    <span ref="anchorEl" :style="{ 'anchor-name': anchorName }" style="display: inline-flex;">
      <Button variant="outlined" @click="open = true">{{ modelValue ?? 'Choose date' }}</Button>
    </span>
    <DatePicker v-bind="props" v-model="modelValue" v-model:open="open" :anchor-name="anchorName" :anchor-element="anchorEl" />
    <TextField v-model="textFieldValue" type="date" label="TextField date" />
  </div>
</DemoContainer>

<AnatomyTable scope="date-picker" />

<ApiTable component="DatePicker" v-model="props" :exclude="['id', 'anchorName', 'anchorElement', 'locale', 'today']" />

<StyleTokenTable component="DatePicker" />

## Examples

### Default

<DemoContainer :src="DatePickerDefaultSrc">
  <DatePickerDefault />
</DemoContainer>

### Modal

<DemoContainer :src="DatePickerModalSrc">
  <DatePickerModal />
</DemoContainer>

### Constraints

<DemoContainer :src="DatePickerConstraintsSrc">
  <DatePickerConstraints />
</DemoContainer>
