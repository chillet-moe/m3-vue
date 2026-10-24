---
title: 按钮组
---

<script setup lang="ts">
import { ref, watch } from 'vue';
import { ButtonGroup, ButtonGroupItem } from '@/components/ButtonGroup';

import ButtonGroupDefault from '../../demos/button-group/ButtonGroupDefault.vue';
import ButtonGroupDefaultSrc from '../../demos/button-group/ButtonGroupDefault.vue?raw';
import ButtonGroupTypes from '../../demos/button-group/ButtonGroupTypes.vue';
import ButtonGroupTypesSrc from '../../demos/button-group/ButtonGroupTypes.vue?raw';
import ButtonGroupSizes from '../../demos/button-group/ButtonGroupSizes.vue';
import ButtonGroupSizesSrc from '../../demos/button-group/ButtonGroupSizes.vue?raw';
import ButtonGroupVariants from '../../demos/button-group/ButtonGroupVariants.vue';
import ButtonGroupVariantsSrc from '../../demos/button-group/ButtonGroupVariants.vue?raw';
import ButtonGroupDisabled from '../../demos/button-group/ButtonGroupDisabled.vue';
import ButtonGroupDisabledSrc from '../../demos/button-group/ButtonGroupDisabled.vue?raw';
import ButtonGroupMultiple from '../../demos/button-group/ButtonGroupMultiple.vue';
import ButtonGroupMultipleSrc from '../../demos/button-group/ButtonGroupMultiple.vue?raw';

const props = ref({
  type: 'standard',
  size: 'small',
  variant: 'tonal',
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

# 按钮组

按钮组将相关选项以视觉方式组合在一起，同时支持单选或多选。

<DemoContainer :viewport="false">
  <ButtonGroup v-bind="props" v-model="modelValue" name="button-group-docs">
    <ButtonGroupItem value="option-1">选项 1</ButtonGroupItem>
    <ButtonGroupItem value="option-2">选项 2</ButtonGroupItem>
    <ButtonGroupItem value="option-3">选项 3</ButtonGroupItem>
  </ButtonGroup>
</DemoContainer>

## 示例

### 默认

<DemoContainer :src="ButtonGroupDefaultSrc" :viewport="false">
  <ButtonGroupDefault />
</DemoContainer>

### 类型

<DemoContainer :src="ButtonGroupTypesSrc" :viewport="false">
  <ButtonGroupTypes />
</DemoContainer>

### 尺寸

<DemoContainer :src="ButtonGroupSizesSrc" :viewport="false">
  <ButtonGroupSizes />
</DemoContainer>

### 变体

<DemoContainer :src="ButtonGroupVariantsSrc" :viewport="false">
  <ButtonGroupVariants />
</DemoContainer>

### 禁用

<DemoContainer :src="ButtonGroupDisabledSrc" :viewport="false">
  <ButtonGroupDisabled />
</DemoContainer>

### 多项展开 Selection

<DemoContainer :src="ButtonGroupMultipleSrc" :viewport="false">
  <ButtonGroupMultiple />
</DemoContainer>

## 参考

<AnatomyTable scope="button-group" />

<ApiTable component="ButtonGroup" v-model="props" :exclude="['name', 'ariaLabel']" />

<StyleTokenTable component="ButtonGroup" />

### ButtonGroupItem

<ApiTable component="ButtonGroupItem" />
