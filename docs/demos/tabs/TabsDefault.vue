<script setup>
import { Tabs, TabList, Tab, TabPanel } from '@/components/Tabs';
import { ref } from 'vue';

const value = ref('tab1');
</script>

<template>
  <Tabs v-model="value">
    <TabList>
      <Tab value="tab1">Tab 1</Tab>
      <Tab value="tab2">Tab 2</Tab>
      <Tab value="tab3">Tab 3</Tab>
    </TabList>
    <TabPanel value="tab1">Content for tab 1</TabPanel>
    <TabPanel value="tab2">Content for tab 2</TabPanel>
    <TabPanel value="tab3">Content for tab 3</TabPanel>
  </Tabs>
</template>
