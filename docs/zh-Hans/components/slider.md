---
title: Slider
---

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Slider } from '@/components/Slider';
import { createStops, numericFormatter } from '../../demos/shared/slider';

import SliderDefault from '../../demos/slider/SliderDefault.vue';
import SliderDefaultSrc from '../../demos/slider/SliderDefault.vue?raw';
import SliderDirections from '../../demos/slider/SliderDirections.vue';
import SliderDirectionsSrc from '../../demos/slider/SliderDirections.vue?raw';
import SliderVertical from '../../demos/slider/SliderVertical.vue';
import SliderVerticalSrc from '../../demos/slider/SliderVertical.vue?raw';
import SliderSizes from '../../demos/slider/SliderSizes.vue';
import SliderSizesSrc from '../../demos/slider/SliderSizes.vue?raw';
import SliderValueIndicators from '../../demos/slider/SliderValueIndicators.vue';
import SliderValueIndicatorsSrc from '../../demos/slider/SliderValueIndicators.vue?raw';
import SliderInsetIcons from '../../demos/slider/SliderInsetIcons.vue';
import SliderInsetIconsSrc from '../../demos/slider/SliderInsetIcons.vue?raw';
import SliderDisabled from '../../demos/slider/SliderDisabled.vue';
import SliderDisabledSrc from '../../demos/slider/SliderDisabled.vue?raw';

const props = ref({
  min: 0,
  max: 5,
  step: 1,
  size: 'medium',
  direction: 'ltr',
  vertical: false,
  startIcon: undefined,
  endIcon: undefined,
  disabled: false,
  valueIndicator: true,
  valueIndicatorPlacement: undefined,
  stopIndicators: undefined as number[] | undefined,
});

const value = ref(2);

const stopIndicators = computed(() => {
  return props.value.stopIndicators ?? createStops(props.value.min, props.value.max, props.value.step);
});

watch(
  () => [props.value.min, props.value.max],
  ([min, max]) => {
    if (value.value < min) {
      value.value = min;
    } else if (value.value > max) {
      value.value = max;
    }
  },
  { immediate: true },
);
</script>

# Slider

Slider 支持水平和垂直范围输入、内嵌图标、数值指示器及方向布局，并提供便于键盘操作的行为。

数值指示器以手动弹出层渲染，使其留在浏览器顶层，不会被父级溢出裁剪。其动画位置由 Slider CSS 变量和变换驱动；请勿在应用代码中覆盖动画使用的 `--percent` 路径。

## 数值量化

Slider 会原样保留外部传入的 `value`，包括步进刻度之间的值。这样，Slider 可以显示通过配套文本或数字输入框输入的更精确数值，而不会在未提示的情况下改动它。

通过 Slider 交互产生的值会按一致规则量化：

- 指针拖动和键盘方向键使用 `step` 网格。
- 提供 `wheelStep` 时，鼠标滚轮使用该网格；否则使用 `step` 网格。按住 Alt 时使用 `step` 网格。
- 网格从有效下限 `max(min, lowerLimit)` 开始。即使最后一个区间短于一个步长，也始终可以选择有效上限 `min(max, upperLimit)`。
- Home 和 End 键分别选择准确的有效下限和上限。

<DemoContainer :viewport="false">
  <div style="display: grid; gap: 1rem;">
    <Slider v-bind="props" v-model:value="value" :formatter="numericFormatter" :stop-indicators="stopIndicators" />
    <div>当前值：{{ value }}</div>
  </div>
</DemoContainer>

<AnatomyTable scope="slider" />

<ApiTable component="Slider" v-model="props" />

<StyleTokenTable component="Slider" />

## 示例

### 默认

<DemoContainer :src="SliderDefaultSrc" :viewport="false">
  <SliderDefault />
</DemoContainer>

### 方向

<DemoContainer :src="SliderDirectionsSrc" :viewport="false">
  <SliderDirections />
</DemoContainer>

### 垂直

<DemoContainer :src="SliderVerticalSrc" :viewport="false">
  <SliderVertical />
</DemoContainer>

### 尺寸

`size` 属性优先于 `sliderContextKey` 中的 `size`，内置回退值为 `medium`。可在 `M3VuePlugin` 中设置 `sliderSize` 作为应用默认值，或通过上下文配置子树。详见[组件默认值](/zh-Hans/getting-started#组件默认值)。

<DemoContainer :src="SliderSizesSrc" :viewport="false">
  <SliderSizes />
</DemoContainer>

### 数值指示器位置

<DemoContainer :src="SliderValueIndicatorsSrc" :viewport="false">
  <SliderValueIndicators />
</DemoContainer>

### 内嵌图标

<DemoContainer :src="SliderInsetIconsSrc" :viewport="false">
  <SliderInsetIcons />
</DemoContainer>

### 禁用

<DemoContainer :src="SliderDisabledSrc" :viewport="false">
  <SliderDisabled />
</DemoContainer>
