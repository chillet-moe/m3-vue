<script setup lang="ts">
import { Breadcrumb } from '@/components/Breadcrumb';

const items = [
  { label: 'Workspace', href: '#' },
  { label: 'More', ellipsis: true },
  { label: 'Components', href: '#' },
  { label: 'Breadcrumb' },
];
</script>

<template>
  <Breadcrumb :items="items" />
</template>
