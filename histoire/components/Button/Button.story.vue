<script setup>
import { ref } from 'vue';
import Button from '@/components/Button/Button.vue';

const text = ref('Button');

const sizes = ['XS', 'S', 'M', 'L', 'XL'];
const variants = ['Elevated', 'Filled', 'Tonal', 'Outlined', 'Text'];
const shapes = ['Rounded', 'Square'];
</script>

<template>
  <Story :layout="{ type: 'grid', width: '300px' }">
    <template #controls>
      <HstText title="default slot" v-model="text" />
    </template>

    <Variant
      v-for="variant in variants"
      :key="variant"
      :title="`Variant - ${variant}`"
    >
      <Button :variant="variant">
        {{ text }}
      </Button>
    </Variant>

    <Variant
      v-for="shape in shapes"
      :key="shape"
      :title="`Shape - ${shape}`"
    >
      <Button variant="Outlined" :shape="shape">
        {{ text }}
      </Button>
    </Variant>

    <Variant
      v-for="size in sizes"
      :key="size"
      :title="`Size - ${size}`"
    >
      <Button
        variant="Tonal"
        :size="size">
        {{ text }}
      </Button>
    </Variant>
  </Story>
</template>
