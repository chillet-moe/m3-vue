<script setup>
import Button from '@/components/Button/Button.vue';

const sizes = ['XS', 'S', 'M', 'L', 'XL'];
const variants = ['Elevated', 'Filled', 'Tonal', 'Outlined', 'Text'];
const shapes = ['Rounded', 'Square'];
</script>

<template>
  <Story :layout="{ type: 'grid' }">
    <Variant title="Variants">
        <Button
          v-for="variant in variants" :key="variant"
          :variant="variant">
          {{ variant }}
        </Button>
    </Variant>

    <Variant title="Sizes">
        <Button
          variant="Tonal"
          v-for="size in sizes" :key="size"
          :size="size">
          {{ size }}
        </Button>
    </Variant>

    <Variant title="Shapes">
        <Button
          variant="Outlined"
          v-for="shape in shapes" :key="shape"
          :shape="shape">
          {{ shape }}
        </Button>
    </Variant>
  </Story>
</template>
