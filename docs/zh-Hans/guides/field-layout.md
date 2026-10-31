---
title: 字段布局
---

<script setup lang="ts">
import FieldLabelLayouts from '../../.vitepress/components/FieldLabelLayouts.vue';
import FloatingLabelSpacingLab from '../../demos/guides/FloatingLabelSpacingLab.vue';
import FloatingLabelSpacingLabSrc from '../../demos/guides/FloatingLabelSpacingLab.vue?raw';
</script>

# 字段布局

先根据表单场景选择字段尺寸，并保留周围内容原有的布局密度。父级布局使用 `gap` 控制字段组的间距；不要仅因使用字段组件就统一调整间距。

带描边的 `TextField`、`Select` 和 `Combobox` 标签会浮到字段顶部边缘，并可能超出组件的名义边界。仅当这种浮动标签的视觉溢出确实需要额外净空时，再添加 `labelClearance`。它会叠加在父级 `gap` 之上，不负责设定整体布局密度。

## 字段与操作尺寸

small 和 extra-small 字段使用 body-medium 文字，图标基准尺寸为 20dp。medium 字段使用 body-large 文字，图标基准尺寸为 24dp。密度会调整内容周围的留白；排版角色和图标校准决定内容所需的空间。

compact 预设选择 small 字段和 small 按钮：在根字号为 16px 时，两者的默认控件高度均为 30px。此设置适用于 TextField、Select 和 Combobox。外部标签和辅助文字不计入此高度。在很低的密度下，字段内容上下仍至少保留 4dp 内边距。文本区域由内容决定高度，并使用 medium 排版角色。

请参阅[预设预览](./presets)中的筛选与操作行，比较这些控件的组合效果。

## 标签行为

`TextField`、`Select` 和 `Combobox` 共用 `labelBehavior`：

- `floating` 会显示内置浮动标签和描边缺口。这是组件及默认预设的行为。
- `external` 不显示内置标签和缺口，也不为浮动标签预留净空。紧凑预设会选择此行为。

使用 `M3VuePlugin` 的 `fieldLabelBehavior` 设置应用默认值，或使用 `provide(fieldContextKey, { labelBehavior })` 设置子树默认值。两者都接受响应式 ref。组件的 `label-behavior` 属性优先。此设置独立于尺寸、排版和密度。`labelClearance` 和 `alwaysFloatLabel` 仅适用于浮动标签。

外部标签由父级布局负责。将标签放在字段上方或旁边，并将原生 `<label>` 的 `for` 与字段的 `id` 关联。自定义标签元素可使用 `aria-labelledby`。没有可见标签时，传入 `label` 或 `aria-label` 提供无障碍名称；占位符不能替代标签。在 external 模式下，仅当未提供 `aria-label` 或 `aria-labelledby` 时，`label` 才作为 `aria-label` 的回退值；它不会渲染为占位符。

```vue
<template>
  <div class="property-row">
    <label for="part-name">名称</label>
    <TextField id="part-name" v-model="name" label-behavior="external" />
  </div>
  <TextField label="搜索零件" placeholder="搜索…" label-behavior="external" />
</template>

<style scoped>
.property-row {
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr);
  align-items: center;
  column-gap: var(--md-field-column-gap);
}
</style>
```

<FieldLabelLayouts />

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
    <TextField label="Name" label-behavior="floating" />
    <TextField label="Email" type="email" label-behavior="floating" />
    <TextField label="City" label-behavior="floating" />
    <TextField label="Postal code" label-behavior="floating" />
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
