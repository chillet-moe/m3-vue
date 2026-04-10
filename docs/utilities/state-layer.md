---
title: State Layer
---

<script setup lang="ts">
import StateLayerDefault from '../demos/state-layer/StateLayerDefault.vue';
import StateLayerDefaultSrc from '../demos/state-layer/StateLayerDefault.vue?raw';
</script>

# State Layer

The state layer utility provides the shared hover, focus, and ripple treatment used by interactive Material 3 surfaces in this library.

<DemoContainer :src="StateLayerDefaultSrc" :viewport="false"><StateLayerDefault /></DemoContainer>

## Basic Usage

Apply the `state-layer` class to an interactive element and set a readable foreground color. The overlay uses `currentColor` by default.

```vue
<div
  class="state-layer"
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

If you install `M3VuePlugin`, the library calls `initStateLayer()` for you.

```ts
import { initStateLayer } from '@chillet/m3-vue';

initStateLayer();
```

The function is idempotent, so calling it more than once is safe.

## Styling Hooks

| Token | Default | Notes |
| --- | --- | --- |
| `--md-state-layer-color` | `currentColor` | Base overlay and ripple color |
| `--md-sys-state-hover-state-layer-opacity` | `0.08` | Hover opacity token |
| `--md-sys-state-focus-state-layer-opacity` | `0.1` | Focus opacity token |
| `--md-sys-state-pressed-state-layer-opacity` | `0.1` | Pressed opacity token |
| `--md-sys-state-dragged-state-layer-opacity` | `0.16` | Dragged opacity token |

## Behavior Notes

- Pointer presses create a ripple centered on the interaction point.
- Keyboard activation with `Enter` and button `Space` creates a centered ripple.
- Disabled controls and elements with `aria-disabled="true"` suppress the overlay and ripple.
- When `@property` animation support is unavailable, the ripple falls back to a JavaScript animation path.
- `prefers-reduced-motion: reduce` disables the ripple animation.

For elevation shadows that are often paired with state layers, see [Elevation](/utilities/elevation).
