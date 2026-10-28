---
title: DateRangePicker
---

<script setup lang="ts">
import { computed, ref } from 'vue';
import { Button } from '@/components/Button';
import type { DateRangePickerModelValue } from '@/components/DateRangePicker';
import { DateRangePicker } from '@/components/DateRangePicker';

import DateRangePickerDefault from '../../demos/date-range-picker/DateRangePickerDefault.vue';
import DateRangePickerDefaultSrc from '../../demos/date-range-picker/DateRangePickerDefault.vue?raw';
import DateRangePickerModal from '../../demos/date-range-picker/DateRangePickerModal.vue';
import DateRangePickerModalSrc from '../../demos/date-range-picker/DateRangePickerModal.vue?raw';
import DateRangePickerConstraints from '../../demos/date-range-picker/DateRangePickerConstraints.vue';
import DateRangePickerConstraintsSrc from '../../demos/date-range-picker/DateRangePickerConstraints.vue?raw';

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

  return start && end ? `${start} - ${end}` : '选择日期s';
});
</script>

# DateRangePicker

DateRangePicker 是用于选择开始和结束日期的独立界面。默认情况下，宽视口显示连续两个月；窄视口或粗指针设备则改为显示一个月。

<DemoContainer>
  <div style="display: grid; gap: 1rem; max-inline-size: 22rem;">
    <span ref="anchorEl" :style="{ 'anchor-name': anchorName }" style="display: inline-flex;">
      <Button variant="outlined" @click="open = true">{{ buttonLabel }}</Button>
    </span>
    <DateRangePicker v-bind="props" v-model="modelValue" v-model:open="open" :anchor-name="anchorName" :anchor-element="anchorEl" />
  </div>
</DemoContainer>

原生弹出层关闭时会触发 `update:open(false)`。DateRangePicker 自身的退出动画结束后会触发 `closed`。退出期间会保留当前日历视图，动画结束后再重置。

## 密度

DatePicker 和 DateRangePicker 继承 `--md-density`。日期单元格保持等宽等高，日历宽度、星期行、月份／年份列表和操作间距会随密度调整。视口较窄时，单元格会限制在可用列宽内。显式设置的组件尺寸 token 优先。

## 示例

### 默认

<DemoContainer :src="DateRangePickerDefaultSrc">
  <DateRangePickerDefault />
</DemoContainer>

### 模态模式

<DemoContainer :src="DateRangePickerModalSrc">
  <DateRangePickerModal />
</DemoContainer>

### 限制条件

<DemoContainer :src="DateRangePickerConstraintsSrc">
  <DateRangePickerConstraints />
</DemoContainer>

## 参考

<AnatomyTable scope="date-range-picker" />

<ApiTable component="DateRangePicker" v-model="props" :exclude="['id', 'anchorName', 'anchorElement', 'locale', 'today']" />

<StyleTokenTable component="DateRangePicker" />
