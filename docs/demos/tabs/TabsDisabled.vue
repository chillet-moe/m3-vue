<script setup>
import { Tabs, TabList, Tab, TabPanel } from '@/components/Tabs';
import { ref } from 'vue';

const value = ref('overview');
</script>

<template>
  <Tabs v-model="value">
    <TabList aria-label="Workspace sections">
      <Tab value="overview">Overview</Tab>
      <Tab value="analytics">Analytics</Tab>
      <Tab value="reports" disabled>Reports</Tab>
      <Tab value="settings">Settings</Tab>
    </TabList>
    <TabPanel value="overview">Overview content</TabPanel>
    <TabPanel value="analytics">Analytics content</TabPanel>
    <TabPanel value="reports">Reports content</TabPanel>
    <TabPanel value="settings">Settings content</TabPanel>
  </Tabs>
</template>
