<script setup lang="ts">
import { ref } from 'vue';
import { ColorField } from '@/components/ColorField';

const initial = { r: 0.18, g: 0.46, b: 0.83, a: 1 };
const value = ref({ ...initial });
</script>

<template>
  <ColorField v-model:value="value" label="Color" :default-value="initial" />
</template>
