---
title: FloatingActionButtonMenu
---

<script setup lang="ts">
import { ref } from 'vue';
import { FloatingActionButtonMenu, FloatingActionButtonMenuItem } from '@/components/FloatingActionButtonMenu';

import FloatingActionButtonMenuDefault from '../demos/floating-action-button-menu/FloatingActionButtonMenuDefault.vue';
import FloatingActionButtonMenuDefaultSrc from '../demos/floating-action-button-menu/FloatingActionButtonMenuDefault.vue?raw';
import FloatingActionButtonMenuColors from '../demos/floating-action-button-menu/FloatingActionButtonMenuColors.vue';
import FloatingActionButtonMenuColorsSrc from '../demos/floating-action-button-menu/FloatingActionButtonMenuColors.vue?raw';
import FloatingActionButtonMenuSizes from '../demos/floating-action-button-menu/FloatingActionButtonMenuSizes.vue';
import FloatingActionButtonMenuSizesSrc from '../demos/floating-action-button-menu/FloatingActionButtonMenuSizes.vue?raw';
import FloatingActionButtonMenuAlignment from '../demos/floating-action-button-menu/FloatingActionButtonMenuAlignment.vue';
import FloatingActionButtonMenuAlignmentSrc from '../demos/floating-action-button-menu/FloatingActionButtonMenuAlignment.vue?raw';
import FloatingActionButtonMenuControlled from '../demos/floating-action-button-menu/FloatingActionButtonMenuControlled.vue';
import FloatingActionButtonMenuControlledSrc from '../demos/floating-action-button-menu/FloatingActionButtonMenuControlled.vue?raw';

const props = ref({
  open: false,
  color: 'primary',
  size: 'regular',
  alignment: 'end',
  icon: 'add',
  closeIcon: 'close',
  ariaLabel: 'Toggle actions',
  disabled: false,
});
</script>

# FloatingActionButtonMenu

FAB menus open from a floating action button to show a small set of related actions. This component uses the native popover API and implements the M3 Expressive one-size menu with primary, secondary, and tertiary color sets.

<DemoContainer>
  <FloatingActionButtonMenu v-bind="props" @update:open="props.open = $event">
    <FloatingActionButtonMenuItem icon="mail">Message</FloatingActionButtonMenuItem>
    <FloatingActionButtonMenuItem icon="event">Event</FloatingActionButtonMenuItem>
    <FloatingActionButtonMenuItem icon="photo_camera">Photo</FloatingActionButtonMenuItem>
  </FloatingActionButtonMenu>
</DemoContainer>

`update:open(false)` reflects the native popover state immediately. Use `closed` for cleanup that must wait until the
FAB menu's visual exit finishes.

## Examples

### Default

<DemoContainer :src="FloatingActionButtonMenuDefaultSrc">
  <FloatingActionButtonMenuDefault />
</DemoContainer>

### Colors

<DemoContainer :src="FloatingActionButtonMenuColorsSrc">
  <FloatingActionButtonMenuColors />
</DemoContainer>

### Sizes

<DemoContainer :src="FloatingActionButtonMenuSizesSrc">
  <FloatingActionButtonMenuSizes />
</DemoContainer>

### Alignment And Links

<DemoContainer :src="FloatingActionButtonMenuAlignmentSrc">
  <FloatingActionButtonMenuAlignment />
</DemoContainer>

### Controlled

<DemoContainer :src="FloatingActionButtonMenuControlledSrc">
  <FloatingActionButtonMenuControlled />
</DemoContainer>

## Reference

<AnatomyTable scope="floating-action-button-menu" />

<ApiTable component="FloatingActionButtonMenu" v-model="props" />

<StyleTokenTable component="FloatingActionButtonMenu" />
