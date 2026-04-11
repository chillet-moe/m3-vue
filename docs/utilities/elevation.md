---
title: Elevation
---

<script setup lang="ts">
import ElevationLevels from '../demos/elevation/ElevationLevels.vue';
import ElevationLevelsSrc from '../demos/elevation/ElevationLevels.vue?raw';
</script>

# Elevation

The library exports Material 3 elevation tokens as CSS custom properties. Use them for custom surfaces, and prefer the component-specific elevation tokens when you are styling one of the provided components.

<DemoContainer :src="ElevationLevelsSrc" :viewport="false"><ElevationLevels /></DemoContainer>

## Available Tokens

Importing `@chillet/m3-vue/style.css` includes the shared elevation scale:

```css
--md-sys-elevation-level0
--md-sys-elevation-level1
--md-sys-elevation-level2
--md-sys-elevation-level3
--md-sys-elevation-level4
--md-sys-elevation-level5
```

These tokens resolve to complete `box-shadow` values, not just blur or offset fragments.

## Usage

Apply a token directly to `box-shadow` on custom surfaces.

```css
.surface {
  background: var(--md-sys-color-surface-container-low);
  border-radius: 1rem;
  box-shadow: var(--md-sys-elevation-level1);
}

.surface:hover {
  box-shadow: var(--md-sys-elevation-level2);
}
```

## Suggested Meanings

| Token                       | Typical use                             |
| --------------------------- | --------------------------------------- |
| `--md-sys-elevation-level0` | Flat and resting surfaces               |
| `--md-sys-elevation-level1` | Slightly raised controls and cards      |
| `--md-sys-elevation-level2` | Hovered surfaces, menus, rich tooltips  |
| `--md-sys-elevation-level3` | Dialogs and snackbars                   |
| `--md-sys-elevation-level4` | Dragged or strongly emphasized surfaces |
| `--md-sys-elevation-level5` | Highest emphasis surfaces               |

## Prefer Semantic Tokens When Available

Built-in components usually expose their own elevation variables, which already map state changes to the system scale.

```css
.custom-dialog-theme {
  --md-comp-dialog-container-elevation: var(--md-sys-elevation-level4);
}
```

That approach is better than overriding `box-shadow` directly because the component keeps its hover, focus, pressed, and disabled behavior coherent.

## Notes

- Elevation tokens only provide shadow values. Pair them with the appropriate surface color tokens for a complete Material 3 surface.
- Keep state transitions meaningful. Raising elevation on hover or drag is usually more effective than using a stronger resting shadow everywhere.
