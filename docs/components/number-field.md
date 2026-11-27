---
title: NumberField
---

<script setup lang="ts">
import { ref } from 'vue';
import { NumberField } from '@/components/NumberField';
import NumberFieldDefault from '../demos/number-field/NumberFieldDefault.vue';
import NumberFieldDefaultSrc from '../demos/number-field/NumberFieldDefault.vue?raw';

const value = ref<number | null>(42.125);
const props = ref({ label: 'Amount', step: 1 });
</script>

# NumberField

Bind `v-model:value` to a `number | null`. Type a number directly, click the stacked arrows, or press ↑ or ↓ in the input. Clearing the field sets the value to `null`.

<DemoContainer>
  <NumberField v-bind="props" v-model:value="value" />
</DemoContainer>

## Decimal steps and limits

`step` defaults to 1. Each arrow adds or subtracts the step from the current value. For example, incrementing `42.125` with a step of `1` gives `43.125`. Stepping from an empty field starts from zero and applies the same limits.

<DemoContainer :src="NumberFieldDefaultSrc">
  <NumberFieldDefault />
</DemoContainer>

`min` and `max` bound the model. The input keeps the text you are editing, including a sign or trailing decimal point. On blur it displays the current model value, so an unfinished entry reverts and a number outside the range displays the nearest limit.

Use `label`, `supporting-text`, and `error` as with [TextField](./text-field).

## Reference

<AnatomyTable scope="number-field" />

<ApiTable component="NumberField" v-model="props" :exclude="['value']" />
