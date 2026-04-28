---
title: CircularProgressIndicator
---

<script setup lang="ts">
import { ref } from 'vue';
import { CircularProgressIndicator } from '@/components/CircularProgressIndicator';

import CircularProgressIndicatorDefault from '../demos/circular-progress-indicator/CircularProgressIndicatorDefault.vue';
import CircularProgressIndicatorDefaultSrc from '../demos/circular-progress-indicator/CircularProgressIndicatorDefault.vue?raw';
import CircularProgressIndicatorIndeterminate from '../demos/circular-progress-indicator/CircularProgressIndicatorIndeterminate.vue';
import CircularProgressIndicatorIndeterminateSrc from '../demos/circular-progress-indicator/CircularProgressIndicatorIndeterminate.vue?raw';
import CircularProgressIndicatorValueAnimation from '../demos/circular-progress-indicator/CircularProgressIndicatorValueAnimation.vue';
import CircularProgressIndicatorValueAnimationSrc from '../demos/circular-progress-indicator/CircularProgressIndicatorValueAnimation.vue?raw';

const props = ref({
  value: 0.42,
  min: 0,
  max: 1,
  direction: 'clockwise',
  shape: 'flat',
  size: undefined,
  thickness: undefined,
  trackGap: undefined,
  waveAmplitude: undefined,
  wavelength: undefined,
});
</script>

# CircularProgressIndicator

CircularProgressIndicator displays determinate or indeterminate progress around a circular track.

<DemoContainer>
  <CircularProgressIndicator v-bind="props" />
</DemoContainer>

<AnatomyTable scope="circular-progress-indicator" />

<ApiTable component="CircularProgressIndicator" v-model="props" :exclude="['ariaLabel', 'ariaValueText']" />

## Examples

### Default

<DemoContainer :src="CircularProgressIndicatorDefaultSrc">
  <CircularProgressIndicatorDefault />
</DemoContainer>

### Value animation

<DemoContainer :src="CircularProgressIndicatorValueAnimationSrc">
  <CircularProgressIndicatorValueAnimation />
</DemoContainer>

### Indeterminate

<DemoContainer :src="CircularProgressIndicatorIndeterminateSrc">
  <CircularProgressIndicatorIndeterminate />
</DemoContainer>
