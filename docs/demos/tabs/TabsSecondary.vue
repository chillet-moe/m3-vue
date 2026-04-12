<script setup>
import { Tabs, TabList, Tab, TabPanel } from '@/components/Tabs';
import { ref } from 'vue';

const value = ref('tab1');
</script>

<template>
  <Tabs v-model="value" variant="secondary">
    <TabList>
      <Tab value="tab1">Tab 1</Tab>
      <Tab value="tab2">Tab 2</Tab>
      <Tab value="tab3">Tab 3</Tab>
    </TabList>
    <TabPanel value="tab1">Secondary variant — Tab 1</TabPanel>
    <TabPanel value="tab2">Secondary variant — Tab 2</TabPanel>
    <TabPanel value="tab3">Secondary variant — Tab 3</TabPanel>
  </Tabs>
</template>
