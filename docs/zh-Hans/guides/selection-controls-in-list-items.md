---
title: 列表项中的选择控件
---

<script setup lang="ts">
import SelectionControlsInListItems from '../../demos/selection-controls-in-list-items/SelectionControlsInListItems.vue';
import SelectionControlsInListItemsSrc from '../../demos/selection-controls-in-list-items/SelectionControlsInListItems.vue?raw';
</script>

# 列表项中的选择控件

`CheckBox`、`Radio` 和 `Switch` 可以出现在列表项中，作为状态指示器。在这种布局中，整行通常是更大、更易点击的目标，而选择控件只负责传达当前状态。

此时请使用控件的 `presentation` 属性。展示模式保留 Material 3 视觉状态，但会移除嵌套的原生输入框、对辅助技术隐藏视觉控件，并禁用控件自身的 state layer 效果。父级行必须提供可访问名称、角色、选中状态、禁用状态和交互反馈。

## 模式

<DemoContainer :src="SelectionControlsInListItemsSrc" :viewport="false"><SelectionControlsInListItems /></DemoContainer>

## 无障碍规则

- 每行只保留一个交互目标。整行是控件；视觉上的 `CheckBox`、`Radio` 或 `Switch` 不应成为另一个可聚焦元素。
- 将可访问名称放在行上，通常使用可见的 `title` 文本。
- 在行上设置 `aria-checked`，并使其与视觉控件的 `checked` 状态保持同步。
- 使用匹配的角色：独立选择使用 `checkbox`，一组单选项使用 `radio`，即时开关设置使用 `switch`。
- 将相关单选行放入带有可访问名称的 `radiogroup` 中。
- 对需要原生单选键盘行为的单选组，请保留原生 radio 输入框，或在父级组中添加方向键导航。
- 禁用某行时，同时禁用该行并向展示控件传入 `disabled`，使视觉状态与交互状态一致。

## 不应使用展示模式的情况

独立控件不要使用 `presentation`。独立的 `CheckBox`、`Radio` 或 `Switch` 应保留其原生输入框，以便表单、键盘交互、焦点指示和辅助技术无需额外代码即可正常工作。

也应避免在可用行内显示禁用状态的视觉控件。这样会让人误以为可见控件不可用，但整行仍会改变状态，造成困惑。
