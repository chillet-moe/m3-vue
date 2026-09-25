---
title: 浮动标签间距实验
---

<script setup lang="ts">
import FloatingLabelSpacingLab from '../../demos/guides/FloatingLabelSpacingLab.vue';
import FloatingLabelSpacingLabSrc from '../../demos/guides/FloatingLabelSpacingLab.vue?raw';
</script>

# 浮动标签间距实验

带描边的 `TextField`、`Select` 和 `Combobox` 标签可以浮到字段顶部边缘。标签绘制位置部分超出组件的名义边界，因此即使布局间距在计算上正确，视觉上仍可能显得过于紧凑。

此页面便于比较这种视觉溢出。可将垂直间距从 `0px` 调整到 `40px`；虚线轮廓表示每项的名义边界，浮动标签可能超出轮廓。也可以设置组件的 `labelClearance`，查看具体 CSS 长度如何与父级间距叠加，适用于仅字段堆叠和混合设置面板两种布局。

::: tip 布局归属
此示例的父级 `row-gap` 初始为 `8px`，标签留白为 `0.5rem`，因为这种组合可作为协调的常规密度参考。请将其视为视觉起点，而不是迁移规则：根据周围内容选择间距，并仅在浮动标签需要时增加留白。
:::

<DemoContainer :src="FloatingLabelSpacingLabSrc" :viewport="false">
  <FloatingLabelSpacingLab />
</DemoContainer>

## 比较内容

- 相邻浮动标签和字段轮廓之间是否有足够的视觉间隔。
- 同一个间距值是否适用于已填字段，以及带占位符的空字段。
- 与标题、正文、选择控件、分隔线和操作相邻时，所选间距是否仍然合适。
- 具体的 `labelClearance` 长度如何叠加到所选父级间距上。

## 标签留白

`TextField`、`Select` 和 `Combobox` 接受 `labelClearance`，这是一个应用于块起始外边距的 CSS 长度。默认未设置，因此组件不会增加留白，也不会覆盖语义类中的布局样式。

```vue
<TextField label-clearance="0.5rem" />
```

这种不对称间距反映了实际溢出情况：浮动标签会越过字段的块起始边缘，而组件在块末端没有对应的视觉溢出。如果留白需要随文档根字号缩放，优先使用 `rem`，但也接受任何有效的 CSS 长度。

标签留白不能替代组布局：它会与 flex 或 grid 的 `gap` 相加。父级间距仍负责所有子元素之间的节奏，标签留白只补偿字段浮动标签的溢出。

## 为子树提供默认值

如果某个组件子树共用相同的留白，可从任意现有祖先 provide `fieldContextKey`。值可以是字符串、`ref` 或 `computed`；显式组件属性优先级更高。

```vue
<script setup lang="ts">
import { computed, provide, ref } from 'vue';
import { fieldContextKey } from '@chillet/m3-vue';

const compact = ref(true);
const labelClearance = computed(() => (compact.value ? '0.5rem' : '0.75rem'));

provide(fieldContextKey, { labelClearance });
</script>
```

不要仅因为子树中包含字段就提供留白。请保留现有密度，并只在共享视觉样式确有需要时提供该值。
