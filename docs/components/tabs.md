---
title: Tabs
---

<script setup lang="ts">
import { ref } from 'vue';
import { Tabs, TabList, Tab, TabPanel } from '@/components/Tabs';

import TabsDefault from '../demos/tabs/TabsDefault.vue';
import TabsDefaultSrc from '../demos/tabs/TabsDefault.vue?raw';
import TabsLine from '../demos/tabs/TabsLine.vue';
import TabsLineSrc from '../demos/tabs/TabsLine.vue?raw';
import TabsDisabled from '../demos/tabs/TabsDisabled.vue';
import TabsDisabledSrc from '../demos/tabs/TabsDisabled.vue?raw';
import TabsWithIcons from '../demos/tabs/TabsWithIcons.vue';
import TabsWithIconsSrc from '../demos/tabs/TabsWithIcons.vue?raw';
import TabsLinks from '../demos/tabs/TabsLinks.vue';
import TabsLinksSrc from '../demos/tabs/TabsLinks.vue?raw';
import TabsHeadless from '../demos/tabs/TabsHeadless.vue';
import TabsHeadlessSrc from '../demos/tabs/TabsHeadless.vue?raw';

const props = ref({
  variant: 'navigation',
  divider: false,
  dividerFullWidth: false,
  size: 'medium',
  mode: 'auto',
});

const value = ref('overview');
</script>

# Tabs

Tabs organize content into separate views where only one view is visible at a time. Each tab acts as a trigger for its associated panel.

The default `navigation` variant is a desktop-oriented navigation treatment with a contained shell and selected container. Use the transparent `line` variant for a lighter, compact tab bar with a text-width underline. Add `divider` to show a bottom divider, and combine it with `divider-full-width` to extend the divider across the Tabs root.

Tabs use content width by default. Use `mode="fixed"` only when tabs should divide and fill the available width, or `mode="scrollable"` when each tab should keep a minimum touch target and overflow horizontally.

Tabs is built on the `useTabs` composable — the interaction logic (keyboard navigation, ARIA attributes, value management) lives in the composable, while the component adds MD3 styling. See [Composables](/guides/composables) for details.

<DemoContainer>
  <Tabs v-model="value" v-bind="props">
    <TabList>
      <Tab value="overview">Overview</Tab>
      <Tab value="analytics">Analytics</Tab>
      <Tab value="reports">Reports</Tab>
      <Tab value="settings">Settings</Tab>
    </TabList>
    <TabPanel value="overview">Overview content</TabPanel>
    <TabPanel value="analytics">Analytics content</TabPanel>
    <TabPanel value="reports">Reports content</TabPanel>
    <TabPanel value="settings">Settings content</TabPanel>
  </Tabs>
</DemoContainer>

## Examples

### Default

<DemoContainer :src="TabsDefaultSrc">
  <TabsDefault />
</DemoContainer>

### Line Variant

<DemoContainer :src="TabsLineSrc">
  <TabsLine />
</DemoContainer>

### Disabled Tab

Disabled tabs are removed from pointer interaction and keyboard tab order. Arrow-key navigation skips them.

<DemoContainer :src="TabsDisabledSrc">
  <TabsDisabled />
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

## Reference

<AnatomyTable scope="tabs" />

<ApiTable component="Tabs" v-model="props" />

<StyleTokenTable component="Tabs" />

### Tab

<ApiTable component="Tab" />

### TabList

<ApiTable component="TabList" />

### TabPanel

<ApiTable component="TabPanel" />

## Composable

### useTabs

<SourceApiTable api="useTabs" />
