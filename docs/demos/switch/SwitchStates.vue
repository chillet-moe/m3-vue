<script setup lang="ts">
import { Switch } from '@/components/Switch';
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 1rem;">
    <Switch :checked="false">Unchecked</Switch>
    <Switch :checked="true">Checked</Switch>
    <Switch :checked="false" disabled>Disabled unchecked</Switch>
    <Switch :checked="true" disabled>Disabled checked</Switch>
  </div>
</template>
