<script setup lang="ts">
import { ButtonGroup, ButtonGroupItem } from '@/components/ButtonGroup';
</script>

<template>
  <ButtonGroup :model-value="'option-1'" disabled name="button-group-disabled">
    <ButtonGroupItem value="option-1">Option 1</ButtonGroupItem>
    <ButtonGroupItem value="option-2">Option 2</ButtonGroupItem>
    <ButtonGroupItem value="option-3">Option 3</ButtonGroupItem>
  </ButtonGroup>
</template>
