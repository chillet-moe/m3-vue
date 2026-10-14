---
title: Select
---

<script setup lang="ts">
import { ref } from 'vue';
import type { SelectModelValue } from '@/components/Select';
import { Select } from '@/components/Select';
import { coffeeOptions } from '../../demos/shared/selectOptions';

import SelectDefault from '../../demos/select/SelectDefault.vue';
import SelectDefaultSrc from '../../demos/select/SelectDefault.vue?raw';
import SelectWithoutIcons from '../../demos/select/SelectWithoutIcons.vue';
import SelectWithoutIconsSrc from '../../demos/select/SelectWithoutIcons.vue?raw';
import SelectFiltering from '../../demos/select/SelectFiltering.vue';
import SelectFilteringSrc from '../../demos/select/SelectFiltering.vue?raw';
import SelectConfigurations from '../../demos/select/SelectConfigurations.vue';
import SelectConfigurationsSrc from '../../demos/select/SelectConfigurations.vue?raw';
import FieldSizes from '../../demos/shared/FieldSizes.vue';
import FieldSizesSrc from '../../demos/shared/FieldSizes.vue?raw';

const props = ref({
  label: 'Coffee',
  size: 'medium',
  labelClearance: undefined,
  disabled: false,
  required: false,
  placeholder: 'Choose an option',
  filterable: false,
  filterPlaceholder: 'Filter options',
});

const modelValue = ref<SelectModelValue>(undefined);
</script>

# Select

Select 提供锚定菜单以供选择一个或多个选项，并支持可选图标、筛选和验证文本。

字段间距由外围布局负责；请保留其预期密度，不要将所有字段组统一为相同间距。`labelClearance` 接受 CSS 长度，用于设置局部块起始方向的间距，也可从 `fieldContextKey` 继承子树默认值；该间距会叠加到父级间距上。请参阅[浮动标签间距指南](../../guides/floating-label-spacing-lab)。

<DemoContainer>
  <div style="max-inline-size: 22rem;">
    <Select v-bind="props" v-model="modelValue" :options="coffeeOptions" />
  </div>
</DemoContainer>

<AnatomyTable scope="select" />

<ApiTable component="Select" v-model="props" :exclude="['options', 'multiple']" />

## 菜单外观

`menuColor` 会覆盖共享的 Menu 颜色偏好，内置回退值为 `standard`。可通过插件的 `menuColor` 配置，或提供 `menuDefaultsContextKey`，让菜单共享调色板。详见[Menu 颜色](./menu#颜色)。

## 关闭生命周期

原生菜单关闭时会立即触发 `update:open(false)` 更新控件状态。菜单的视觉退出完成后才会触发 `closed`。退出期间会保留筛选状态，并在 `closed` 时重置，因此菜单关闭动画过程中选项列表和尺寸不会发生变化。

## 示例

### 尺寸与工具栏对齐

Select 和 Combobox 与 TextField 使用相同的触发器尺寸：`extra-small`（32px）、`small`（40px）和 `medium`（56px）。`size` 属性优先于 `fieldContextKey` 中的 `size`，内置回退值为 `medium`。可通过 `M3VuePlugin` 配置 `fieldSize`，或通过上下文配置子树。详见[组件默认值](/zh-Hans/getting-started#组件默认值)。

<DemoContainer :src="FieldSizesSrc">
  <FieldSizes />
</DemoContainer>

### 默认

<DemoContainer :src="SelectDefaultSrc">
  <SelectDefault />
</DemoContainer>

### 无图标

<DemoContainer :src="SelectWithoutIconsSrc">
  <SelectWithoutIcons />
</DemoContainer>

### 筛选

<DemoContainer :src="SelectFilteringSrc">
  <SelectFiltering />
</DemoContainer>

### 配置

<DemoContainer :src="SelectConfigurationsSrc">
  <SelectConfigurations />
</DemoContainer>

## Composable

### useSelect

<SourceApiTable api="useSelect" />
