---
title: 交互光标
---

<script setup lang="ts">
import InteractionCursors from '../../demos/guides/InteractionCursors.vue';
import InteractionCursorsSrc from '../../demos/guides/InteractionCursors.vue?raw';
</script>

# 交互光标

M3 Vue 通过继承式语义 CSS token 提供光标策略。只需设置一次策略，无需覆盖组件类或内部元素。

| Token                | 默认值    | 适用范围                                                                                                 |
| -------------------- | --------- | -------------------------------------------------------------------------------------------------------- |
| `--md-cursor-action` | `pointer` | 在当前界面中执行操作的控件，包括按钮、卡片、选择控件、菜单、导航控件、标签页、日期选择器、选择框和滑块。 |
| `--md-cursor-link`   | `pointer` | 渲染了有效 `href` 的 M3 Vue 链接组件。                                                                   |

若要让普通控件使用默认箭头，同时保留链接的手形光标以表示导航到 URL：

```css
:root {
  --md-cursor-action: default;
  --md-cursor-link: pointer;
}
```

两项默认值均为 `pointer`，因此现有应用的行为保持不变。保留独立 token 后，应用可以采用桌面风格的操作光标，同时避免链接在视觉上与操作混淆。

## 作用范围和继承

这些 token 是普通的继承式自定义属性。`:root` 覆盖会作用于整个文档、原生顶层中的组件，以及通过宿主元素设置的 Shadow DOM 内组件样式。局部覆盖可以只更改单个组件或 DOM 子树。

Teleport 遵循渲染后的 DOM 树，而不是 Vue 组件树。若传送到其他位置的菜单或日期选择器也需要该策略，请在 `:root` 或包含它们的实际浮层宿主上设置；只设置在逻辑 Vue 父级上的自定义属性不会跨越 Teleport 边界。

实际链接根据其有效 `href` 识别。禁用的链接组件会移除 `href`，并保留禁用状态下的光标行为。

## 例外

这些 token 只会替换普通操作和链接的光标。它们不会应用全局选择器，也不会改变文本插入、帮助、十字线、抓取/正在抓取、缩放、移动或禁止操作等语义光标。禁用、只读和仅展示状态的组件也会保留显式的 `default` 或继承光标行为。

<DemoContainer :src="InteractionCursorsSrc" :viewport="false">
  <InteractionCursors />
</DemoContainer>
