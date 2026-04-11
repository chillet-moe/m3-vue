---
title: v-dropdown
---

<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';

const selected = ref('None');

const dropdownBinding = {
  target: '#docs-dropdown-card',
};

function selectAction(name: string, event: MouseEvent) {
  selected.value = name;

  const currentTarget = event.currentTarget as HTMLElement | null;
  const popover = currentTarget?.closest('[popover]') as (HTMLElement & { hidePopover?: () => void }) | null;
  popover?.hidePopover?.();
}
</script>

# v-dropdown

`v-dropdown` is the low-level directive for toggling a popover surface from a trigger. It is a good fit for menus and custom anchored popovers when you want the library to handle trigger events, anchor wiring, and focus restoration.

<DemoContainer :viewport="false">
  <div style="display: flex; flex-direction: column; gap: 1rem; align-items: flex-start; padding-block: 2rem;">
    <Button v-dropdown="dropdownBinding">Open custom dropdown</Button>
    <Card
      id="docs-dropdown-card"
      popover="auto"
      style="inline-size: 14rem; padding: 0.5rem; display: flex; flex-direction: column; gap: 0.25rem; position: fixed; inset: auto; inset-inline-start: anchor(start); inset-block-start: calc(anchor(bottom) + 0.25rem);"
    >
      <button type="button" style="all: unset; cursor: pointer; padding: 0.75rem; border-radius: 0.5rem;" @click="selectAction('Preview', $event)">
        Preview
      </button>
      <button type="button" style="all: unset; cursor: pointer; padding: 0.75rem; border-radius: 0.5rem;" @click="selectAction('Share', $event)">
        Share
      </button>
      <button type="button" style="all: unset; cursor: pointer; padding: 0.75rem; border-radius: 0.5rem;" @click="selectAction('Delete', $event)">
        Delete
      </button>
    </Card>
    <div>Selected: {{ selected }}</div>
  </div>
</DemoContainer>

## Basic Usage

Point the directive at a popover-enabled element.

```vue
<button v-dropdown="'#menu'">Open menu</button>

<div
  id="menu"
  popover="auto"
  style="
    position: fixed;
    inset: auto;
    inset-inline-start: anchor(start);
    inset-block-start: calc(anchor(bottom) + 0.25rem);
  "
>
  ...
</div>
```

The directive toggles the target popover and sets `position-anchor` so the popover can position itself against the trigger.

## Object Binding

Use the object form when you want to override the anchor or outside-click behavior.

```vue
<button
  v-dropdown="{
    target: '#menu',
    anchor: customAnchorElement,
    closeOnOutsideClick: false,
  }"
>
  Open menu
</button>
```

Binding fields:

| Field                 | Type                            | Default         | Notes                                                            |
| --------------------- | ------------------------------- | --------------- | ---------------------------------------------------------------- |
| `target`              | `string \| HTMLElement \| null` | -               | Required popover surface                                         |
| `anchor`              | `HTMLElement \| null`           | Trigger element | Element used as the position anchor                              |
| `closeOnOutsideClick` | `boolean`                       | `true`          | Closes when a pointer event happens outside trigger and dropdown |

## Keyboard And Events

- Click toggles the dropdown.
- `Enter`, `Space`, and `ArrowDown` open the dropdown and request focus on the first item.
- `ArrowUp` opens the dropdown and requests focus on the last item.
- `Escape` restores focus to the trigger after the dropdown closes.
- The target element dispatches `m3-dropdown:show` and `m3-dropdown:hide` custom events.

When `m3-dropdown:show` fires, its `detail` includes the opening source element and the requested focus direction. Components such as the menu primitives can use that information to place keyboard focus correctly.

## Notes

- `v-dropdown` does not create the dropdown element for you. The target must already exist.
- The target should be a popover surface such as `MenuContainer`, `Card`, or a custom element with `popover="auto"` or `popover="manual"`.
- Custom surfaces are responsible for their own layout styles. The directive only handles behavior and anchor wiring.

For a higher-level menu surface, see [Menu](/components/menu).
