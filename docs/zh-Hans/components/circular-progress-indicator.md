---
title: 圆形进度指示器
---

<script setup lang="ts">
import { ref } from 'vue';
import { CircularProgressIndicator } from '@/components/CircularProgressIndicator';

import CircularProgressIndicatorDefault from '../../demos/circular-progress-indicator/CircularProgressIndicatorDefault.vue';
import CircularProgressIndicatorDefaultSrc from '../../demos/circular-progress-indicator/CircularProgressIndicatorDefault.vue?raw';
import CircularProgressIndicatorIndeterminate from '../../demos/circular-progress-indicator/CircularProgressIndicatorIndeterminate.vue';
import CircularProgressIndicatorIndeterminateSrc from '../../demos/circular-progress-indicator/CircularProgressIndicatorIndeterminate.vue?raw';
import CircularProgressIndicatorValueAnimation from '../../demos/circular-progress-indicator/CircularProgressIndicatorValueAnimation.vue';
import CircularProgressIndicatorValueAnimationSrc from '../../demos/circular-progress-indicator/CircularProgressIndicatorValueAnimation.vue?raw';

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

# 圆形进度指示器

CircularProgressIndicator 沿圆形轨道显示确定或不确定进度。

<DemoContainer>
  <CircularProgressIndicator v-bind="props" />
</DemoContainer>

<AnatomyTable scope="circular-progress-indicator" />

<ApiTable component="CircularProgressIndicator" v-model="props" :exclude="['ariaLabel', 'ariaValueText']" />

<StyleTokenTable component="CircularProgressIndicator" />

## 示例

### 默认

<DemoContainer :src="CircularProgressIndicatorDefaultSrc">
  <CircularProgressIndicatorDefault />
</DemoContainer>

### 数值动画

<DemoContainer :src="CircularProgressIndicatorValueAnimationSrc">
  <CircularProgressIndicatorValueAnimation />
</DemoContainer>

### 不确定进度

<DemoContainer :src="CircularProgressIndicatorIndeterminateSrc">
  <CircularProgressIndicatorIndeterminate />
</DemoContainer>
