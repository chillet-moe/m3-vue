<script setup>
import { ref } from 'vue';
import Button from '@/components/Button/Button.vue';

const text = ref('Button');

const variants = ['Elevated', 'Filled', 'Tonal', 'Outlined', 'Text'];
</script>

<template>
  <Story :layout="{ type: 'grid', width: '30%' }" title="Button/Variants">
    <template #controls>
      <HstText title="default slot" v-model="text" />
    </template>

    <Variant
      v-for="variant in variants"
      :key="variant"
      :title="variant"
    >
      <Button :variant="variant">
        {{ text }}
      </Button>
    </Variant>
  </Story>
</template>
