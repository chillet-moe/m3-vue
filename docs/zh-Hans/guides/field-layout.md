---
title: 字段布局
---

<script setup lang="ts">
import FloatingLabelSpacingLab from '../../demos/guides/FloatingLabelSpacingLab.vue';
import FloatingLabelSpacingLabSrc from '../../demos/guides/FloatingLabelSpacingLab.vue?raw';
</script>

# 字段布局

先根据表单场景选择字段尺寸，并保留周围内容原有的布局密度。父级布局使用 `gap` 控制字段组的间距；不要仅因使用字段组件就统一调整间距。

带描边的 `TextField`、`Select` 和 `Combobox` 标签会浮到字段顶部边缘，并可能超出组件的名义边界。仅当这种浮动标签的视觉溢出确实需要额外净空时，再添加 `labelClearance`。它会叠加在父级 `gap` 之上，不负责设定整体布局密度。

## 布局间距 token

在父级 grid 或 flex 布局中使用以下 token：

| Token                   | 默认值 | 用途   |
| ----------------------- | ------ | ------ |
| `--md-field-row-gap`    | `1rem` | 行间距 |
| `--md-field-column-gap` | `1rem` | 列间距 |

这两个 token 已包含在 `style.css` 中，并且在两种主题下默认值相同。它们不会为组件添加外边距，也不会影响未引用它们的布局。请根据表单内容选择合适的值；默认值仅供起步参考。

```vue
<template>
  <div class="profile-fields">
    <TextField label="Name" />
    <TextField label="Email" type="email" />
    <TextField label="City" />
    <TextField label="Postal code" />
  </div>
</template>

<style scoped>
.profile-fields {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr));
  row-gap: var(--md-field-row-gap);
  column-gap: var(--md-field-column-gap);
}
</style>
```

可以在全局或某个容器区域设置 token，让多个表单共用间距：

```css
.account-settings {
  --md-field-row-gap: 1.5rem;
  --md-field-column-gap: 1rem;
}
```

嵌套布局会继承这些值，也可以分别覆盖任一方向。对于 flex 布局，CSS 的 `row-gap` 和 `column-gap` 会根据容器方向和换行方式生效；纵向堆叠时，项目之间使用 `row-gap`。

修改 `--md-density` 会改变控件内部留白，不会改变这些间距。修改 `labelClearance` 会在字段上方增加外边距，不会改变父级间距。这些 token 也可用于混合设置组；区块间距和操作行间距仍由对应布局决定。

## 标签留白

`TextField`、`Select` 和 `Combobox` 接受 `labelClearance`，这是一个应用于块起始外边距的 CSS 长度。默认未设置，因此组件不会增加留白，也不会覆盖语义类中的布局样式。

```vue
<TextField label-clearance="0.5rem" />
```

这种不对称间距反映了实际溢出情况：浮动标签会越过字段的块起始边缘，而组件在块末端没有对应的视觉溢出。如果留白需要随文档根字号缩放，优先使用 `rem`，但也接受任何有效的 CSS 长度。

标签留白不能替代组布局：它会与 flex 或 grid 的 `gap` 相加。父级间距仍负责所有子元素之间的节奏，`labelClearance` 只补偿字段浮动标签的溢出。

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

## 在示例中比较

使用 `1rem` 或 `24px` 等 CSS 长度调整行间距和列间距；清空任一输入框即可继承对应 token。分别调整密度和标签留白，对比控件高度、布局间距和浮动标签的空间。空间不足时，字段网格会折叠为单列。混合面板使用相同的行间距。

<DemoContainer :src="FloatingLabelSpacingLabSrc" :viewport="false">
  <FloatingLabelSpacingLab />
</DemoContainer>
