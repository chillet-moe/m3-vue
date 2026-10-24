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
import SelectVirtual from '../../demos/select/SelectVirtual.vue';
import SelectVirtualSrc from '../../demos/select/SelectVirtual.vue?raw';
</script>

# Select

Select 提供锚定弹出层以供选择一个或多个选项，并使用 combobox/listbox/option 语义；同时支持可选图标、筛选和验证文本。

字段间距由外围布局负责；请保留其预期密度，不要将所有字段组统一为相同间距。`labelClearance` 接受 CSS 长度，用于设置局部块起始方向的间距，也可从 `fieldContextKey` 继承子树默认值；该间距会叠加到父级间距上。请参阅[浮动标签间距指南](/zh-Hans/guides/field-layout)。

<DemoContainer>
  <div style="max-inline-size: 22rem;">
    <Select v-bind="props" v-model="modelValue" :options="coffeeOptions" />
  </div>
</DemoContainer>

## 菜单外观

`menuColor` 会覆盖共享的 Menu 颜色偏好，内置回退值为 `standard`。可通过插件的 `menuColor` 配置，或提供 `menuDefaultsContextKey`，让菜单共享调色板。详见[Menu 颜色](./menu#颜色)。

## 关闭生命周期

Popover 关闭时会立即触发 `update:open(false)` 更新控件状态。弹出层的视觉退出完成后才会触发 `closed`。退出期间会保留筛选状态，并在 `closed` 时重置，因此关闭动画过程中选项列表和尺寸不会发生变化。

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

## 外部虚拟列表

在使用方应用中安装 `@tanstack/vue-virtual`；组件库不会将其作为运行时依赖。本示例使用真实的 [TanStack Vue Virtual 适配器](https://tanstack.com/virtual/latest/docs/framework/vue/vue-virtual)，包含行测量和滚动到指定索引。

Select 和 Combobox 提供 `list` 插槽：

| 成员                         | 约定                                                                                                  |
| ---------------------------- | ----------------------------------------------------------------------------------------------------- |
| `entries`                    | 完整的筛选结果集，每项为 `{ option, index }`；`index` 是该选项在原始 options 中的索引。               |
| `activeIndex`                | `entries` 中的索引，无活动项时为 -1。此状态独立于选中状态。                                           |
| `open`                       | 弹出层是否打开。打开时启用测量。                                                                      |
| `optionProps(index)`         | 绑定到选项根元素：稳定 id、函数 ref、role、ARIA 状态/位置，以及指针和选择处理器。索引取自 `entries`。 |
| `isOptionSelected(option)`   | 返回选中状态，用于渲染勾选标记。                                                                      |
| `setScrollToIndex(callback)` | 注册虚拟器的显示回调；卸载时传入 `undefined` 注销。                                                   |

选项值应使用唯一且稳定的字符串或数字。将 `optionProps(index)`（包括函数 ref）绑定到 `SelectItem`，并根据插槽状态设置其 `active`、`selected` 和 `disabled` 属性。SelectItem 提供 option 语义、整行静态高亮、选中标记和 `tabindex="-1"`。MenuItem 仍用于命令菜单；ListItem 用于一般列表内容。

DOM 焦点由输入框持有。上/下方向键会在完整逻辑结果集中导航并跳过禁用项，且不会循环。弹出层打开时，Home/End 移至第一个/最后一个可用结果。Enter 选择选项（单选后关闭，多选后保持打开）。Escape 关闭但不改变选择。Tab 关闭并继续正常的 Tab 顺序。行的 `tabindex` 为 -1。活动行尚未挂载时，输入框会省略 `aria-activedescendant`；行挂载后由其函数 ref 恢复该属性。组件管理手动 Popover，并负责处理指针点击外部、焦点离开、Escape 和 Tab 关闭，在所属 Document 上注册及清理监听器。

可视范围、滚动和测量由虚拟器负责。打开时注册 `scrollToIndex`；可变高度行使用 `data-index` 配合 `measureElement`。虚拟器的 ResizeObserver 会处理视口和行的变化。内容内边距应放在滚动区域内部；本示例使用单一滚动视口，滚动条位于其外缘。

<DemoContainer :src="SelectVirtualSrc" :viewport="false"><SelectVirtual /></DemoContainer>

<details><summary>VirtualOptions 实现</summary>

<<< @/demos/select/VirtualOptions.vue

</details>

## SelectItem

SelectItem 负责选项呈现，不负责选择状态或键盘导航。可在 Select 或 Combobox 的 `list` 插槽中使用；普通 Select 列表内部也使用该组件。它渲染为非按钮行，`active` 与 `selected` 相互独立。其布局基于 standard ListItem，并支持公开的 `--md-item-*` 布局和颜色 Token。

<AnatomyTable scope="select-item" />

<ApiTable component="SelectItem" />

需要由调用方管理搜索、加载和错误状态时，请参阅 [Combobox](./combobox#异步结果)。

## 迁移

Select/Combobox 现在使用 combobox/listbox/option 语义，焦点保留在输入框上。请更新依赖 Menu 私有 DOM 的测试和样式。`optionLeading` 与 `optionTrailing` 仍可用。

公开的 `useSelect` 接收 `id`、`focus` 和 `blur` 回调，而不是 Menu、触发器和 TextField 引用。将共享的 `open` ref 绑定到 Popover，并在 `closed` 时调用 `handleMenuClosed`。普通或虚拟列表都使用 `list`/`optionProps`；`handleMenuSelect` 已移除。

## 参考

<AnatomyTable scope="select" />

<ApiTable component="Select" v-model="props" :exclude="['options', 'multiple']" />

## Composable

### useSelect

<SourceApiTable api="useSelect" />
