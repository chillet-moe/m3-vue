---
title: Combobox
---

<script setup lang="ts">
import { ref } from 'vue';
import type { SelectModelValue } from '@/components/Select';
import { Combobox } from '@/components/Combobox';
import { stateOptions } from '../../demos/shared/selectOptions';

import ComboboxDefault from '../../demos/combobox/ComboboxDefault.vue';
import ComboboxDefaultSrc from '../../demos/combobox/ComboboxDefault.vue?raw';
import ComboboxMultiSelect from '../../demos/combobox/ComboboxMultiSelect.vue';
import ComboboxMultiSelectSrc from '../../demos/combobox/ComboboxMultiSelect.vue?raw';

const props = ref({
  label: 'State',
  labelClearance: undefined,
  disabled: false,
  required: false,
  placeholder: 'Choose a state',
  filterPlaceholder: 'Filter states',
});

const modelValue = ref<SelectModelValue>(undefined);
</script>

# Combobox

Combobox 将自由文本输入与选项选择结合起来，适用于可搜索的单选和多选流程。

Combobox 与 Select 共用尺寸和菜单颜色偏好。尺寸说明见 [Select 尺寸与工具栏对齐](./select#尺寸与工具栏对齐)，颜色说明见 [Select 菜单外观](./select#菜单外观)。其 `labelClearance` 属性继承自 `fieldContextKey`。请保持周围布局预期的紧凑程度，仅在浮动标签需要额外空间时增加间距。详见[字段布局指南](/zh-Hans/guides/field-layout#标签留白)。

<DemoContainer>
  <div style="max-inline-size: 22rem;">
    <Combobox v-bind="props" v-model="modelValue" :options="stateOptions" />
  </div>
</DemoContainer>

<ApiTable component="Combobox" v-model="props" :exclude="['options', 'multiple']" />

下拉菜单完成退出后，`Combobox` 会转发 Select 的 `closed` 事件。若要释放选项插槽使用的数据，请使用此事件，而不是 `update:open(false)`。

::: info
Combobox 封装了 Select，并共享其 `select` scope。详见 [Select Anatomy](./select)。
:::

## 示例

### 默认

<DemoContainer :src="ComboboxDefaultSrc">
  <ComboboxDefault />
</DemoContainer>

### 多选

<DemoContainer :src="ComboboxMultiSelectSrc">
  <ComboboxMultiSelect />
</DemoContainer>

## 组合式函数

`Combobox` 与 `Select` 共用同一个组合式函数。

### useSelect

<SourceApiTable api="useSelect" />
