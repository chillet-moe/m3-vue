---
title: IconButton
---

<script setup lang="ts">
import { ref } from 'vue';
import { IconButton } from '@/components/IconButton';

import IconButtonDefault from '../demos/icon-button/IconButtonDefault.vue';
import IconButtonDefaultSrc from '../demos/icon-button/IconButtonDefault.vue?raw';
import IconButtonColors from '../demos/icon-button/IconButtonColors.vue';
import IconButtonColorsSrc from '../demos/icon-button/IconButtonColors.vue?raw';
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

const props = ref({
  toggleable: false,
  color: 'filled',
  size: 'small',
  shape: 'rounded',
  width: 'default',
  href: undefined,
  icon: 'favorite',
  disabled: false,
});
</script>

# IconButton

Icon buttons expose compact, icon-first actions with the same Material 3 shape, color, and size variants as the library component.

<DemoContainer :viewport="false">
  <IconButton v-bind="props">
    <input v-if="props.toggleable" type="checkbox" />
  </IconButton>
</DemoContainer>

<AnatomyTable scope="icon-button" />

<ApiTable component="IconButton" v-model="props" />

## Examples

### Default

<DemoContainer :src="IconButtonDefaultSrc" :viewport="false">
  <IconButtonDefault />
</DemoContainer>

### Colors

<DemoContainer :src="IconButtonColorsSrc" :viewport="false">
  <IconButtonColors />
</DemoContainer>

### Sizes

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
