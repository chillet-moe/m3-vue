---
title: Field Layout
---

<script setup lang="ts">
import FloatingLabelSpacingLab from '../demos/guides/FloatingLabelSpacingLab.vue';
import FloatingLabelSpacingLabSrc from '../demos/guides/FloatingLabelSpacingLab.vue?raw';
</script>

# Field Layout

Choose field dimensions and spacing to fit the surrounding layout density. Let the parent layout's `gap` set spacing
between fields and other controls. Add `labelClearance` only when you observe a floating label visually crowding the
content above an outlined `TextField`, `Select`, or `Combobox`.

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

## Compare in the demo

- Whether adjacent floating labels and field outlines have enough visual separation.
- Whether one spacing value works for populated fields and empty fields with placeholders.
- Whether the preferred spacing still feels appropriate next to headings, body text, selection controls, dividers,
  and actions.
- How a concrete `labelClearance` length adds to the selected parent gap.

<DemoContainer :src="FloatingLabelSpacingLabSrc" :viewport="false">
  <FloatingLabelSpacingLab />
</DemoContainer>
