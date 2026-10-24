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
import ComboboxAsync from '../../demos/combobox/ComboboxAsync.vue';
import ComboboxAsyncSrc from '../../demos/combobox/ComboboxAsync.vue?raw';
</script>

# Combobox

Combobox 将自由文本输入与选项选择结合起来，适用于可搜索的单选和多选流程。

Combobox 与 Select 共用尺寸和菜单颜色偏好。尺寸说明见 [Select 尺寸与工具栏对齐](./select#尺寸与工具栏对齐)，颜色说明见 [Select 菜单外观](./select#菜单外观)。其 `labelClearance` 属性继承自 `fieldContextKey`。请保持周围布局预期的紧凑程度，仅在浮动标签需要额外空间时增加间距。详见[浮动标签间距指南](/zh-Hans/guides/floating-label-spacing-lab)。

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

## 异步结果

`v-model:query` 暴露查询内容。默认 `filter-mode="local"`；`filter-mode="external"` 会将 `options` 视为当前完整结果集，不再执行额外筛选。请求、取消、过期响应处理、加载和错误状态由调用方管理。加载中或失败时，可将 `list` 插槽替换为状态内容。`empty` 插槽用于自定义普通列表的空结果展示。示例会在模拟请求期间清除过期结果，并忽略过期响应。

选中值不依赖已挂载的行或当前结果。标签先从匹配的 `options` 读取，其次使用 `resolveLabel(value)`，最后回退到 `String(value)`。对于异步结果，请在调用方维护标签目录。即使选项缺失，隐藏表单值和清除按钮仍可正常工作。替换结果后，若当前活动值仍可用则予以保留；否则导航会回到可用的已选结果或第一个可用结果。重新打开时遵循相同规则。关闭时会在视觉退出完成（`closed`）后清除查询；清除选择也会清除查询。

<DemoContainer :src="ComboboxAsyncSrc" :viewport="false"><ComboboxAsync /></DemoContainer>

## 虚拟列表

Combobox 会转发 Select 的 `list` 和 `empty` 插槽。选项行使用 SelectItem 呈现，并遵循相同的 `optionProps` 与 `setScrollToIndex` 约定。支持 10,000 个选项及单选、多选的示例请参阅 [Select 虚拟列表](./select#外部虚拟列表)。
