---
title: 按钮
---

<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@/components/Button';

import ButtonDefault from '../../demos/button/ButtonDefault.vue';
import ButtonDefaultSrc from '../../demos/button/ButtonDefault.vue?raw';
import ButtonVariants from '../../demos/button/ButtonVariants.vue';
import ButtonVariantsSrc from '../../demos/button/ButtonVariants.vue?raw';
import ButtonSizes from '../../demos/button/ButtonSizes.vue';
import ButtonSizesSrc from '../../demos/button/ButtonSizes.vue?raw';
import ButtonShapes from '../../demos/button/ButtonShapes.vue';
import ButtonShapesSrc from '../../demos/button/ButtonShapes.vue?raw';
import ButtonDisabled from '../../demos/button/ButtonDisabled.vue';
import ButtonDisabledSrc from '../../demos/button/ButtonDisabled.vue?raw';
import ButtonToggleable from '../../demos/button/ButtonToggleable.vue';
import ButtonToggleableSrc from '../../demos/button/ButtonToggleable.vue?raw';
import ButtonLeadingIcons from '../../demos/button/ButtonLeadingIcons.vue';
import ButtonLeadingIconsSrc from '../../demos/button/ButtonLeadingIcons.vue?raw';
import ButtonTrailingIcons from '../../demos/button/ButtonTrailingIcons.vue';
import ButtonTrailingIconsSrc from '../../demos/button/ButtonTrailingIcons.vue?raw';
import ButtonTooltip from '../../demos/button/ButtonTooltip.vue';
import ButtonTooltipSrc from '../../demos/button/ButtonTooltip.vue?raw';
import ButtonRouterLink from '../../demos/button/ButtonRouterLink.vue';
import ButtonRouterLinkSrc from '../../demos/button/ButtonRouterLink.vue?raw';

const props = ref({
  toggleable: false,
  variant: 'text',
  size: 'medium',
  shape: 'rounded',
  pressShapeMorph: true,
  disabled: false,
  href: undefined,
  leadingIcon: 'favorite',
  trailingIcon: undefined,
});
</script>

# 按钮

按钮用于触发主要、次要或低强调操作，并采用 Material 3 视觉样式。

操作组件会将 `title` 转换为组件库的工具提示。有关共同行为，请参阅[操作工具提示](/zh-Hans/components/tooltip#action-tooltips)。

当操作层级不明确时，`text` 是稳妥的默认样式。只有在某个表面或操作组中唯一的主要流程完成操作才使用 `filled`。重要的次要操作使用 `outlined`；需要比描边样式更醒目时使用 `tonal`。

<DemoContainer>
  <Button v-bind="props">
    <input v-if="props.toggleable" type="checkbox" />
    Button
  </Button>
</DemoContainer>

## 示例

### 默认

<DemoContainer :src="ButtonDefaultSrc">
  <ButtonDefault />
</DemoContainer>

### 变体

<DemoContainer :src="ButtonVariantsSrc">
  <ButtonVariants />
</DemoContainer>

### 尺寸

`size` 属性优先于 `buttonContextKey` 中的 `size`，内置回退值为 `small`。可在 `M3VuePlugin` 中设置 `buttonSize` 作为应用默认值，或通过上下文配置子树。详见[组件默认值](/zh-Hans/getting-started#组件默认值)。

<DemoContainer :src="ButtonSizesSrc">
  <ButtonSizes />
</DemoContainer>

### 形状

<DemoContainer :src="ButtonShapesSrc">
  <ButtonShapes />
</DemoContainer>

### 禁用

<DemoContainer :src="ButtonDisabledSrc">
  <ButtonDisabled />
</DemoContainer>

### 可切换

<DemoContainer :src="ButtonToggleableSrc">
  <ButtonToggleable />
</DemoContainer>

### 前置图标

`leadingIcon` 属性和 `leading` 插槽采用相同的图标尺寸与标签间距。需要自定义图标内容的呈现方式时，请使用插槽。

<DemoContainer :src="ButtonLeadingIconsSrc">
  <ButtonLeadingIcons />
</DemoContainer>

### 尾随图标

`trailingIcon` 属性和 `trailing` 插槽遵循相同的尾随对齐规则。

<DemoContainer :src="ButtonTrailingIconsSrc">
  <ButtonTrailingIcons />
</DemoContainer>

### 工具提示

简单的文本工具提示可通过 `title` 设置。

<DemoContainer :src="ButtonTooltipSrc">
  <ButtonTooltip />
</DemoContainer>

### Vue Router

使用 `RouterLink custom`，并将其 `href` 和 `navigate` 值传给 `Button`。这样最终的锚点元素仍由 `Button` 负责渲染。

<DemoContainer :src="ButtonRouterLinkSrc">
  <ButtonRouterLink />
</DemoContainer>

## 参考

<AnatomyTable scope="button" />

<ApiTable component="Button" v-model="props" />

<StyleTokenTable component="Button" />
