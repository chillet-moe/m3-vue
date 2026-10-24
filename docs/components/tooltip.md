---
title: Tooltip
---

<script setup lang="ts">
import { ref } from 'vue';
import { Tooltip } from '@/components/Tooltip';

import TooltipDefault from '../demos/tooltip/TooltipDefault.vue';
import TooltipDefaultSrc from '../demos/tooltip/TooltipDefault.vue?raw';
import TooltipVariants from '../demos/tooltip/TooltipVariants.vue';
import TooltipVariantsSrc from '../demos/tooltip/TooltipVariants.vue?raw';
import TooltipPopoverTypes from '../demos/tooltip/TooltipPopoverTypes.vue';
import TooltipPopoverTypesSrc from '../demos/tooltip/TooltipPopoverTypes.vue?raw';

const props = ref({
  variant: 'plain',
  popover: 'hint',
});

const content = ref('Tooltip');
</script>

# Tooltip

Tooltip exposes the shared tooltip surface for plain and rich treatments, with control over the underlying popover behavior.

<DemoContainer :viewport="false">
  <Tooltip v-bind="props">{{ content }}</Tooltip>
</DemoContainer>

### Default

<DemoContainer :src="TooltipDefaultSrc" :viewport="false">
  <TooltipDefault />
</DemoContainer>

### Variants

<DemoContainer :src="TooltipVariantsSrc" :viewport="false">
  <TooltipVariants />
</DemoContainer>

### Popover Types

<DemoContainer :src="TooltipPopoverTypesSrc" :viewport="false">
  <TooltipPopoverTypes />
</DemoContainer>

## Action Tooltips {#action-tooltips}

Action components use `title` as the simple text tooltip entry point. The title is rendered with the library tooltip behavior and is not forwarded to the DOM, so native HTML tooltips do not appear.

Simple action titles use one shared, non-interactive tooltip surface. The surface and its anchor are created lazily
when an action is first hovered, keyboard-focused, or long-pressed, so unopened actions do not allocate tooltip DOM
or per-trigger event listeners. The shared surface follows the active action and is released when its action tree is
unmounted.

```vue
<Button title="Save changes">Save</Button>

<IconButton icon="settings" title="Settings" />

<FloatingActionButton icon="edit" title="Compose" />
```

This behavior is available on:

- `Button`
- `IconButton`
- `FloatingActionButton`

For icon-only actions, `title` is also used as the fallback accessible name when neither `aria-label` nor `aria-labelledby` is provided.

```vue
<IconButton icon="settings" title="Settings" />

<!-- Equivalent accessible name, but keeps a different tooltip string. -->
<IconButton icon="settings" aria-label="Open settings" title="Settings" />
```

Use `v-tooltip` when you need rich or interactive content, a referenced tooltip surface, custom placement, or
different interaction options. Authored rich surfaces keep their own DOM, focus, and interaction lifecycle rather
than using the shared simple-title runtime.

```vue
<Button v-tooltip="'#save-tip'">Save</Button>

<Tooltip id="save-tip" variant="rich">
  Save the current draft and keep editing.
</Tooltip>
```

See [v-tooltip](/directives/tooltip) for the full directive API.

## Floating surface

See [floating surface tokens](../utilities/elevation.md#floating-surfaces) for shared theme colors, borders, shadows, and an interactive example with nested menus and dialogs.

## Reference

<AnatomyTable scope="tooltip" />

<ApiTable component="Tooltip" v-model="props" />

<StyleTokenTable component="Tooltip" />
