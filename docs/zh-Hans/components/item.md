---
title: ListItem
---

<script setup lang="ts">
import { ref } from 'vue';
import { ListItem } from '@/components/ListItem';

import ItemDefault from '../../demos/item/ItemDefault.vue';
import ItemDefaultSrc from '../../demos/item/ItemDefault.vue?raw';
import ItemCompositions from '../../demos/item/ItemCompositions.vue';
import ItemCompositionsSrc from '../../demos/item/ItemCompositions.vue?raw';
import ItemRouterLink from '../../demos/item/ItemRouterLink.vue';
import ItemRouterLinkSrc from '../../demos/item/ItemRouterLink.vue?raw';

const props = ref({
  appearance: 'standard',
  interactive: true,
  shape: 'rounded',
  disabled: false,
  active: false,
  href: undefined,
  leadingIcon: 'person',
  trailingIcon: 'chevron_right',
  title: '个人资料',
  description: '管理你的帐户设置。',
});
import ItemAppearances from '../../demos/item/ItemAppearances.vue';
import ItemAppearancesSrc from '../../demos/item/ItemAppearances.vue?raw';
import SelectionControlsInListItems from '../../demos/selection-controls-in-list-items/SelectionControlsInListItems.vue';
import SelectionControlsInListItemsSrc from '../../demos/selection-controls-in-list-items/SelectionControlsInListItems.vue?raw';
</script>

# ListItem

ListItem 提供丰富的列表项布局。默认情况下它可交互，并渲染为按钮；设置 `href` 时则渲染为锚点。对于纯信息行或由内部控件负责交互的行，可设置 `interactive="false"`。此时列表项会渲染为 `div`，不具备按钮、链接、焦点、状态层或按压行为。列表项处于被动状态时，任何 `href` 都会被忽略。

<DemoContainer><ListItem v-bind="props" /></DemoContainer>

`ListItem` 会自动参与 [List Grouping](/zh-Hans/utilities/list-grouping) CSS 工具类的分组；该工具类也可用于分组其他元素和组件。

## 示例

### 默认

<DemoContainer :src="ItemDefaultSrc"><ItemDefault /></DemoContainer>

### 组合用法

<DemoContainer :src="ItemCompositionsSrc"><ItemCompositions /></DemoContainer>

### Vue Router

当 `ListItem` 用作导航时，请使用 `RouterLink custom`，并将其 `href` 和 `navigate` 传给该组件。

<DemoContainer :src="ItemRouterLinkSrc"><ItemRouterLink /></DemoContainer>

## 外观

`appearance="standard"` 是默认值：活动指示器固定为整行宽度、转角紧凑，并且不会展开高亮或执行按压形状变换。`appearance="expressive"` 保留展开式指示器和按压形状变换。外观不会改变按钮/链接/展示语义、插槽或布局 Token。应用级外观可通过 `listItemDefaults.appearance` 设置，子树可在 setup 中调用 `provideListItemDefaults()`；实例的 `appearance` 属性优先级更高。

<DemoContainer :src="ItemAppearancesSrc"><ItemAppearances /></DemoContainer>

现有条目如需保留之前的外观，可设置 `appearance="expressive"`。`shape` 属性控制 expressive 外观的形状；standard 使用 `--md-shape-compact`。`--md-item-indicator-shape` 可定制两种外观中的指示器。`SelectItem` 明确使用 `standard`，不受 `listItemDefaults` 影响。

选择选项请使用 [SelectItem](./select#selectitem)，菜单命令请使用 [MenuItem](./menu)。ListItem 仍用于一般列表项。外观与密度建议请参阅[样式指南](../guides/styling#选择外观与密度)。

## 列表项中的选择控件 {#selection-controls}

`CheckBox`、`Radio` 和 `Switch` 可以出现在列表项中，作为状态指示器。在这种布局中，整行通常是更大、更易点击的目标，而选择控件只负责传达当前状态。

此时请使用控件的 `presentation` 属性。展示模式保留 Material 3 视觉状态，但会移除嵌套的原生输入框、对辅助技术隐藏视觉控件，并禁用控件自身的 state layer 效果。父级行必须提供可访问名称、角色、选中状态、禁用状态和交互反馈。

### 模式

<DemoContainer :src="SelectionControlsInListItemsSrc" :viewport="false"><SelectionControlsInListItems /></DemoContainer>

### 无障碍规则

- 每行只保留一个交互目标。整行是控件；视觉上的 `CheckBox`、`Radio` 或 `Switch` 不应成为另一个可聚焦元素。
- 将可访问名称放在行上，通常使用可见的 `title` 文本。
- 在行上设置 `aria-checked`，并使其与视觉控件的 `checked` 状态保持同步。
- 使用匹配的角色：独立选择使用 `checkbox`，一组单选项使用 `radio`，即时开关设置使用 `switch`。
- 将相关单选行放入带有可访问名称的 `radiogroup` 中。
- 对需要原生单选键盘行为的单选组，请保留原生 radio 输入框，或在父级组中添加方向键导航。
- 禁用某行时，同时禁用该行并向展示控件传入 `disabled`，使视觉状态与交互状态一致。

### 不应使用展示模式的情况

独立控件不要使用 `presentation`。独立的 `CheckBox`、`Radio` 或 `Switch` 应保留其原生输入框，以便表单、键盘交互、焦点指示和辅助技术无需额外代码即可正常工作。

也应避免在可用行内显示禁用状态的视觉控件。这样会让人误以为可见控件不可用，但整行仍会改变状态，造成困惑。

## 参考

<AnatomyTable scope="item" />

<ApiTable component="ListItem" v-model="props" />

<StyleTokenTable component="ListItem" />
