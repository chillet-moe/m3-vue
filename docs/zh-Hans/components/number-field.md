---
title: NumberField
---

<script setup lang="ts">
import { ref } from 'vue';
import { NumberField } from '@/components/NumberField';
import NumberFieldDefault from '../../demos/number-field/NumberFieldDefault.vue';
import NumberFieldDefaultSrc from '../../demos/number-field/NumberFieldDefault.vue?raw';

const value = ref<number | null>(42.125);
const props = ref({ label: 'Amount', step: 1 });
</script>

# NumberField

将 `v-model:value` 绑定到 `number | null`。可以直接输入数字、点击上下排列的箭头，或在输入框中按 ↑ 或 ↓。清空字段会将值设为 `null`。

<DemoContainer>
  <NumberField v-bind="props" v-model:value="value" />
</DemoContainer>

## 小数步长和限制

`step` 默认为 1。每次点击箭头都会从当前值加上或减去该步长。例如，步长为 `1` 时，将 `42.125` 递增会得到 `43.125`。从空字段开始步进时，会从零开始，并应用相同的限制。

<DemoContainer :src="NumberFieldDefaultSrc">
  <NumberFieldDefault />
</DemoContainer>

`min` 和 `max` 会限制模型值。输入框会保留你正在编辑的文本，包括符号或末尾的小数点。失焦时，它会显示当前模型值，因此未完成的输入会恢复原值，超出范围的数字会显示距离最近的限制值。

`label`、`supporting-text` 和 `error` 的用法与 [TextField](./text-field) 相同。

## 参考

<AnatomyTable scope="number-field" />

<ApiTable component="NumberField" v-model="props" :exclude="['value']" />
