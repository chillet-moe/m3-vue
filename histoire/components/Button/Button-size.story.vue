<script setup>
import { ref } from 'vue';
import Button from '@/components/Button/Button.vue';

const text = ref('Button');

const sizes = ['XS', 'S', 'M', 'L', 'XL'];
</script>

<template>
  <Story :layout="{ type: 'grid', width: '50%' }" title="Button/Sizes">
    <template #controls>
      <HstText title="default slot" v-model="text" />
    </template>

    <Variant
      v-for="size in sizes"
      :key="size"
      :title="size"
    >
      <Button :size="size">
        {{ text }}
      </Button>
    </Variant>
  </Story>
</template>
