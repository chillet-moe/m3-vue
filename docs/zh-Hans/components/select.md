---
title: Select
---

<script setup lang="ts">
import { ref } from 'vue';
import type { SelectModelValue } from '@/components/Select';
import { Select } from '@/components/Select';
import { coffeeOptions } from '../../demos/shared/selectOptions';

import SelectVirtual from '../../demos/select/SelectVirtual.vue';
import SelectVirtualSrc from '../../demos/select/SelectVirtual.vue?raw';

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

字段间距由外围布局负责；请保留其预期密度，不要将所有字段组统一为相同间距。`labelClearance` 接受 CSS 长度，用于设置局部块起始方向的间距，也可从 `fieldContextKey` 继承子树默认值；该间距会叠加到父级间距上。请参阅[字段布局指南](/zh-Hans/guides/field-layout#标签留白)。

<DemoContainer>
  <div style="max-inline-size: 22rem;">
    <Select v-bind="props" v-model="modelValue" :options="coffeeOptions" />
  </div>
</DemoContainer>

<AnatomyTable scope="select" />

<ApiTable component="Select" v-model="props" :exclude="['options', 'multiple']" />

## 菜单外观

`menuColor` 会覆盖共享的 Menu 颜色偏好，内置回退值为 `standard`。可通过插件的 `menuColor` 配置，或提供 `menuDefaultsContextKey`，让菜单共享调色板。详见[Menu 颜色](./menu#颜色)。

### 选中标记

在 Select 或 Combobox 上设置 `:show-selected-icon="false"`，可隐藏选中标记，同时保留选中背景、前置内容和选择语义。没有前置内容的行不会预留选中标记的空间，选中时文本也不会偏移。使用自定义 `list` 插槽中的 `SelectItem` 行时同样适用。

如需设置应用级默认值，可使用 `app.use(M3VuePlugin, { selectDefaults: { showSelectedIcon: false } })`。如需设置子树默认值，可在 setup 中调用 `provideSelectDefaults({ showSelectedIcon: ref(false) })`。也可直接使用公开的 `selectContextKey` 提供默认值。优先级为：实例 prop → 子树默认值 → 应用默认值 → `true`。`provideSelectDefaults` 会继承未指定的字段；ref 保持响应性，将偏好值或 prop 设为 `undefined` 即可恢复继承。

## 外部虚拟列表

`list` 插槽只替换选项的呈现方式。Select 仍负责菜单界面、滚动容器、选择、筛选、键盘导航和关闭生命周期。使用每个条目的 `option` 及其在**筛选结果中的索引**渲染 `SelectItem`，并以 `option.value` 作为 key。选项值必须唯一且稳定。`SelectItem` 与内置列表使用相同的 MenuItem 呈现方式，包括图标、选中动效和首尾选项的形状。其 `default`、`leading` 和 `trailing` 插槽会接收 `{ option, selected }`。

插槽提供：

- `entries`：完整的筛选结果集合，每项为 `{ option, index }`；每项的 `index` 指向原始 options。
- `scrollElement`：现有的 MenuContainer 滚动元素；将其用作虚拟列表的滚动元素。
- `open`：弹出菜单是否打开；关闭时应禁用测量。
- `activeIndex`：筛选结果集合中的活动索引，独立于选中状态。
- `setScrollToIndex(callback)`：注册虚拟器滚动回调；卸载时传入 `undefined` 注销。

请在 `options` 中保留完整逻辑结果集，不要只传入当前挂载窗口。虚拟列表负责测量行高和定位，不应额外创建滚动容器或维护选择状态。虚拟行不会使用内置列表的筛选过渡效果；重新挂载已选行也不会重播选中动画。Select 和 Combobox 的自定义列表均可使用 `list`。TanStack 仅用于本示例，并非组件库依赖。

<DemoContainer :src="SelectVirtualSrc"><SelectVirtual /></DemoContainer>

<details><summary>共享虚拟列表组件</summary>

<<< ../../demos/select/VirtualSelectList.vue

</details>

## 搜索结果与选中标签

`v-model:query` 暴露筛选文本。默认使用本地筛选。设置 `filterMode="external"` 时，由调用方加载并提供当前完整结果集，并负责请求取消和过期响应处理。`resolveLabel(value)` 可为当前结果集中不存在的已选值提供标签。在此同步回调中读取响应式标签缓存；异步数据到达时更新该缓存。缺少标签时回退为字符串形式的值。清除和表单提交仍使用已选值，与行是否挂载无关。

## 键盘与无障碍

字段使用 `combobox` 语义，并控制包含 `option` 行的 `listbox`。焦点保留在字段中。方向键会循环导航所有未禁用的选项；菜单打开时，Home/End 移至首尾选项。Enter 选择活动选项；对于不可筛选的 Select，空格键也会选择。Escape 和 Tab 会关闭弹出菜单。导航不会选中选项。只有活动行已挂载时才会设置 `aria-activedescendant`。迁移自定义 DOM 查询时，应使用这些角色查询，替代之前的菜单项角色。

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
