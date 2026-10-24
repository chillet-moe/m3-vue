---
title: State Layer
---

<script setup lang="ts">
import StateLayerDefault from '../demos/state-layer/StateLayerDefault.vue';
import StateLayerDefaultSrc from '../demos/state-layer/StateLayerDefault.vue?raw';
import StateLayerNested from '../demos/state-layer/StateLayerNested.vue';
import StateLayerNestedSrc from '../demos/state-layer/StateLayerNested.vue?raw';
</script>

# State Layer

The state layer utility provides the shared hover, focus, and ripple treatment used by interactive Material 3 surfaces in this library.

<DemoContainer :src="StateLayerDefaultSrc" :viewport="false"><StateLayerDefault /></DemoContainer>

## Basic Usage

Apply the `state-layer` class to an interactive element and set a readable foreground color. The overlay uses `currentColor` by default.

```vue
<div
  class="m3-state-layer"
  tabindex="0"
  role="button"
  style="
    border-radius: 9999px;
    background: var(--md-sys-color-primary-container);
    color: var(--md-sys-color-on-primary-container);
  "
>
  Click me
</div>
```

## Initialization

Library components register their state layers automatically in the Document that contains them, including after a panel moves between windows. For custom markup using the `m3-state-layer` class, acquire and release a registration explicitly:

```ts
import { initStateLayer } from '@chillet/m3-vue';

const release = initStateLayer(element.ownerDocument);
// When the custom UI is disposed:
release();
```

Registrations share listeners within each Document. Each call returns an idempotent release function; release every registration when its owner is disposed. Omitting the argument selects the current Document.

## Styling Hooks

| Token                                        | Default        | Notes                         |
| -------------------------------------------- | -------------- | ----------------------------- |
| `--md-state-layer-color`                     | `currentColor` | Base overlay and ripple color |
| `--md-sys-state-hover-state-layer-opacity`   | `0.08`         | Hover opacity token           |
| `--md-sys-state-focus-state-layer-opacity`   | `0.1`          | Focus opacity token           |
| `--md-sys-state-pressed-state-layer-opacity` | `0.1`          | Pressed opacity token         |
| `--md-sys-state-dragged-state-layer-opacity` | `0.16`         | Dragged opacity token         |

## Behavior Notes

- Pointer presses create a ripple centered on the interaction point.
- Keyboard activation with `Enter` and button `Space` creates a centered ripple.
- Disabled controls and elements with `aria-disabled="true"` suppress the overlay and ripple.
- Ripple expansion uses the CSS `@property` at-rule; there is no JavaScript animation fallback.
- `prefers-reduced-motion: reduce` disables the ripple animation.

## Nested State Layers

When a `m3-state-layer` element is nested inside another, hovering or pressing the inner element will not activate the outer element's overlay. Only the innermost interactive layer responds.

<DemoContainer :src="StateLayerNestedSrc" :viewport="false"><StateLayerNested /></DemoContainer>

For elevation shadows that are often paired with state layers, see [Elevation](/utilities/elevation).
