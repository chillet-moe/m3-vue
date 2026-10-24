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
import SliderPreciseValue from '../../demos/slider/SliderPreciseValue.vue';
import SliderPreciseValueSrc from '../../demos/slider/SliderPreciseValue.vue?raw';
</script>

# Slider

Slider 支持水平和垂直范围输入、内嵌图标、数值指示器及方向布局，并提供便于键盘操作的行为。

数值指示器以手动弹出层渲染，使其留在浏览器顶层，不会被父级溢出裁剪。其动画位置由 Slider CSS 变量和变换驱动；请勿在应用代码中覆盖动画使用的 `--percent` 路径。

## 数值量化

Slider 会原样保留外部传入的 `value`，包括步进刻度之间的值。这样，Slider 可以显示通过配套文本或数字输入框输入的更精确数值，而不会在未提示的情况下改动它。

通过 Slider 交互产生的值会按一致规则量化：

- 指针拖动和键盘方向键使用 `step` 网格。
- 启用滚轮输入后，鼠标滚轮使用 `wheelStep` 网格（若未提供则使用 `step`）；按住 Alt 时始终使用 `step` 网格。
- 网格从有效下限 `max(min, lowerLimit)` 开始。即使最后一个区间短于一个步长，也始终可以选择有效上限 `min(max, upperLimit)`。
- Home 和 End 键分别选择准确的有效下限和上限。

滚轮输入默认关闭。只有显式设置 `wheel` 才会启用：

```vue
<Slider v-model:value="value" :min="0" :max="100" :step="1" wheel :wheel-step="5" />
```

`wheelStep` 只控制已启用滚轮输入后的步长，不会自行启用滚轮。Slider 禁用或 `wheel` 为 `false` 时不会拦截滚轮事件，页面可正常滚动。

<DemoContainer :viewport="false">
  <div style="display: grid; gap: 1rem;">
    <Slider v-bind="props" v-model:value="value" :formatter="numericFormatter" :stop-indicators="stopIndicators" />
    <div>当前值：{{ value }}</div>
  </div>
</DemoContainer>

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

## Slider 外观

`appearance="standard"` 是默认值：中性非活动轨道厚 4px，中等尺寸下圆形滑块为 16px，并有独立的 32px 命中区域。Extra-small 和 small 使用 14px 滑块；large 和 extra-large 分别使用 18px 和 20px。`size` 与 `appearance` 相互独立。焦点状态会显示清晰轮廓；悬停和按压会添加轻微光晕，但不会改变几何尺寸。

`appearance="expressive"` 保留原有的粗轨道和竖直手柄。内嵌图标仅支持 expressive 的 medium、large 和 extra-large 尺寸；standard 不显示图标。两种外观都支持停止标记、所有数值指示器位置、格式化、垂直方向、RTL、禁用状态、范围限制和步进量化。Standard 指示器更紧凑，并仍渲染在顶层弹出层中。`:value-indicator="false"` 仅隐藏视觉提示。

Standard 尺寸 Token 为 `--md-slider-track-thickness`、`--md-slider-thumb-size` 和 `--md-slider-target-size`。已有的 `--md-slider-active-track-color`、`--md-slider-inactive-track-color`、`--md-slider-handle-color` 和指示器颜色 Token 对两种外观都有效。命中区域应至少与滑块一样大。程序设置的值保持精确；Slider 交互会按步进网格吸附。配对数字输入框由调用方管理。

### 精确数字输入

<DemoContainer :src="SliderPreciseValueSrc" :viewport="false"><SliderPreciseValue /></DemoContainer>

### 迁移默认外观

如需保留之前的外观，可在实例上设置 `appearance="expressive"`、通过 `sliderContextKey` 提供 `{ appearance: 'expressive' }`，或在 M3 默认值中设置 `sliderAppearance: 'expressive'`。外观与密度的搭配建议请参阅 [样式指南](../guides/styling#选择外观与密度)。

滚轮输入现在默认关闭。如果需要滚轮调整值，请显式添加 `wheel`，例如 `<Slider wheel />`。仅设置 `wheelStep` 不会启用滚轮；未启用滚轮或 Slider 已禁用时，页面滚动行为不变。

## 参考

<AnatomyTable scope="slider" />

<ApiTable component="Slider" v-model="props" />

<StyleTokenTable component="Slider" />
