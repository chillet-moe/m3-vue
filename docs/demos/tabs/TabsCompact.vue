<script setup>
import { Tabs, TabList, Tab, TabPanel } from '@/components/Tabs';
import { ref } from 'vue';

const value = ref('overview');
</script>

<template>
  <Tabs v-model="value" density="compact">
    <TabList>
      <Tab value="overview">Overview</Tab>
      <Tab value="analytics">Analytics</Tab>
      <Tab value="reports">Reports</Tab>
      <Tab value="settings">Settings</Tab>
    </TabList>
    <TabPanel value="overview">Compact overview content</TabPanel>
    <TabPanel value="analytics">Compact analytics content</TabPanel>
    <TabPanel value="reports">Compact reports content</TabPanel>
    <TabPanel value="settings">Compact settings content</TabPanel>
  </Tabs>
</template>
