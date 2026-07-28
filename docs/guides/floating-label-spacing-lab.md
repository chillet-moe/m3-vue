---
title: Floating Label Spacing Lab
---

<script setup lang="ts">
import FloatingLabelSpacingLab from '../demos/guides/FloatingLabelSpacingLab.vue';
import FloatingLabelSpacingLabSrc from '../demos/guides/FloatingLabelSpacingLab.vue?raw';
</script>

# Floating Label Spacing Lab

Outlined `TextField`, `Select`, and `Combobox` labels can float across the top edge of the field. The label is painted
partly outside the nominal component box, so a mechanically correct layout gap may still look too tight.

This page makes that visual overflow easy to compare. Adjust the vertical gap from `0px` to `40px`; the dashed outline
shows the nominal component box. The floating label may extend beyond that outline. You can also apply the component
`margin` modes to see how outer margin combines with the parent gap.

::: tip Recommended layout
Use a parent `row-gap` of `16px` for regularly arranged `TextField`, `Select`, and `Combobox` controls. Keep their
`margin` at the default `none` in that layout.
:::

<DemoContainer :src="FloatingLabelSpacingLabSrc" :viewport="false">
  <FloatingLabelSpacingLab />
</DemoContainer>

## What to compare

- Whether adjacent floating labels and field outlines have enough visual separation.
- Whether one spacing value works for populated fields and empty fields with placeholders.
- Whether the preferred spacing still feels appropriate when `TextField`, `Select`, and `Combobox` are mixed.
- How `dense` and `normal` component margins add to the selected parent gap.

## Component margin

All three field components support `margin="none | dense | normal"`. The default is `none`.

- `dense` adds `8px` before and `4px` after the component.
- `normal` adds `16px` before and `8px` after the component.

Use these modes as a local adjustment for an isolated field or a first field next to a tight container boundary. They
are not a replacement for group layout: component margins are additive with flex or grid `gap`, and adjacent margins
may behave differently in normal block flow. Use a semantic class or inline style when a layout needs an exact value
outside these presets.
