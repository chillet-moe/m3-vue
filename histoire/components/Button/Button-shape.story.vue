<script setup>
import { ref } from 'vue';
import Button from '@/components/Button/Button.vue';

const text = ref('Button');

const shapes = ['Rounded', 'Square'];
</script>

<template>
  <Story :layout="{ type: 'grid', width: '25%' }" title="Button/Shape">
    <template #controls>
      <HstText title="default slot" v-model="text" />
    </template>

    <Variant
      v-for="shape in shapes"
      :key="shape"
      :title="shape"
    >
      <Button :shape="shape">
        {{ text }}
      </Button>
    </Variant>
  </Story>
</template>
