<script setup lang="ts">
import { ref } from 'vue';
import { Chip } from '@/components/Chip';
import { ChipGroup } from '@/components/ChipGroup';

const selected = ref('selected');
</script>

<template>
  <ChipGroup v-model="selected" aria-label="Suggested filters">
    <Chip variant="assist" leading-icon="add">Assist</Chip>
    <Chip variant="suggestion" leading-icon="favorite">Suggestion</Chip>
    <Chip variant="filter" value="selected">Selected</Chip>
    <Chip variant="input" trailing-icon="close">Input</Chip>
  </ChipGroup>
</template>
