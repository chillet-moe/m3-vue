---
title: 图标按钮
---

<script setup lang="ts">
import { ref } from 'vue';
import { IconButton } from '@/components/IconButton';

import IconButtonDefault from '../../demos/icon-button/IconButtonDefault.vue';
import IconButtonDefaultSrc from '../../demos/icon-button/IconButtonDefault.vue?raw';
import IconButtonVariants from '../../demos/icon-button/IconButtonVariants.vue';
import IconButtonVariantsSrc from '../../demos/icon-button/IconButtonVariants.vue?raw';
import IconButtonSizes from '../../demos/icon-button/IconButtonSizes.vue';
import IconButtonSizesSrc from '../../demos/icon-button/IconButtonSizes.vue?raw';
import IconButtonShapes from '../../demos/icon-button/IconButtonShapes.vue';
import IconButtonShapesSrc from '../../demos/icon-button/IconButtonShapes.vue?raw';
import IconButtonWidths from '../../demos/icon-button/IconButtonWidths.vue';
import IconButtonWidthsSrc from '../../demos/icon-button/IconButtonWidths.vue?raw';
import IconButtonDisabled from '../../demos/icon-button/IconButtonDisabled.vue';
import IconButtonDisabledSrc from '../../demos/icon-button/IconButtonDisabled.vue?raw';
import IconButtonToggleable from '../../demos/icon-button/IconButtonToggleable.vue';
import IconButtonToggleableSrc from '../../demos/icon-button/IconButtonToggleable.vue?raw';
import IconButtonTooltip from '../../demos/icon-button/IconButtonTooltip.vue';
import IconButtonTooltipSrc from '../../demos/icon-button/IconButtonTooltip.vue?raw';
import IconButtonRouterLink from '../../demos/icon-button/IconButtonRouterLink.vue';
import IconButtonRouterLinkSrc from '../../demos/icon-button/IconButtonRouterLink.vue?raw';

const props = ref({
  toggleable: false,
  variant: 'standard',
  size: 'small',
  shape: 'rounded',
  width: 'default',
  href: undefined,
  icon: 'favorite',
  disabled: false,
});
</script>

# 图标按钮

图标按钮提供紧凑、以图标为主的操作，并沿用组件库的 Material 3 形状、强调层级和尺寸变体。

操作组件会将 `title` 转换为组件库的工具提示。有关共同行为和可访问名称回退方式，请参阅[操作工具提示](/zh-Hans/components/tooltip#action-tooltips)。

工具栏、列表行和卡片中的辅助操作默认使用 `standard`。`filled` 留给高强调的图标操作；中等强调程度可使用 `outlined` 或 `tonal`。

<DemoContainer :viewport="false">
  <IconButton v-bind="props">
    <input v-if="props.toggleable" type="checkbox" />
  </IconButton>
</DemoContainer>

## 示例

### 默认

<DemoContainer :src="IconButtonDefaultSrc" :viewport="false">
  <IconButtonDefault />
</DemoContainer>

### 变体

<DemoContainer :src="IconButtonVariantsSrc" :viewport="false">
  <IconButtonVariants />
</DemoContainer>

### 尺寸

`size` 属性优先于 `iconButtonContextKey` 中的 `size`，内置回退值为 `small`。可在 `M3VuePlugin` 中设置 `iconButtonSize` 作为应用默认值，或通过上下文配置子树。详见[组件默认值](/zh-Hans/getting-started#组件默认值)。

<DemoContainer :src="IconButtonSizesSrc" :viewport="false">
  <IconButtonSizes />
</DemoContainer>

### 形状

<DemoContainer :src="IconButtonShapesSrc" :viewport="false">
  <IconButtonShapes />
</DemoContainer>

### 宽度s

<DemoContainer :src="IconButtonWidthsSrc" :viewport="false">
  <IconButtonWidths />
</DemoContainer>

### 禁用

<DemoContainer :src="IconButtonDisabledSrc" :viewport="false">
  <IconButtonDisabled />
</DemoContainer>

### 可切换

<DemoContainer :src="IconButtonToggleableSrc" :viewport="false">
  <IconButtonToggleable />
</DemoContainer>

### 工具提示

简单的文本工具提示可通过 `title` 设置。

<DemoContainer :src="IconButtonTooltipSrc" :viewport="false">
  <IconButtonTooltip />
</DemoContainer>

### Vue Router

使用与 `Button` 相同的 `RouterLink custom` 模式，再将 `href` 和 `navigate` 传给 `IconButton`。

<DemoContainer :src="IconButtonRouterLinkSrc" :viewport="false">
  <IconButtonRouterLink />
</DemoContainer>

## 参考

<AnatomyTable scope="icon-button" />

<ApiTable component="IconButton" v-model="props" />

<StyleTokenTable component="IconButton" />
