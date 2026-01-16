<script setup>
import Button from '@/components/Button/Button.vue';

const sizes = ['extra-small', 'small', 'medium', 'large', 'extra-large'];
const variants = ['elevated', 'filled', 'tonal', 'outlined', 'text'];
const shapes = ['rounded', 'square'];
</script>

<template>
  <Story :layout="{ type: 'grid' }">
    <Variant title="Variants">
      <Button v-for="variant in variants" :key="variant" :variant="variant">
        {{ variant }}
      </Button>
    </Variant>

    <Variant title="Sizes">
      <Button variant="tonal" v-for="size in sizes" :key="size" :size="size">
        {{ size }}
      </Button>
    </Variant>

    <Variant title="Shapes">
      <Button variant="outlined" v-for="shape in shapes" :key="shape" :shape="shape">
        {{ shape }}
      </Button>
    </Variant>

    <Variant title="Toggle">
      <Button variant="outlined" toggleable="multiple">
        Toggleable
      </Button>
    </Variant>
  </Story>
</template>
