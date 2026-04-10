---
title: Button
---

<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@/components/Button';

import ButtonDefault from '../demos/button/ButtonDefault.vue';
import ButtonDefaultSrc from '../demos/button/ButtonDefault.vue?raw';
import ButtonColors from '../demos/button/ButtonColors.vue';
import ButtonColorsSrc from '../demos/button/ButtonColors.vue?raw';
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

const props = ref({
  toggleable: false,
  color: 'filled',
  size: 'medium',
  shape: 'rounded',
  disabled: false,
  href: undefined,
  leadingIcon: 'favorite',
  trailingIcon: undefined,
});
</script>

# Button

Buttons let people trigger primary, secondary, or low-emphasis actions with Material 3 visual treatments.

<DemoContainer>
  <Button v-bind="props">
    <input v-if="props.toggleable" type="checkbox" />
    Button
  </Button>
</DemoContainer>

<ApiTable component="Button" v-model="props" />

### Default

<DemoContainer :src="ButtonDefaultSrc">
  <ButtonDefault />
</DemoContainer>

### Colors

<DemoContainer :src="ButtonColorsSrc">
  <ButtonColors />
</DemoContainer>

### Sizes

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

<DemoContainer :src="ButtonLeadingIconsSrc">
  <ButtonLeadingIcons />
</DemoContainer>

### Trailing Icons

<DemoContainer :src="ButtonTrailingIconsSrc">
  <ButtonTrailingIcons />
</DemoContainer>
