<script setup>
import Slider from '@/components/Slider/Slider.vue';
import { ref } from 'vue';

const sizes = ['XS', 'S', 'M', 'L', 'XL'];

const value = ref(2);
const min = ref(0);
const max = ref(5);
const step = ref(1);
</script>

<template>
  <Story :layout="{ type: 'grid' }">
    <template #controls>
      <HstNumber title="Min" label="Min" v-model.number="min" />
      <HstNumber title="Max" label="Max" v-model.number="max" />
      <HstNumber title="Step" label="Step" v-model.number="step" />
      <HstNumber title="Value" label="Value" v-model.number="value" />
    </template>

    <Variant title="Default">
      <Slider
        v-model:value="value"
        :min="min"
        :max="max"
        :step="step"
        :value-indicator="true"
        :stop-indicators="Array.from({ length: (max - min) / step + 1 }, (_, i) => min + i * step)"
        :formatter="{
          textToValue: value,
          valueToText: (value) => `${value}`,
        }"
      />
    </Variant>

    <Variant title="Direction">
      LTR
      <Slider direction="ltr" v-model:value="value" :min="min" :max="max" :step="step" />
      RTL
      <Slider direction="rtl" v-model:value="value" :min="min" :max="max" :step="step" />
    </Variant>

    <Variant title="Vertical">
      LTR
      <Slider direction="ltr" vertical v-model:value="value" :min="min" :max="max" :step="step" />
      RTL
      <Slider direction="rtl" vertical v-model:value="value" :min="min" :max="max" :step="step" />
    </Variant>

    <Variant title="Sizes">
      <template v-for="size in sizes" :key="size">
        {{ size }}
        <Slider :size="size" v-model:value="value" :min="min" :max="max" :step="step" />
      </template>
    </Variant>
  </Story>
</template>
