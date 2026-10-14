---
title: TimePicker
---

<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@/components/Button';
import type { TimePickerModelValue } from '@/components/TimePicker';
import { TimePicker } from '@/components/TimePicker';
import { TextField } from '@/components/TextField';

import TimePickerDefault from '../../demos/time-picker/TimePickerDefault.vue';
import TimePickerDefaultSrc from '../../demos/time-picker/TimePickerDefault.vue?raw';
import TimePicker24Hour from '../../demos/time-picker/TimePicker24Hour.vue';
import TimePicker24HourSrc from '../../demos/time-picker/TimePicker24Hour.vue?raw';
import TimePickerKeyboard from '../../demos/time-picker/TimePickerKeyboard.vue';
import TimePickerKeyboardSrc from '../../demos/time-picker/TimePickerKeyboard.vue?raw';

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

TimePicker 是独立的时间选择界面。TextField 在 `type="time"` 时会自动使用它。省略 `format` 时，组件会采用配置的区域设置或浏览器区域设置所偏好的小时制。

<DemoContainer>
  <div style="display: grid; gap: 1rem; max-inline-size: 22rem;">
    <span ref="anchorEl" :style="{ 'anchor-name': anchorName }" style="display: inline-flex;">
      <Button variant="outlined" @click="open = true">{{ modelValue ?? '选择时间' }}</Button>
    </span>
    <TimePicker v-bind="props" v-model="modelValue" v-model:open="open" :anchor-name="anchorName" :anchor-element="anchorEl" />
    <TextField v-model="textFieldValue" type="time" label="TextField 时间" />
  </div>
</DemoContainer>

<AnatomyTable scope="time-picker" />

<ApiTable component="TimePicker" v-model="props" :exclude="['id', 'anchorName', 'anchorElement']" />

<StyleTokenTable component="TimePicker" />

原生弹出层关闭时会触发 `update:open(false)`。如果清理操作需要等到 TimePicker 自身的视觉退出完成后再执行，请使用 `closed`。

## 格式和输入模式

`format` 选择 `12h` 或 `24h`；`inputMode` 选择 `clock` 或 `keyboard`。显式属性优先于 `timePickerContextKey` 中对应的值。未设置格式偏好时，独立 TimePicker 遵循配置的区域设置或浏览器区域设置，TextField 内嵌的时间选择器使用 `24h`。未设置输入模式偏好时，12 小时制选择器默认使用时钟，24 小时制选择器默认使用键盘输入。用户可在选择器打开时切换模式。

可通过 `M3VuePlugin` 设置 `timePickerDefaults.format` 和 `timePickerDefaults.inputMode`，或通过上下文配置子树。独立和 TextField 内嵌的时间选择器都会继承这些偏好。详见[组件默认值](/zh-Hans/getting-started#组件默认值)。

## 示例

### 默认

<DemoContainer :src="TimePickerDefaultSrc">
  <TimePickerDefault />
</DemoContainer>

### 24 小时制

<DemoContainer :src="TimePicker24HourSrc">
  <TimePicker24Hour />
</DemoContainer>

### 键盘输入

<DemoContainer :src="TimePickerKeyboardSrc">
  <TimePickerKeyboard />
</DemoContainer>
