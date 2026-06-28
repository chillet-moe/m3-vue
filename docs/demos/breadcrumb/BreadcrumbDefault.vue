<script setup lang="ts">
import { Breadcrumb } from '@/components/Breadcrumb';

const items = [{ label: 'Docs', href: '#' }, { label: 'Components', href: '#' }, { label: 'Breadcrumb' }];
</script>

<template>
  <Breadcrumb :items="items" />
</template>
