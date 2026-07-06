---
title: NavigationDrawer
---

<script setup lang="ts">
import { ref } from 'vue';
import { NavigationDrawer, NavigationDrawerItem, NavigationDrawerSection } from '@/components/NavigationDrawer';

import NavigationDrawerDefault from '../demos/navigation-drawer/NavigationDrawerDefault.vue';
import NavigationDrawerDefaultSrc from '../demos/navigation-drawer/NavigationDrawerDefault.vue?raw';
import NavigationDrawerPlain from '../demos/navigation-drawer/NavigationDrawerPlain.vue';
import NavigationDrawerPlainSrc from '../demos/navigation-drawer/NavigationDrawerPlain.vue?raw';

const props = ref({
  ariaLabel: 'Primary destinations',
  disabled: false,
  iconSpace: 'root',
});

const value = ref('home');
</script>

# NavigationDrawer

NavigationDrawer provides vertical navigation destinations with selectable items and expandable sections.
Use `iconSpace="root"` when top-level icon and text-only items should share the same label column.

<DemoContainer><NavigationDrawer v-model="value" v-bind="props" style="block-size: 30rem"><NavigationDrawerItem value="home" icon="home" label="Home" /><NavigationDrawerItem value="inbox" icon="inbox" label="Inbox" /><NavigationDrawerSection icon="folder" label="Projects"><NavigationDrawerItem value="active" icon="task_alt" label="Active" /><NavigationDrawerItem value="archived" label="Archived" /></NavigationDrawerSection><NavigationDrawerSection label="Teams"><NavigationDrawerItem value="design" icon="palette" label="Design" /><NavigationDrawerItem value="engineering" label="Engineering" /></NavigationDrawerSection><NavigationDrawerSection label="Plain"><NavigationDrawerItem value="drafts" label="Drafts" /><NavigationDrawerItem value="sent" label="Sent" /></NavigationDrawerSection><NavigationDrawerItem value="settings" icon="settings" label="Settings" /></NavigationDrawer></DemoContainer>

<AnatomyTable scope="navigation-drawer" />

<AnatomyTable scope="navigation-drawer-item" />

<AnatomyTable scope="navigation-drawer-section" />

<ApiTable component="NavigationDrawer" v-model="props" />

<StyleTokenTable component="NavigationDrawer" />

## Examples

### Default

<DemoContainer :src="NavigationDrawerDefaultSrc"><NavigationDrawerDefault /></DemoContainer>

### Without Icons

<DemoContainer :src="NavigationDrawerPlainSrc"><NavigationDrawerPlain /></DemoContainer>

## API

### NavigationDrawer

<ApiTable component="NavigationDrawer" />

### NavigationDrawerItem

<ApiTable component="NavigationDrawerItem" />

### NavigationDrawerSection

<ApiTable component="NavigationDrawerSection" />
