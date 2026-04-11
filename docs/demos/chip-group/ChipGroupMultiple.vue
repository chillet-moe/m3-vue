<script setup lang="ts">
import { ref } from 'vue';
import { Chip } from '@/components/Chip';
import { ChipGroup } from '@/components/ChipGroup';

const selected = ref(['alerts']);
</script>

<template>
  <ChipGroup
    v-model="selected"
    selection-mode="multiple"
    name="chip-group-docs-multiple"
    aria-label="Notification filters"
  >
    <Chip value="alerts">Alerts</Chip>
    <Chip value="mentions">Mentions</Chip>
    <Chip value="saved">Saved</Chip>
  </ChipGroup>
</template>
