---
title: DatePicker
---

<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@/components/Button';
import type { DatePickerModelValue } from '@/components/DatePicker';
import { DatePicker } from '@/components/DatePicker';
import { TextField } from '@/components/TextField';

import DatePickerDefault from '../../demos/date-picker/DatePickerDefault.vue';
import DatePickerDefaultSrc from '../../demos/date-picker/DatePickerDefault.vue?raw';
import DatePickerModal from '../../demos/date-picker/DatePickerModal.vue';
import DatePickerModalSrc from '../../demos/date-picker/DatePickerModal.vue?raw';
import DatePickerConstraints from '../../demos/date-picker/DatePickerConstraints.vue';
import DatePickerConstraintsSrc from '../../demos/date-picker/DatePickerConstraints.vue?raw';

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

DatePicker 是独立的日期选择界面。TextField 在 `type="date"` 和 `type="datetime-local"` 时会自动使用它。

<DemoContainer>
  <div style="display: grid; gap: 1rem; max-inline-size: 22rem;">
    <span ref="anchorEl" :style="{ 'anchor-name': anchorName }" style="display: inline-flex;">
      <Button variant="outlined" @click="open = true">{{ modelValue ?? '选择日期' }}</Button>
    </span>
    <DatePicker v-bind="props" v-model="modelValue" v-model:open="open" :anchor-name="anchorName" :anchor-element="anchorEl" />
    <TextField v-model="textFieldValue" type="date" label="TextField 日期" />
  </div>
</DemoContainer>

<AnatomyTable scope="date-picker" />

<ApiTable component="DatePicker" v-model="props" :exclude="['id', 'anchorName', 'anchorElement', 'locale', 'today']" />

<StyleTokenTable component="DatePicker" />

原生弹出层关闭时会触发 `update:open(false)`。DatePicker 自身的退出动画结束后会触发 `closed`。退出期间会保留当前日历视图，动画结束后再重置。

## 示例

### 默认

<DemoContainer :src="DatePickerDefaultSrc">
  <DatePickerDefault />
</DemoContainer>

### 模态模式

<DemoContainer :src="DatePickerModalSrc">
  <DatePickerModal />
</DemoContainer>

### 限制条件

<DemoContainer :src="DatePickerConstraintsSrc">
  <DatePickerConstraints />
</DemoContainer>

## 共享默认值

通过 `M3VuePlugin` 设置 `datePickerDefaults.firstDayOfWeek`，或提供 `datePickerContextKey.firstDayOfWeek`。显式设置的属性优先；未设置时，星期起始日由区域设置决定。TextField 中的日期选择器也会继承此偏好。

应用级和子树级配置示例请参阅[其他组件默认值](/zh-Hans/getting-started#其他组件默认值)。
