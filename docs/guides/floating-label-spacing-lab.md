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
shows each item's nominal box. The floating label may extend beyond that outline. You can also apply the component
`labelClearance` to see how a concrete CSS length combines with the parent gap in both a field-only stack and a mixed
settings panel.

::: tip Layout ownership
The demo starts with an `8px` parent `row-gap` and `0.5rem` of label clearance because that combination provides a
harmonious regular-density reference here. Treat it as a visual starting point, not a migration rule: choose the gap
from the surrounding content and add clearance only where floating labels need it.
:::

<DemoContainer :src="FloatingLabelSpacingLabSrc" :viewport="false">
  <FloatingLabelSpacingLab />
</DemoContainer>

## What to compare

- Whether adjacent floating labels and field outlines have enough visual separation.
- Whether one spacing value works for populated fields and empty fields with placeholders.
- Whether the preferred spacing still feels appropriate next to headings, body text, selection controls, dividers,
  and actions.
- How a concrete `labelClearance` length adds to the selected parent gap.

## Label clearance

`TextField`, `Select`, and `Combobox` accept `labelClearance`, a CSS length applied as block-start margin. It is unset
by default, so the component adds no clearance and does not override layout styles from a semantic class.

```vue
<TextField label-clearance="0.5rem" />
```

The asymmetric spacing reflects the actual overflow: the floating label crosses the field's block-start edge, while
the component has no corresponding visual overflow at its block-end edge. Prefer `rem` when the clearance should
follow the document's root scale, but any valid CSS length is accepted.

Label clearance is not a replacement for group layout: it is additive with flex or grid `gap`. Parent gap still owns
the rhythm between all children, while label clearance only compensates a field's floating-label overflow.

## Providing a subtree default

Provide `fieldContextKey` from any existing ancestor when a component subtree shares the same clearance. The value may
be a string, `ref`, or `computed`; an explicit component prop overrides it.

```vue
<script setup lang="ts">
import { computed, provide, ref } from 'vue';
import { fieldContextKey } from '@chillet/m3-vue';

const compact = ref(true);
const labelClearance = computed(() => (compact.value ? '0.5rem' : '0.75rem'));

provide(fieldContextKey, { labelClearance });
</script>
```

Do not provide a clearance merely because a subtree contains fields. Preserve its existing density, and provide a
value only when the shared visual treatment calls for it.
