<script setup>
import Button from '@/components/Button/Button.vue';

const sizes = ['extra-small', 'small', 'medium', 'large', 'extra-large'];
const colors = ['elevated', 'filled', 'tonal', 'outlined', 'text'];
const shapes = ['rounded', 'square'];
</script>

<template>
  <Story :layout="{ type: 'grid' }">
    <Variant title="Colors">
      <Button v-for="color in colors" :key="color" :color="color">
        {{ color }}
      </Button>
    </Variant>

    <Variant title="Sizes">
      <Button color="tonal" v-for="size in sizes" :key="size" :size="size">
        {{ size }}
      </Button>
    </Variant>

    <Variant title="Shapes">
      <Button color="outlined" v-for="shape in shapes" :key="shape" :shape="shape">
        {{ shape }}
      </Button>
    </Variant>

    <Variant title="Toggle">
      <Button color="outlined" toggleable>
        <input type="checkbox" />
        Toggleable
      </Button>
    </Variant>
  </Story>
</template>
