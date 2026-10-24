---
title: LoadingIndicator
---

<script setup lang="ts">
import { ref } from 'vue';
import { LoadingIndicator } from '@/components/LoadingIndicator';

import LoadingIndicatorDefault from '../demos/loading-indicator/LoadingIndicatorDefault.vue';
import LoadingIndicatorDefaultSrc from '../demos/loading-indicator/LoadingIndicatorDefault.vue?raw';
import LoadingIndicatorContained from '../demos/loading-indicator/LoadingIndicatorContained.vue';
import LoadingIndicatorContainedSrc from '../demos/loading-indicator/LoadingIndicatorContained.vue?raw';
import LoadingIndicatorSizes from '../demos/loading-indicator/LoadingIndicatorSizes.vue';
import LoadingIndicatorSizesSrc from '../demos/loading-indicator/LoadingIndicatorSizes.vue?raw';

const props = ref({
  variant: 'uncontained',
  visible: true,
  indicatorSize: undefined,
  containerSize: undefined,
  containerWidth: undefined,
  containerHeight: undefined,
  showDelay: 0,
  minHideDelay: 0,
});
</script>

# LoadingIndicator

LoadingIndicator shows progress for a short indeterminate wait using a morphing active indicator.

The active indicator morphs between Material shape paths. See [Material Shape Paths](/utilities/material-shape-paths) for source and license details.

<DemoContainer>
  <LoadingIndicator v-bind="props" aria-label="Loading" />
</DemoContainer>

## Examples

### Default

<DemoContainer :src="LoadingIndicatorDefaultSrc">
  <LoadingIndicatorDefault />
</DemoContainer>

### Contained

<DemoContainer :src="LoadingIndicatorContainedSrc">
  <LoadingIndicatorContained />
</DemoContainer>

### Sizes

<DemoContainer :src="LoadingIndicatorSizesSrc">
  <LoadingIndicatorSizes />
</DemoContainer>

## Reference

<AnatomyTable scope="loading-indicator" />

<ApiTable component="LoadingIndicator" v-model="props" :exclude="['ariaLabel']" />

<StyleTokenTable component="LoadingIndicator" />
