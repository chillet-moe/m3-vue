---
title: ProgressIndicator
---

<script setup lang="ts">
import { ref } from 'vue';
import { ProgressIndicator } from '@/components/ProgressIndicator';

import ProgressIndicatorDefault from '../demos/progress-indicator/ProgressIndicatorDefault.vue';
import ProgressIndicatorDefaultSrc from '../demos/progress-indicator/ProgressIndicatorDefault.vue?raw';
import ProgressIndicatorVariants from '../demos/progress-indicator/ProgressIndicatorVariants.vue';
import ProgressIndicatorVariantsSrc from '../demos/progress-indicator/ProgressIndicatorVariants.vue?raw';
import ProgressIndicatorShapes from '../demos/progress-indicator/ProgressIndicatorShapes.vue';
import ProgressIndicatorShapesSrc from '../demos/progress-indicator/ProgressIndicatorShapes.vue?raw';
import ProgressIndicatorIndeterminate from '../demos/progress-indicator/ProgressIndicatorIndeterminate.vue';
import ProgressIndicatorIndeterminateSrc from '../demos/progress-indicator/ProgressIndicatorIndeterminate.vue?raw';
import ProgressIndicatorAnimated from '../demos/progress-indicator/ProgressIndicatorAnimated.vue';
import ProgressIndicatorAnimatedSrc from '../demos/progress-indicator/ProgressIndicatorAnimated.vue?raw';

const props = ref({
  variant: 'linear',
  behavior: 'determinate',
  shape: 'flat',
  min: 0,
  max: 100,
  value: 62,
  thickness: '0.5rem',
  size: undefined,
  stopIndicator: true,
  ariaLabel: 'Loading progress',
  ariaValueText: undefined,
});
</script>

# ProgressIndicator

Progress indicators communicate known and unknown progress in linear or circular layouts. Use `shape="wavy"` when the active segment should read as a softer, more expressive motion path.

<DemoContainer :viewport="false">
  <div style="display: grid; gap: 1rem; justify-items: start; inline-size: min(100%, 18rem)">
    <ProgressIndicator v-bind="props" />
  </div>
</DemoContainer>

<AnatomyTable scope="progress-indicator" />

<ApiTable component="ProgressIndicator" v-model="props" />

## Examples

### Default

<DemoContainer :src="ProgressIndicatorDefaultSrc" :viewport="false">
  <ProgressIndicatorDefault />
</DemoContainer>

### Variants

<DemoContainer :src="ProgressIndicatorVariantsSrc" :viewport="false">
  <ProgressIndicatorVariants />
</DemoContainer>

### Shapes

<DemoContainer :src="ProgressIndicatorShapesSrc" :viewport="false">
  <ProgressIndicatorShapes />
</DemoContainer>

### Indeterminate

<DemoContainer :src="ProgressIndicatorIndeterminateSrc" :viewport="false">
  <ProgressIndicatorIndeterminate />
</DemoContainer>

### Animated Value

Value changes are smoothly interpolated using a spring physics animation.

<DemoContainer :src="ProgressIndicatorAnimatedSrc" :viewport="false">
  <ProgressIndicatorAnimated />
</DemoContainer>
