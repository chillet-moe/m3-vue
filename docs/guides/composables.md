# Composables

M3 Vue follows a component-first approach: use its styled components for the standard experience, and reach for a composable when you need to reuse interaction logic or build a custom presentation. Composables expose behavior and state; components remain useful and independently testable Vue units.

## Why use a composable?

| Need                                                          | How a composable helps                                                                            |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Keep interaction logic reusable and understandable            | Move focused behavior out of a component when that improves its design                            |
| Build a custom template with established interaction behavior | Bind the composable's attributes and handlers to your own elements                                |
| Share behavior between related components                     | `useSelect` provides the full selection and navigation logic used by both `Select` and `Combobox` |

## Available composables

| Composable            | Purpose                                                                              | Used by                                                                                                                                |
| --------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| `useTabs`             | Tab selection, keyboard navigation, and ARIA behavior                                | `Tabs`                                                                                                                                 |
| `useAccordion`        | Accordion state, keyboard navigation, and ARIA behavior                              | Headless logic; no corresponding styled Accordion component                                                                            |
| `useMenu`             | Menu open and close state, keyboard navigation, submenus, and selection              | `Menu`, `FloatingActionButtonMenu`                                                                                                     |
| `useSelect`           | Selection, value management, filtering, menu control, and navigation                 | `Select`, `Combobox`                                                                                                                   |
| `usePopover`          | Synchronize native popover open and close state, dismissal, and exit motion          | `Popover`                                                                                                                              |
| `useAnimatedNumber`   | Animate changes to numeric values                                                    | `Slider`; also used by progress state logic                                                                                            |
| `usePressShapeMorph`  | Press-shape morphing attributes, disabled handling, and release state                | `Button`, `IconButton`, `Chip`, `Card`, `ListItem`, `FloatingActionButton`, `FloatingActionButtonMenu`, `FloatingActionButtonMenuItem` |
| `usePressedState`     | Low-level pressed-state management                                                   | `usePressShapeMorph`                                                                                                                   |
| `useDelegatedTooltip` | Delegated events and a reusable slot pool for many dynamic, non-interactive tooltips | Custom high-density tooltip lists                                                                                                      |

## Using composables

### Use a component (recommended)

In most cases, use the styled component directly:

```vue
<script setup>
import { Tabs, TabList, Tab, TabPanel } from '@chillet/m3-vue';
import { ref } from 'vue';

const value = ref('tab1');
</script>

<template>
  <Tabs v-model="value">
    <TabList>
      <Tab value="tab1">Tab 1</Tab>
      <Tab value="tab2">Tab 2</Tab>
    </TabList>
    <TabPanel value="tab1">Content 1</TabPanel>
    <TabPanel value="tab2">Content 2</TabPanel>
  </Tabs>
</template>
```

### Use a composable directly (headless)

Use a composable when you need to control the markup and appearance:

```vue
<script setup>
import { useTabs } from '@chillet/m3-vue';

const tabs = useTabs({ value: 'first' });
const items = ['first', 'second', 'third'];
</script>

<template>
  <div v-bind="tabs.triggerListAttrs.value">
    <button v-for="id in items" :key="id" v-bind="tabs.getTriggerAttrs(id)">
      {{ id }}
    </button>
  </div>

  <div v-for="id in items" :key="id" v-bind="tabs.getPanelAttrs(id)">{{ id }} content</div>
</template>
```

The returned attribute objects include the relevant `role`, `aria-*`, `tabindex`, and event handlers. Bind them with `v-bind` to provide the corresponding accessibility and interaction behavior.

Press-shape morphing can also be bound to a custom element:

```vue
<script setup>
import { usePressShapeMorph } from '@chillet/m3-vue';

const { pressShapeMorphAttrs } = usePressShapeMorph();
</script>

<template>
  <button v-bind="pressShapeMorphAttrs">Action</button>
</template>
```

### Delegated tooltips for large lists

For a list with many dynamic, non-interactive tooltips, avoid creating a Tooltip DOM element and a full `v-tooltip` listener for every item. `useDelegatedTooltip` attaches hover, focus, and Escape handling to the container, then reuses a bounded pool of Tooltip surfaces. Vue still renders each slot's content, including rich markup such as multiple lines or `kbd` elements. Use individual `v-tooltip` instances for interactive rich overlays.

The first hover displays immediately. A short debounce applies only when switching from one visible anchor to another, preventing flicker while moving quickly across the list. Keyboard focus changes are immediate.

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { Tooltip, useDelegatedTooltip } from '@chillet/m3-vue';

const container = ref<HTMLElement>();
const { tooltipSlots, refreshTooltip } = useDelegatedTooltip(
  container,
  'keyboard-tooltip',
  (anchor) => anchor.dataset.tooltip ?? null,
  (target) => (target instanceof Element ? target.closest<HTMLElement>('[data-tooltip]') : null),
  3,
);
</script>

<template>
  <div ref="container">
    <button v-for="item in items" :key="item.id" :data-tooltip="item.tooltip">
      {{ item.label }}
    </button>

    <Tooltip v-for="slot in tooltipSlots" :id="slot.id" :key="slot.id" popover="hint">
      <span v-for="line in slot.tooltip?.lines ?? []" :key="line">{{ line }}</span>
    </Tooltip>
  </div>
</template>
```

Keep `tooltipId` unique within the document. When the list data changes, call `refreshTooltip()` to re-resolve the current slot's content. On unmount, the composable releases its anchors, slot controllers, and container listeners.

## API

Each composable has parameters and return values designed for its purpose. Check its type definitions and examples; composables do not share a common state, attribute, or method interface.

### Reactive options

Whether an option accepts a static value, a ref, or a getter depends on the composable's type definition. For example, `useTabs` accepts each form for `orientation`:

```ts
// Static
const tabs = useTabs({ orientation: 'vertical' });

// Ref
const orientation = ref('horizontal');
const tabs = useTabs({ orientation });

// Getter that tracks prop changes
const tabs = useTabs({ orientation: () => props.orientation });
```

### Controlled and uncontrolled state

Passing `value` makes the composable controlled. Use `onValueChange` to handle updates:

```ts
// Uncontrolled: internal state
const tabs = useTabs();

// Controlled
const active = ref('tab1');
const tabs = useTabs({
  value: () => active.value,
  onValueChange: (v) => {
    active.value = v;
  },
});
```
