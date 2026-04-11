---
title: ButtonGroup
---

<script setup lang="ts">
import { ref, watch } from 'vue';
import { ButtonGroup, ButtonGroupItem } from '@/components/ButtonGroup';

import ButtonGroupDefault from '../demos/button-group/ButtonGroupDefault.vue';
import ButtonGroupDefaultSrc from '../demos/button-group/ButtonGroupDefault.vue?raw';
import ButtonGroupTypes from '../demos/button-group/ButtonGroupTypes.vue';
import ButtonGroupTypesSrc from '../demos/button-group/ButtonGroupTypes.vue?raw';
import ButtonGroupSizes from '../demos/button-group/ButtonGroupSizes.vue';
import ButtonGroupSizesSrc from '../demos/button-group/ButtonGroupSizes.vue?raw';
import ButtonGroupColors from '../demos/button-group/ButtonGroupColors.vue';
import ButtonGroupColorsSrc from '../demos/button-group/ButtonGroupColors.vue?raw';
import ButtonGroupDisabled from '../demos/button-group/ButtonGroupDisabled.vue';
import ButtonGroupDisabledSrc from '../demos/button-group/ButtonGroupDisabled.vue?raw';
import ButtonGroupMultiple from '../demos/button-group/ButtonGroupMultiple.vue';
import ButtonGroupMultipleSrc from '../demos/button-group/ButtonGroupMultiple.vue?raw';

const props = ref({
  type: 'standard',
  size: 'small',
  color: 'tonal',
  disabled: false,
  selectionMode: 'single',
});

const modelValue = ref<string | string[]>('option-1');

watch(
  () => props.value.selectionMode,
  (selectionMode) => {
    modelValue.value = selectionMode === 'multiple' ? ['option-1'] : 'option-1';
  },
  { immediate: true },
);
</script>

# ButtonGroup

Button groups keep a related set of options visually connected while preserving single- or multi-selection behavior.

<DemoContainer :viewport="false">
  <ButtonGroup v-bind="props" v-model="modelValue" name="button-group-docs">
    <ButtonGroupItem value="option-1">Option 1</ButtonGroupItem>
    <ButtonGroupItem value="option-2">Option 2</ButtonGroupItem>
    <ButtonGroupItem value="option-3">Option 3</ButtonGroupItem>
  </ButtonGroup>
</DemoContainer>

<ApiTable component="ButtonGroup" v-model="props" :exclude="['name', 'ariaLabel']" />

## Examples

### Default

<DemoContainer :src="ButtonGroupDefaultSrc" :viewport="false">
  <ButtonGroupDefault />
</DemoContainer>

### Types

<DemoContainer :src="ButtonGroupTypesSrc" :viewport="false">
  <ButtonGroupTypes />
</DemoContainer>

### Sizes

<DemoContainer :src="ButtonGroupSizesSrc" :viewport="false">
  <ButtonGroupSizes />
</DemoContainer>

### Colors

<DemoContainer :src="ButtonGroupColorsSrc" :viewport="false">
  <ButtonGroupColors />
</DemoContainer>

### Disabled

<DemoContainer :src="ButtonGroupDisabledSrc" :viewport="false">
  <ButtonGroupDisabled />
</DemoContainer>

### Multiple Selection

<DemoContainer :src="ButtonGroupMultipleSrc" :viewport="false">
  <ButtonGroupMultiple />
</DemoContainer>

## API

### ButtonGroupItem

<ApiTable component="ButtonGroupItem" />
