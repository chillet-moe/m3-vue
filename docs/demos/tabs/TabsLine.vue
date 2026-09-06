<script setup>
import { Tabs, TabList, Tab, TabPanel } from '@/components/Tabs';
import { ref } from 'vue';

const value = ref('tab1');
</script>

<template>
  <Tabs v-model="value" variant="line" divider divider-full-width>
    <TabList>
      <Tab value="tab1">Tab 1</Tab>
      <Tab value="tab2">Tab 2</Tab>
      <Tab value="tab3">Tab 3</Tab>
    </TabList>
    <TabPanel value="tab1">Line variant - Tab 1</TabPanel>
    <TabPanel value="tab2">Line variant - Tab 2</TabPanel>
    <TabPanel value="tab3">Line variant - Tab 3</TabPanel>
  </Tabs>
</template>
