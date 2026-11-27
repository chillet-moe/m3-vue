---
title: SliderField
---

<script setup lang="ts">
import { ref } from 'vue';
import { SliderField } from '@/components/SliderField';
import SliderFieldDefault from '../../demos/slider-field/SliderFieldDefault.vue';
import SliderFieldDefaultSrc from '../../demos/slider-field/SliderFieldDefault.vue?raw';

const value = ref(42.125);
const props = ref({ min: 0, max: 100, step: 1 });
</script>

# SliderField

在紧凑的参数面板中，左右拖动字段即可调节数值。背景填充表示当前值在 `min` 到 `max` 范围内的位置。按下时保留当前值。拖动相当于字段宽度四分之一的距离，数值会按范围的四分之一变化，并吸附到最近的步进值或端点；拖动时会实时更新 `v-model:value`。

<DemoContainer>
  <SliderField v-bind="props" v-model:value="value" aria-label="数值" />
</DemoContainer>

## 尺寸

使用 `size="extra-small"`、`size="small"` 或 `size="medium"`，可与相同尺寸的单行 TextField 对齐。在 `M3VuePlugin` 中设置 `fieldSize` 作为应用默认值，或通过 `fieldContextKey` 为子树提供 `size`。字段上显式设置的 `size` 优先级最高。默认回退尺寸为 `extra-small`；compact 预设提供 `small`，并搭配紧凑排版和间距。

## 步进调整与精确输入

点击字段或聚焦后按 Enter，可选中数值进行编辑。按 Enter 或离开字段即可提交；按 Escape 会放弃编辑。未完成的输入（例如 `-`）不会改变模型。超出范围的数值会限制到最近的端点。

<DemoContainer :src="SliderFieldDefaultSrc">
  <SliderFieldDefault />
</DemoContainer>

当 `step` 为 `1` 且 `min` 为 `0` 时，可以输入 `42.125`。下一步增加为 `43`，减少为 `42`。在调整模式下，使用方向键按步进调整，或使用 Home 和 End 跳至任一端点。即使范围不是步长的整数倍，也始终可以到达两个端点。

## 参考

<AnatomyTable scope="slider-field" />

<ApiTable component="SliderField" v-model="props" :exclude="['value']" />
