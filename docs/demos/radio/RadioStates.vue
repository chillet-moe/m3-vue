<script setup lang="ts">
import { Radio } from '@/components/Radio';
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 1rem;">
    <Radio :checked="false" name="radio-states-a">Unchecked</Radio>
    <Radio :checked="true" name="radio-states-b">Checked</Radio>
    <Radio :checked="false" disabled name="radio-states-c">Disabled unchecked</Radio>
    <Radio :checked="true" disabled name="radio-states-d">Disabled checked</Radio>
  </div>
</template>
