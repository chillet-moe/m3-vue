<script setup>
import { useTabs } from '@/composables/useTabs';

const tabs = useTabs({ value: 'tab1' });
const tabIds = ['tab1', 'tab2', 'tab3'];
</script>

<template>
  <div>
    <div v-bind="tabs.triggerListAttrs.value">
      <button v-for="id in tabIds" :key="id" v-bind="tabs.getTriggerAttrs(id)">{{ id }}</button>
    </div>
    <div v-for="id in tabIds" :key="id" v-bind="tabs.getPanelAttrs(id)">Content for {{ id }}</div>
  </div>
</template>
