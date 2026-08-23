---
title: Scrollable Content Visual Overflow
---

<script setup lang="ts">
import ScrollableContentVisualOverflow from '../demos/guides/ScrollableContentVisualOverflow.vue';
import ScrollableContentVisualOverflowSrc from '../demos/guides/ScrollableContentVisualOverflow.vue?raw';
</script>

# Scrollable Content Visual Overflow

Dialog, BottomSheet, and SideSheet keep their headline and actions visible while public content scrolls. Their content
scrollports include a default block-axis visual-overflow inset so ordinary descendant elevation, focus indicators,
floating labels, outlines, and small transforms are not clipped at the first or last scroll position.

The inset expands the scrollport's effective painting area without changing slot content alignment, the surface size,
or the visual spacing between the headline, content, and actions. Inline content padding already provides equivalent
space at the start and end edges.

Popover follows the same default-support principle through its existing all-axis `--md-popover-padding`. Tabs,
Select, and DatePicker also contain scrollports, but those scrollports own controlled component internals rather than
arbitrary public content.

<DemoContainer :src="ScrollableContentVisualOverflowSrc" :viewport="false">
  <ScrollableContentVisualOverflow />
</DemoContainer>

## Component tokens

Each surface exposes its own token and defaults to `0.5rem`:

| Component   | Token                                             |
| ----------- | ------------------------------------------------- |
| Dialog      | `--md-dialog-content-visual-overflow-inset`       |
| BottomSheet | `--md-bottom-sheet-content-visual-overflow-inset` |
| SideSheet   | `--md-side-sheet-content-visual-overflow-inset`   |

Increase the inset when authored content deliberately uses a larger shadow or transform. Set it to `0px` only when
the content is intentionally full-bleed or clipping is part of the design.

```css
.large-elevation-dialog {
  --md-dialog-content-visual-overflow-inset: 1rem;
}
```

This contract covers visual effects attached to normal content. Nested menus, tooltips, popovers, and other floating
surfaces should still use their component's top-layer behavior instead of relying on an ancestor's inset.
