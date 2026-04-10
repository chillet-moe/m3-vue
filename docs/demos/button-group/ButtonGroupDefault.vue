<script setup lang="ts">
import { ref } from 'vue';
import { ButtonGroup, ButtonGroupItem } from '@/components/ButtonGroup';

const modelValue = ref('option-1');
</script>

<template>
  <ButtonGroup v-model="modelValue" name="button-group-default">
    <ButtonGroupItem value="option-1">Option 1</ButtonGroupItem>
    <ButtonGroupItem value="option-2">Option 2</ButtonGroupItem>
    <ButtonGroupItem value="option-3">Option 3</ButtonGroupItem>
  </ButtonGroup>
</template>
