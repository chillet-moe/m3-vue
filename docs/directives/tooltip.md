---
title: v-tooltip
---

<script setup lang="ts">
import { Button } from '@/components/Button';
import { Tooltip } from '@/components/Tooltip';
import TooltipDynamicContent from '../demos/tooltip/TooltipDynamicContent.vue';
import TooltipDynamicContentSrc from '../demos/tooltip/TooltipDynamicContent.vue?raw';

</script>

# v-tooltip

`v-tooltip` wires hover, focus, keyboard, and touch interactions to a tooltip surface. Use it when you want directive-driven behavior on an existing trigger without manually managing open and close state.

<DemoContainer :viewport="false">
  <div style="display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; padding-block: 2rem;">
    <Button v-tooltip="'#tooltip-directive'">Generated tooltip</Button>
    <Button v-tooltip="'#tooltip-directive-rich'">Referenced tooltip</Button>
    <Tooltip id="tooltip-directive">
      Content
    </Tooltip>
    <Tooltip id="tooltip-directive-rich" variant="rich">
      Content
    </Tooltip>
  </div>
</DemoContainer>

## Generate A Tooltip

Pass a config object with `content` to let the directive create and clean up a Tooltip surface for you.

```vue
<button
  v-tooltip="{
    content: 'Helpful text',
    variant: 'plain',
    placement: 'top',
    interactive: false,
  }"
>
  Hover me
</button>
```

Use this form for plain text tips. Generated tips use the same DOM contract and CSS as the `Tooltip` component. A bare string binding is treated as a target selector, not inline content.

## Reuse An Existing Tooltip

Pass a selector or an element reference when the tooltip surface is already rendered, for example when you want a rich tooltip authored with the `Tooltip` component.

```vue
<button v-tooltip="'#save-tooltip'">Save</button>

<Tooltip id="save-tooltip" variant="rich" popover="hint">
  Save the current draft and keep editing.
</Tooltip>
```

## Binding API

`v-tooltip` accepts:

- `string`: a selector for an existing tooltip element
- `HTMLElement`: an existing tooltip element
- `TooltipConfig`: a configuration object

<SourceApiTable api="vTooltip" type="TooltipConfig" :show-signature="false" />

## Behavior Notes

- Hover and focus open the tooltip. `Escape` closes it.
- Touch uses a long-press interaction and suppresses the follow-up synthetic click.
- The directive repositions on scroll and resize.
- When CSS anchor positioning is unavailable, it falls back to JavaScript positioning.
- Updating the binding updates the same tooltip instance when possible.

## Dynamic Content

The directive keeps its internal open state synchronized with native popover state, so a tooltip can stay usable when a mouse click changes the trigger content and tooltip text.

When an action component already exposes a `title` tooltip, treat that as the component's default tooltip. For dynamic or authored tooltip content, attach `v-tooltip` to the component and render a separate `Tooltip` surface instead of combining it with `title`.

<DemoContainer :src="TooltipDynamicContentSrc" :viewport="false">
  <TooltipDynamicContent />
</DemoContainer>

For tooltip surface styling and authored rich content, see [Tooltip](/components/tooltip).
