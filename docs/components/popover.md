---
title: Popover
---

<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@/components/Button';
import { Popover } from '@/components/Popover';

import PopoverDefault from '../demos/popover/PopoverDefault.vue';
import PopoverDefaultSrc from '../demos/popover/PopoverDefault.vue?raw';
import PopoverControlled from '../demos/popover/PopoverControlled.vue';
import PopoverControlledSrc from '../demos/popover/PopoverControlled.vue?raw';

const props = ref({
  popover: 'auto',
  placement: 'bottom-start',
  matchAnchorWidth: false,
});

const previewOpen = ref(false);
const previewAnchor = ref<HTMLElement>();
</script>

# Popover

Popover provides a generic anchored top-layer surface for authored content that is not a menu, tooltip, or modal dialog.

Popover is optional. Use it when you need a small anchored panel with simple open/close behavior, light dismiss, and basic positioning. For richer interaction patterns, prefer a purpose-built component such as `Menu`, `Tooltip`, `Dialog`, `DatePicker`, or `TimePicker`, or compose directly with the native Popover API and the library's styling tokens.

<DemoContainer :viewport="false">
  <div style="padding: 2rem; min-block-size: 12rem">
    <span ref="previewAnchor" style="display: inline-flex">
      <Button variant="outlined" @click="previewOpen = !previewOpen">Toggle popover</Button>
    </span>
    <Popover v-bind="props" v-model:open="previewOpen" :anchor-element="previewAnchor" role="dialog" aria-label="Popover preview">
      <div style="display: grid; gap: 0.5rem; min-inline-size: 12rem">
        <strong>Popover content</strong>
        <span style="color: var(--md-sys-color-on-surface-variant)">Use it for lightweight anchored panels.</span>
      </div>
    </Popover>
  </div>
</DemoContainer>

## Close lifecycle

`update:open(false)` is emitted when the native popover closes. The later `closed` event waits for Popover-owned exit
motion to finish, but does not wait for animations inside slot content. Keep slot payload available while closing and
release it from `closed`.

## Examples

### Default

<DemoContainer :src="PopoverDefaultSrc" :viewport="false">
  <PopoverDefault />
</DemoContainer>

### Controlled

<DemoContainer :src="PopoverControlledSrc" :viewport="false">
  <PopoverControlled />
</DemoContainer>

## Floating surface

See [floating surface tokens](../utilities/elevation.md#floating-surfaces) for shared theme colors, borders, shadows, and an interactive example with nested menus and dialogs.

## Reference

<AnatomyTable scope="popover" />

<ApiTable component="Popover" v-model="props" />

<StyleTokenTable component="Popover" />
