---
title: LinearProgressIndicator
---

<script setup lang="ts">
import { ref } from 'vue';
import { LinearProgressIndicator } from '@/components/LinearProgressIndicator';

import LinearProgressIndicatorDefault from '../demos/linear-progress-indicator/LinearProgressIndicatorDefault.vue';
import LinearProgressIndicatorDefaultSrc from '../demos/linear-progress-indicator/LinearProgressIndicatorDefault.vue?raw';
import LinearProgressIndicatorIndeterminate from '../demos/linear-progress-indicator/LinearProgressIndicatorIndeterminate.vue';
import LinearProgressIndicatorIndeterminateSrc from '../demos/linear-progress-indicator/LinearProgressIndicatorIndeterminate.vue?raw';
import LinearProgressIndicatorValueAnimation from '../demos/linear-progress-indicator/LinearProgressIndicatorValueAnimation.vue';
import LinearProgressIndicatorValueAnimationSrc from '../demos/linear-progress-indicator/LinearProgressIndicatorValueAnimation.vue?raw';

const props = ref({
  value: 0.42,
  min: 0,
  max: 1,
  direction: 'ltr',
  shape: 'flat',
  thickness: undefined,
  trackGap: undefined,
  stopIndicator: true,
  stopIndicatorSize: undefined,
  waveAmplitude: undefined,
  wavelength: undefined,
  indeterminateWavelength: undefined,
});
</script>

# LinearProgressIndicator

LinearProgressIndicator displays determinate or indeterminate progress on a horizontal track.

<DemoContainer :viewport="false">
  <LinearProgressIndicator v-bind="props" />
</DemoContainer>

<AnatomyTable scope="linear-progress-indicator" />

<ApiTable component="LinearProgressIndicator" v-model="props" :exclude="['ariaLabel', 'ariaValueText']" />

## Examples

### Default

<DemoContainer :src="LinearProgressIndicatorDefaultSrc" :viewport="false">
  <LinearProgressIndicatorDefault />
</DemoContainer>

### Value animation

<DemoContainer :src="LinearProgressIndicatorValueAnimationSrc" :viewport="false">
  <LinearProgressIndicatorValueAnimation />
</DemoContainer>

### Indeterminate

<DemoContainer :src="LinearProgressIndicatorIndeterminateSrc" :viewport="false">
  <LinearProgressIndicatorIndeterminate />
</DemoContainer>
