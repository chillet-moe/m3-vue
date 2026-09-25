---
title: 可滚动内容的视觉溢出
---

<script setup lang="ts">
import ScrollableContentVisualOverflow from '../../demos/guides/ScrollableContentVisualOverflow.vue';
import ScrollableContentVisualOverflowSrc from '../../demos/guides/ScrollableContentVisualOverflow.vue?raw';
</script>

# 可滚动内容的视觉溢出

Dialog、BottomSheet 和 SideSheet 会在公开内容滚动时保持标题和操作可见。其内容滚动区域在块轴方向包含默认的视觉溢出内缩，因此普通子元素的海拔阴影、焦点指示器、浮动标签、轮廓和小幅变换不会在滚动区域的首尾位置被裁剪。

此内缩会扩展滚动区域的有效绘制范围，但不会改变插槽内容对齐方式、表面尺寸，也不会改变标题、内容和操作之间的视觉间距。行内内容的内边距已在起始端和末端提供等效空间。

Popover 通过现有的全轴 `--md-popover-padding` 遵循相同的默认支持原则。Tabs、Select 和 DatePicker 也包含滚动区域，但这些区域管理的是受控组件内部内容，而非任意公开内容。

<DemoContainer :src="ScrollableContentVisualOverflowSrc" :viewport="false">
  <ScrollableContentVisualOverflow />
</DemoContainer>

## 组件 Token

每个表面都公开自己的 token，默认值为 `0.5rem`：

| 组件        | Token                                             |
| ----------- | ------------------------------------------------- |
| Dialog      | `--md-dialog-content-visual-overflow-inset`       |
| BottomSheet | `--md-bottom-sheet-content-visual-overflow-inset` |
| SideSheet   | `--md-side-sheet-content-visual-overflow-inset`   |

如果自定义内容有意使用更大的阴影或变换，请增大内缩。只有内容有意铺满边缘或裁剪本身属于设计的一部分时，才将其设为 `0px`。

```css
.large-elevation-dialog {
  --md-dialog-content-visual-overflow-inset: 1rem;
}
```

此约定适用于附着在普通内容上的视觉效果。嵌套菜单、提示框、popover 和其他浮层仍应使用各自组件的顶层行为，而不要依赖祖先元素的内缩。
