<script setup>
import { ref } from 'vue';
import Button from '@/components/Button/Button.vue';
import VariantLayout from '../VariantLayout.vue';

const sizes = ['XS', 'S', 'M', 'L', 'XL'];
const variants = ['Elevated', 'Filled', 'Tonal', 'Outlined', 'Text'];
const shapes = ['Rounded', 'Square'];
</script>

<template>
  <Story :layout="{ type: 'single', iframe: true }">
    <Variant title="Variants">
      <VariantLayout>
        <Button
          v-for="variant in variants" :key="variant"
          :variant="variant">
          {{ variant }}
        </Button>
      </VariantLayout>
    </Variant>

    <Variant title="Sizes">
      <VariantLayout>
        <Button
          variant="Tonal"
          v-for="size in sizes" :key="size"
          :size="size">
          {{ size }}
        </Button>
      </VariantLayout>
    </Variant>

    <Variant title="Shapes">
      <VariantLayout>
        <Button
          variant="Outlined"
          v-for="shape in shapes" :key="shape"
          :shape="shape">
          {{ shape }}
        </Button>
      </VariantLayout>
    </Variant>
  </Story>
</template>
