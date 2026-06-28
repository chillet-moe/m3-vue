<script setup lang="ts">
import { Icon } from '@/components/Icon';
import { Breadcrumb } from '@/components/Breadcrumb';

const items = [{ label: 'Account', href: '#' }, { label: 'Settings', href: '#' }, { label: 'Security' }];
</script>

<template>
  <Breadcrumb :items="items">
    <template #separator>
      <Icon name="arrow_forward_ios" size="0.875rem" variant="inline" />
    </template>
  </Breadcrumb>
</template>
