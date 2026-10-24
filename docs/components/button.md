---
title: Button
---

<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@/components/Button';

import ButtonDefault from '../demos/button/ButtonDefault.vue';
import ButtonDefaultSrc from '../demos/button/ButtonDefault.vue?raw';
import ButtonVariants from '../demos/button/ButtonVariants.vue';
import ButtonVariantsSrc from '../demos/button/ButtonVariants.vue?raw';
import ButtonSizes from '../demos/button/ButtonSizes.vue';
import ButtonSizesSrc from '../demos/button/ButtonSizes.vue?raw';
import ButtonShapes from '../demos/button/ButtonShapes.vue';
import ButtonShapesSrc from '../demos/button/ButtonShapes.vue?raw';
import ButtonDisabled from '../demos/button/ButtonDisabled.vue';
import ButtonDisabledSrc from '../demos/button/ButtonDisabled.vue?raw';
import ButtonToggleable from '../demos/button/ButtonToggleable.vue';
import ButtonToggleableSrc from '../demos/button/ButtonToggleable.vue?raw';
import ButtonLeadingIcons from '../demos/button/ButtonLeadingIcons.vue';
import ButtonLeadingIconsSrc from '../demos/button/ButtonLeadingIcons.vue?raw';
import ButtonTrailingIcons from '../demos/button/ButtonTrailingIcons.vue';
import ButtonTrailingIconsSrc from '../demos/button/ButtonTrailingIcons.vue?raw';
import ButtonTooltip from '../demos/button/ButtonTooltip.vue';
import ButtonTooltipSrc from '../demos/button/ButtonTooltip.vue?raw';
import ButtonRouterLink from '../demos/button/ButtonRouterLink.vue';
import ButtonRouterLinkSrc from '../demos/button/ButtonRouterLink.vue?raw';

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

# Button

Buttons let people trigger primary, secondary, or low-emphasis actions with Material 3 visual treatments.

Action components convert `title` into the library tooltip. See [Action Tooltips](/components/tooltip#action-tooltips) for the shared behavior.

`text` is the safe default when an action's hierarchy is not known. Use `filled` only for the single primary,
flow-completing action in a surface or action group. Use `outlined` for important secondary actions and `tonal`
when they need more emphasis than an outline.

<DemoContainer>
  <Button v-bind="props">
    <input v-if="props.toggleable" type="checkbox" />
    Button
  </Button>
</DemoContainer>

## Examples

### Default

<DemoContainer :src="ButtonDefaultSrc">
  <ButtonDefault />
</DemoContainer>

### Variants

<DemoContainer :src="ButtonVariantsSrc">
  <ButtonVariants />
</DemoContainer>

### Sizes

The `size` prop overrides `buttonContextKey`'s `size`, with `small` as the fallback. Set `buttonSize` in
`M3VuePlugin` for an application default, or provide the context for a subtree. See [component defaults](/getting-started#component-defaults).

<DemoContainer :src="ButtonSizesSrc">
  <ButtonSizes />
</DemoContainer>

### Shapes

<DemoContainer :src="ButtonShapesSrc">
  <ButtonShapes />
</DemoContainer>

### Disabled

<DemoContainer :src="ButtonDisabledSrc">
  <ButtonDisabled />
</DemoContainer>

### Toggleable

<DemoContainer :src="ButtonToggleableSrc">
  <ButtonToggleable />
</DemoContainer>

### Leading Icons

The `leadingIcon` prop and `leading` slot share the same size and label spacing. Use the slot when the icon content needs custom rendering.

<DemoContainer :src="ButtonLeadingIconsSrc">
  <ButtonLeadingIcons />
</DemoContainer>

### Trailing Icons

The `trailingIcon` prop and `trailing` slot use the same trailing alignment contract.

<DemoContainer :src="ButtonTrailingIconsSrc">
  <ButtonTrailingIcons />
</DemoContainer>

### Tooltip

Use `title` for a simple text tooltip.

<DemoContainer :src="ButtonTooltipSrc">
  <ButtonTooltip />
</DemoContainer>

### Vue Router

Use `RouterLink custom` and pass its `href` and `navigate` values into `Button`. That keeps `Button` responsible for rendering the final anchor element.

<DemoContainer :src="ButtonRouterLinkSrc">
  <ButtonRouterLink />
</DemoContainer>

## Reference

<AnatomyTable scope="button" />

<ApiTable component="Button" v-model="props" />

<StyleTokenTable component="Button" />
