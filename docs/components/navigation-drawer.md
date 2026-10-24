---
title: NavigationDrawer
---

<script setup lang="ts">
import { ref } from 'vue';
import { NavigationDrawer, NavigationDrawerItem, NavigationDrawerSection } from '@/components/NavigationDrawer';

import NavigationDrawerDefault from '../demos/navigation-drawer/NavigationDrawerDefault.vue';
import NavigationDrawerDefaultSrc from '../demos/navigation-drawer/NavigationDrawerDefault.vue?raw';
import NavigationDrawerIconOnly from '../demos/navigation-drawer/NavigationDrawerIconOnly.vue';
import NavigationDrawerIconOnlySrc from '../demos/navigation-drawer/NavigationDrawerIconOnly.vue?raw';
import NavigationDrawerPlain from '../demos/navigation-drawer/NavigationDrawerPlain.vue';
import NavigationDrawerPlainSrc from '../demos/navigation-drawer/NavigationDrawerPlain.vue?raw';

const props = ref({
  ariaLabel: 'Primary destinations',
  disabled: false,
  iconSpace: 'root',
  iconOnly: false,
  shape: 'rounded',
});

const value = ref('home');
</script>

# NavigationDrawer

NavigationDrawer provides vertical navigation destinations with selectable items and expandable sections.
Use `iconSpace="root"` when top-level icon and text-only items should share the same label column.
Use `iconOnly` for compact drawers that show leading icons, keep labels available to assistive technologies, and expose labels as tooltips.
Use `shape` to set the default shape for items and section triggers; an individual `NavigationDrawerItem` can override it.

<DemoContainer><NavigationDrawer v-model="value" v-bind="props" style="block-size: 30rem"><NavigationDrawerItem value="home" icon="home" label="Home" /><NavigationDrawerItem value="inbox" icon="inbox" label="Inbox" /><NavigationDrawerSection icon="folder" label="Projects"><NavigationDrawerItem value="active" icon="task_alt" label="Active" /><NavigationDrawerItem value="archived" icon="archive" label="Archived" /></NavigationDrawerSection><NavigationDrawerSection icon="groups" label="Teams"><NavigationDrawerItem value="design" icon="palette" label="Design" /><NavigationDrawerItem value="engineering" icon="engineering" label="Engineering" /></NavigationDrawerSection><NavigationDrawerSection icon="list" label="Plain"><NavigationDrawerItem value="drafts" icon="draft" label="Drafts" /><NavigationDrawerItem value="sent" icon="send" label="Sent" /></NavigationDrawerSection><NavigationDrawerItem value="settings" icon="settings" label="Settings" /></NavigationDrawer></DemoContainer>

## Examples

### Default

<DemoContainer :src="NavigationDrawerDefaultSrc"><NavigationDrawerDefault /></DemoContainer>

### Without Icons

<DemoContainer :src="NavigationDrawerPlainSrc"><NavigationDrawerPlain /></DemoContainer>

### Icon Only

<DemoContainer :src="NavigationDrawerIconOnlySrc"><NavigationDrawerIconOnly /></DemoContainer>

## Reference

<AnatomyTable scope="navigation-drawer" />

<AnatomyTable scope="navigation-drawer-item" />

<AnatomyTable scope="navigation-drawer-section" />

<ApiTable component="NavigationDrawer" v-model="props" />

<StyleTokenTable component="NavigationDrawer" />

### NavigationDrawerItem

<ApiTable component="NavigationDrawerItem" />

### NavigationDrawerSection

<ApiTable component="NavigationDrawerSection" />
