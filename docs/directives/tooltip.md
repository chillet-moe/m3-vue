---
title: v-tooltip
---

<script setup lang="ts">
import { Button } from '@/components/Button';
import { Tooltip } from '@/components/Tooltip';

const generatedBinding = {
  content: 'Saved changes are synced automatically.',
  placement: 'bottom' as const,
  interactive: false,
};
</script>

# v-tooltip

`v-tooltip` wires hover, focus, keyboard, and touch interactions to a tooltip surface. Use it when you want directive-driven behavior on an existing trigger without manually managing open and close state.

## Demo

<DemoContainer :viewport="false">
  <div style="display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; padding-block: 2rem;">
    <Button v-tooltip="generatedBinding">Generated tooltip</Button>
    <Button v-tooltip="'#tooltip-directive-rich'">Referenced tooltip</Button>

    <Tooltip id="tooltip-directive-rich" variant="rich" popover="hint">
      Rich tooltip content can be authored separately and reused across triggers.
    </Tooltip>
  </div>
</DemoContainer>

## Generate A Tooltip

Pass a config object with `content` to let the directive create and clean up a tooltip element for you.

```vue
<button
  v-tooltip="{
    content: 'Helpful text',
    placement: 'top',
    interactive: false,
  }"
>
  Hover me
</button>
```

Use this form for plain text tips. A bare string binding is treated as a target selector, not inline content.

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

`TooltipConfig` fields:

| Field | Type | Default | Notes |
| --- | --- | --- | --- |
| `target` | `string \| HTMLElement` | - | Existing tooltip element to control |
| `content` | `string` | - | Text used when the directive creates the tooltip element |
| `placement` | `'top' \| 'bottom' \| 'left' \| 'right' \| 'start' \| 'end'` | `'top'` | Logical values adapt to writing direction |
| `offset` | `string` | `'0.25rem'` | Applied through CSS `translate` |
| `interactive` | `boolean` | `true` | Uses dialog semantics when `true`, tooltip semantics when `false` |
| `popoverType` | `'hint' \| 'auto' \| 'manual'` | `'hint'` | Passed to the underlying popover element |
| `openDelay` | `number` | `60` | Delay before showing on hover, in milliseconds |
| `closeDelay` | `number` | `80` | Delay before closing on pointer leave, in milliseconds |
| `longpressDelay` | `number` | `450` | Touch long-press delay, in milliseconds |

## Behavior Notes

- Hover and focus open the tooltip. `Escape` closes it.
- Touch uses a long-press interaction and suppresses the follow-up synthetic click.
- The directive repositions on scroll and resize.
- When CSS anchor positioning is unavailable, it falls back to JavaScript positioning.
- Updating the binding updates the same tooltip instance when possible.

For tooltip surface styling and authored rich content, see [Tooltip](/components/tooltip).
