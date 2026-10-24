---
title: LoadingIndicator
---

<script setup lang="ts">
import { ref } from 'vue';
import { LoadingIndicator } from '@/components/LoadingIndicator';

import LoadingIndicatorDefault from '../../demos/loading-indicator/LoadingIndicatorDefault.vue';
import LoadingIndicatorDefaultSrc from '../../demos/loading-indicator/LoadingIndicatorDefault.vue?raw';
import LoadingIndicatorContained from '../../demos/loading-indicator/LoadingIndicatorContained.vue';
import LoadingIndicatorContainedSrc from '../../demos/loading-indicator/LoadingIndicatorContained.vue?raw';
import LoadingIndicatorSizes from '../../demos/loading-indicator/LoadingIndicatorSizes.vue';
import LoadingIndicatorSizesSrc from '../../demos/loading-indicator/LoadingIndicatorSizes.vue?raw';

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

LoadingIndicator 使用形状变化的活动指示器显示短暂等待中的不确定进度。

活动指示器会在 Material 形状路径之间变形。有关来源和许可信息，请参阅 [Material Shape Paths](/zh-Hans/utilities/material-shape-paths)。

<DemoContainer>
  <LoadingIndicator v-bind="props" aria-label="正在加载" />
</DemoContainer>

## 示例

### 默认

<DemoContainer :src="LoadingIndicatorDefaultSrc">
  <LoadingIndicatorDefault />
</DemoContainer>

### 容器内

<DemoContainer :src="LoadingIndicatorContainedSrc">
  <LoadingIndicatorContained />
</DemoContainer>

### 尺寸

<DemoContainer :src="LoadingIndicatorSizesSrc">
  <LoadingIndicatorSizes />
</DemoContainer>

## 参考

<AnatomyTable scope="loading-indicator" />

<ApiTable component="LoadingIndicator" v-model="props" :exclude="['ariaLabel']" />

<StyleTokenTable component="LoadingIndicator" />
