<script setup lang="ts">
import { Chip } from '@/components/Chip';
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 0.75rem;">
    <Chip variant="assist" leading-icon="add">Assist</Chip>
    <Chip variant="suggestion" leading-icon="favorite">Suggestion</Chip>
    <Chip variant="filter" :model-value="true">Filter</Chip>
    <Chip variant="input" trailing-icon="close" avatar-src="https://i.pravatar.cc/48?img=12" :model-value="true">
      Input
    </Chip>
  </div>
</template>
