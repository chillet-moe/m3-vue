---
title: NavigationRail
---

<script setup lang="ts">
import { ref } from 'vue';
import { NavigationRail, NavigationRailItem } from '@/components/NavigationRail';

import NavigationRailDefault from '../demos/navigation-rail/NavigationRailDefault.vue';
import NavigationRailDefaultSrc from '../demos/navigation-rail/NavigationRailDefault.vue?raw';
import NavigationRailLinks from '../demos/navigation-rail/NavigationRailLinks.vue';
import NavigationRailLinksSrc from '../demos/navigation-rail/NavigationRailLinks.vue?raw';
import NavigationRailStates from '../demos/navigation-rail/NavigationRailStates.vue';
import NavigationRailStatesSrc from '../demos/navigation-rail/NavigationRailStates.vue?raw';

const props = ref({
  ariaLabel: 'Primary destinations',
  disabled: false,
  state: 'collapsed',
});

const value = ref('home');
</script>

# NavigationRail

NavigationRail provides vertical primary destinations through `NavigationRailItem`, with built-in `collapsed` and `expanded` state switching.

<DemoContainer><NavigationRail v-model="value" v-bind="props" style="block-size: 28rem"><NavigationRailItem value="home" icon="home" label="Home" /><NavigationRailItem value="bookmarks" icon="bookmark" label="Saved" /><NavigationRailItem value="folder" icon="folder" label="Files" /><NavigationRailItem value="settings" icon="settings" label="Settings" /></NavigationRail></DemoContainer>

## Examples

### Default

<DemoContainer :src="NavigationRailDefaultSrc"><NavigationRailDefault /></DemoContainer>

### With Links

<DemoContainer :src="NavigationRailLinksSrc"><NavigationRailLinks /></DemoContainer>

### State Switch

<DemoContainer :src="NavigationRailStatesSrc"><NavigationRailStates /></DemoContainer>

## Reference

<AnatomyTable scope="navigation-rail" />

<AnatomyTable scope="navigation-rail-item" />

<ApiTable component="NavigationRail" v-model="props" />

<StyleTokenTable component="NavigationRail" />

### NavigationRailItem

<ApiTable component="NavigationRailItem" />
