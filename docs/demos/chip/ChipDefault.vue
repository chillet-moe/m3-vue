<script setup lang="ts">
import { ref } from 'vue';
import { Chip } from '@/components/Chip';

const selected = ref(false);
</script>

<template>
  <Chip v-model="selected">Chip</Chip>
</template>
