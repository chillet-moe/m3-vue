---
title: Tabs
---

<script setup lang="ts">
import { ref } from 'vue';
import { Tabs, TabList, Tab, TabPanel } from '@/components/Tabs';

import TabsDefault from '../demos/tabs/TabsDefault.vue';
import TabsDefaultSrc from '../demos/tabs/TabsDefault.vue?raw';
import TabsSecondary from '../demos/tabs/TabsSecondary.vue';
import TabsSecondarySrc from '../demos/tabs/TabsSecondary.vue?raw';
import TabsWithIcons from '../demos/tabs/TabsWithIcons.vue';
import TabsWithIconsSrc from '../demos/tabs/TabsWithIcons.vue?raw';
import TabsLinks from '../demos/tabs/TabsLinks.vue';
import TabsLinksSrc from '../demos/tabs/TabsLinks.vue?raw';
import TabsHeadless from '../demos/tabs/TabsHeadless.vue';
import TabsHeadlessSrc from '../demos/tabs/TabsHeadless.vue?raw';

const props = ref({
  variant: 'primary',
});

const value = ref('tab1');
</script>

# Tabs

Tabs organize content into separate views where only one view is visible at a time. Each tab acts as a trigger for its associated panel.

Tabs is built on the `useTabs` composable — the interaction logic (keyboard navigation, ARIA attributes, value management) lives in the composable, while the component adds MD3 styling. See [Composables](/guides/composables) for details.

<DemoContainer>
  <Tabs v-model="value" v-bind="props">
    <TabList>
      <Tab value="tab1">Tab 1</Tab>
      <Tab value="tab2">Tab 2</Tab>
      <Tab value="tab3">Tab 3</Tab>
    </TabList>
    <TabPanel value="tab1">Content for Tab 1</TabPanel>
    <TabPanel value="tab2">Content for Tab 2</TabPanel>
    <TabPanel value="tab3">Content for Tab 3</TabPanel>
  </Tabs>
</DemoContainer>

<AnatomyTable scope="tabs" />

<ApiTable component="Tabs" v-model="props" />

## Examples

### Default

<DemoContainer :src="TabsDefaultSrc">
  <TabsDefault />
</DemoContainer>

### Secondary Variant

<DemoContainer :src="TabsSecondarySrc">
  <TabsSecondary />
</DemoContainer>

### With Icons

<DemoContainer :src="TabsWithIconsSrc">
  <TabsWithIcons />
</DemoContainer>

### Router-Style Links

Use the same `RouterLink custom` pattern as `Button` and `ListItem`, then pass the generated `href` and `navigate` handler into `Tab`.

<DemoContainer :src="TabsLinksSrc">
  <TabsLinks />
</DemoContainer>

### Headless (useTabs only)

Use the `useTabs` composable directly to build custom tab UIs without any predefined styling.

<DemoContainer :src="TabsHeadlessSrc">
  <TabsHeadless />
</DemoContainer>

## Composable

### useTabs

<SourceApiTable api="useTabs" />

## API

### Tabs

<ApiTable component="Tabs" />

### Tab

<ApiTable component="Tab" />

### TabList

<ApiTable component="TabList" />

### TabPanel

<ApiTable component="TabPanel" />
