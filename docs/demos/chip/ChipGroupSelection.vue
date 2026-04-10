<script setup lang="ts">
import { ref } from 'vue';
import { Chip } from '@/components/Chip';
import { ChipGroup } from '@/components/ChipGroup';

const singleValue = ref('updates');
const multipleValue = ref(['updates']);
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 1rem;">
    <ChipGroup v-model="singleValue" name="chip-group-single">
      <Chip value="updates">Updates</Chip>
      <Chip value="alerts">Alerts</Chip>
      <Chip value="saved">Saved</Chip>
    </ChipGroup>

    <ChipGroup v-model="multipleValue" name="chip-group-multiple" selection-mode="multiple">
      <Chip value="updates">Updates</Chip>
      <Chip value="alerts">Alerts</Chip>
      <Chip value="saved">Saved</Chip>
    </ChipGroup>
  </div>
</template>
