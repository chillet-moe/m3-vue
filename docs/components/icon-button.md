---
title: IconButton
---

<script setup lang="ts">
import { ref } from 'vue';
import { IconButton } from '@/components/IconButton';

import IconButtonDefault from '../demos/icon-button/IconButtonDefault.vue';
import IconButtonDefaultSrc from '../demos/icon-button/IconButtonDefault.vue?raw';
import IconButtonVariants from '../demos/icon-button/IconButtonVariants.vue';
import IconButtonVariantsSrc from '../demos/icon-button/IconButtonVariants.vue?raw';
import IconButtonSizes from '../demos/icon-button/IconButtonSizes.vue';
import IconButtonSizesSrc from '../demos/icon-button/IconButtonSizes.vue?raw';
import IconButtonShapes from '../demos/icon-button/IconButtonShapes.vue';
import IconButtonShapesSrc from '../demos/icon-button/IconButtonShapes.vue?raw';
import IconButtonWidths from '../demos/icon-button/IconButtonWidths.vue';
import IconButtonWidthsSrc from '../demos/icon-button/IconButtonWidths.vue?raw';
import IconButtonDisabled from '../demos/icon-button/IconButtonDisabled.vue';
import IconButtonDisabledSrc from '../demos/icon-button/IconButtonDisabled.vue?raw';
import IconButtonToggleable from '../demos/icon-button/IconButtonToggleable.vue';
import IconButtonToggleableSrc from '../demos/icon-button/IconButtonToggleable.vue?raw';
import IconButtonTooltip from '../demos/icon-button/IconButtonTooltip.vue';
import IconButtonTooltipSrc from '../demos/icon-button/IconButtonTooltip.vue?raw';
import IconButtonRouterLink from '../demos/icon-button/IconButtonRouterLink.vue';
import IconButtonRouterLinkSrc from '../demos/icon-button/IconButtonRouterLink.vue?raw';

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

# IconButton

Icon buttons expose compact, icon-first actions with the same Material 3 shape, emphasis, and size variants as the library component.

Action components convert `title` into the library tooltip. See [Action Tooltips](/components/tooltip#action-tooltips) for the shared behavior and accessible-name fallback.

`standard` is the default for supplementary actions, including toolbar, list-row, and card actions. Reserve `filled`
for a high-emphasis icon action; use `outlined` or `tonal` for intermediate emphasis.

<DemoContainer :viewport="false">
  <IconButton v-bind="props">
    <input v-if="props.toggleable" type="checkbox" />
  </IconButton>
</DemoContainer>

## Examples

### Default

<DemoContainer :src="IconButtonDefaultSrc" :viewport="false">
  <IconButtonDefault />
</DemoContainer>

### Variants

<DemoContainer :src="IconButtonVariantsSrc" :viewport="false">
  <IconButtonVariants />
</DemoContainer>

### Sizes

The `size` prop overrides `iconButtonContextKey`'s `size`, with `small` as the fallback. Set `iconButtonSize` in
`M3VuePlugin` for an application default, or provide the context for a subtree. See [component defaults](/getting-started#component-defaults).

<DemoContainer :src="IconButtonSizesSrc" :viewport="false">
  <IconButtonSizes />
</DemoContainer>

### Shapes

<DemoContainer :src="IconButtonShapesSrc" :viewport="false">
  <IconButtonShapes />
</DemoContainer>

### Widths

<DemoContainer :src="IconButtonWidthsSrc" :viewport="false">
  <IconButtonWidths />
</DemoContainer>

### Disabled

<DemoContainer :src="IconButtonDisabledSrc" :viewport="false">
  <IconButtonDisabled />
</DemoContainer>

### Toggleable

<DemoContainer :src="IconButtonToggleableSrc" :viewport="false">
  <IconButtonToggleable />
</DemoContainer>

### Tooltip

Use `title` for a simple text tooltip.

<DemoContainer :src="IconButtonTooltipSrc" :viewport="false">
  <IconButtonTooltip />
</DemoContainer>

### Vue Router

Use the same `RouterLink custom` pattern as `Button`, then forward `href` and `navigate` to `IconButton`.

<DemoContainer :src="IconButtonRouterLinkSrc" :viewport="false">
  <IconButtonRouterLink />
</DemoContainer>

## Reference

<AnatomyTable scope="icon-button" />

<ApiTable component="IconButton" v-model="props" />

<StyleTokenTable component="IconButton" />
