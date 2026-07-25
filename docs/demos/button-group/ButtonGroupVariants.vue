<script setup lang="ts">
import { ButtonGroup, ButtonGroupItem } from '@/components/ButtonGroup';

const variants = ['text', 'outlined', 'tonal', 'filled'] as const;
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 1rem">
    <div v-for="variant in variants" :key="variant" style="display: grid; gap: 0.25rem">
      <div style="font-size: 0.75rem; opacity: 0.72">{{ variant }}</div>
      <ButtonGroup :model-value="'option-1'" :variant="variant" name="button-group-variants">
        <ButtonGroupItem value="option-1">Option 1</ButtonGroupItem>
        <ButtonGroupItem value="option-2">Option 2</ButtonGroupItem>
        <ButtonGroupItem value="option-3">Option 3</ButtonGroupItem>
      </ButtonGroup>
    </div>
  </div>
</template>
