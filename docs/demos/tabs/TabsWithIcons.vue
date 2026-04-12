<script setup>
import { Icon } from '@/components/Icon';
import { Tabs, TabList, Tab, TabPanel } from '@/components/Tabs';
import { ref } from 'vue';

const value = ref('flights');
</script>

<template>
  <Tabs v-model="value">
    <TabList>
      <Tab value="flights">
        <template #icon><Icon name="flight" /></template>
        Flights
      </Tab>
      <Tab value="trips">
        <template #icon><Icon name="trip" /></template>
        Trips
      </Tab>
      <Tab value="explore">
        <template #icon><Icon name="explore" /></template>
        Explore
      </Tab>
    </TabList>
    <TabPanel value="flights">Flight search results</TabPanel>
    <TabPanel value="trips">Your saved trips</TabPanel>
    <TabPanel value="explore">Explore destinations</TabPanel>
  </Tabs>
</template>
