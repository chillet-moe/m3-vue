<script setup lang="ts">
import { CheckBox } from '@/components/CheckBox';
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 1rem;">
    <CheckBox :checked="false">Unchecked</CheckBox>
    <CheckBox :checked="true">Checked</CheckBox>
    <CheckBox :checked="false" disabled>Disabled unchecked</CheckBox>
    <CheckBox :checked="true" disabled>Disabled checked</CheckBox>
  </div>
</template>
