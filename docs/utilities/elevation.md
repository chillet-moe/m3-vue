---
title: Elevation
---

<script setup lang="ts">
import ElevationLevels from '../demos/elevation/ElevationLevels.vue';
import OverlaySurfaces from '../demos/elevation/OverlaySurfaces.vue';
import OverlaySurfacesSrc from '../demos/elevation/OverlaySurfaces.vue?raw';
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
| `--md-sys-elevation-level2` | Hovered surfaces                        |
| `--md-sys-elevation-level3` | Snackbars                               |
| `--md-sys-elevation-level4` | Dragged or strongly emphasized surfaces |
| `--md-sys-elevation-level5` | Highest emphasis surfaces               |

## Prefer Semantic Tokens When Available

Built-in components usually expose their own elevation variables, which already map state changes to the system scale.

```css
.custom-dialog-theme {
  --md-dialog-container-elevation: var(--md-sys-elevation-level4);
}
```

That approach is better than overriding `box-shadow` directly because the component keeps its hover, focus, pressed, and disabled behavior coherent.

## Notes

- Elevation tokens only provide shadow values. Pair them with the appropriate surface color tokens for a complete Material 3 surface.
- Keep state transitions meaningful. Raising elevation on hover or drag is usually more effective than using a stronger resting shadow everywhere.

## Floating surfaces

Menu, Popover (including Select and Combobox dropdowns), rich Tooltip, and Dialog share the `--md-overlay-*` contract. Both color schemes use a real 1px border and two black shadows. Dark surfaces are lighter and shadows more opaque; shadow geometry and shape remain the same in both schemes. Plain tooltips retain their inverse surface; docked sheets retain their edge-attached treatment.

<DemoContainer :src="OverlaySurfacesSrc" :viewport="false"><OverlaySurfaces /></DemoContainer>

| Token                               | Default / role                                                                               |
| ----------------------------------- | -------------------------------------------------------------------------------------------- |
| `--md-overlay-menu-color`           | Menu: surface-container-low in light, surface-container-high in dark                         |
| `--md-overlay-container-color`      | Popover, dropdowns, rich Tooltip: surface-container in light, surface-container-high in dark |
| `--md-overlay-modal-color`          | Dialog: surface-container-high in light, surface-container-highest in dark                   |
| `--md-overlay-on-container-color`   | on-surface text for custom surfaces                                                          |
| `--md-overlay-border-width`         | 1px                                                                                          |
| `--md-overlay-border-color`         | Black at 8% in light, white at 12% in dark                                                   |
| `--md-overlay-shadow-key-color`     | Black at 8% in light, 38% in dark                                                            |
| `--md-overlay-shadow-ambient-color` | Black at 4% in light, 32% in dark                                                            |
| `--md-overlay-elevation`            | `0 2px 6px` near shadow + `0 8px 24px` diffuse shadow                                        |
| `--md-overlay-modal-elevation`      | `0 4px 8px` near shadow + `0 12px 32px` diffuse shadow                                       |

Shapes use the existing `--md-shape-popover` and `--md-shape-overlay` tokens. Menu groups retain their active/inactive corner rules. Vibrant menus and dropdowns retain their tertiary palette. System elevation levels remain available for controls and other raised surfaces; changing them no longer changes these floating surfaces.

Override shared tokens at the theme root. Color values may use `light-dark()` so local `color-scheme` also works. When deriving a new elevation from shadow colors in a subtree, redeclare the elevation there as well: CSS custom-property references resolve where they are declared.

```css
:root {
  --md-overlay-border-color: light-dark(rgb(0 0 0 / 6%), rgb(255 255 255 / 14%));
}

/* A consumer-owned native dialog uses exactly the same contract. */
dialog.settings {
  background: var(--md-overlay-modal-color);
  background-clip: padding-box;
  color: var(--md-overlay-on-container-color);
  border: var(--md-overlay-border-width) solid var(--md-overlay-border-color);
  border-radius: var(--md-shape-overlay);
  box-shadow: var(--md-overlay-modal-elevation);
}
```

Component color, shape, and elevation overrides remain available. For an individual border, use `--md-menu-container-border-color`, `--md-popover-container-border-color`, `--md-dialog-container-border-color`, or `--md-rich-tooltip-container-border-color`. Borders do not occupy `box-shadow` or `outline`, leaving focus indicators independent. The unused Menu and rich Tooltip `container-shadow-color` tokens have been removed; use the shared shadow color tokens or a component elevation override instead.

Use `background-clip: padding-box` on custom floating surfaces. It keeps the surface fill out of the translucent border, so the border and outer shadow both blend with the backdrop. In the light theme, this keeps the border close to the near shadow in darkness instead of producing a pale seam.
