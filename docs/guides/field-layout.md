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

## Layout gap tokens

Use these tokens in the parent grid or flex layout:

| Token                   | Default | Purpose             |
| ----------------------- | ------- | ------------------- |
| `--md-field-row-gap`    | `1rem`  | Gap between rows    |
| `--md-field-column-gap` | `1rem`  | Gap between columns |

Both are included in `style.css` and have the same defaults with either theme. They do not add component margins
or affect layouts that do not reference them. Choose values for your form's content; these defaults are a starting point.

```vue
<template>
  <div class="profile-fields">
    <TextField label="Name" />
    <TextField label="Email" type="email" />
    <TextField label="City" />
    <TextField label="Postal code" />
  </div>
</template>

<style scoped>
.profile-fields {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr));
  row-gap: var(--md-field-row-gap);
  column-gap: var(--md-field-column-gap);
}
</style>
```

Set the tokens globally or on a containing region to share spacing across forms:

```css
.account-settings {
  --md-field-row-gap: 1.5rem;
  --md-field-column-gap: 1rem;
}
```

Nested layouts inherit the values and may override either axis independently. With flex layouts, CSS `row-gap`
and `column-gap` follow the container's direction and wrapping; a column stack uses `row-gap` between items.

Changing `--md-density` changes control whitespace, not these gaps. Changing `labelClearance` adds margin above
fields without changing the parent's gap. Tokens can also space mixed settings groups, but section spacing and
action-row spacing remain choices of those layouts.

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

Adjust row and column gaps using CSS lengths such as `1rem` or `24px`; clear either input to inherit its token.
Change density and label clearance separately to compare component height, layout spacing and floating-label room.
The field grid collapses to one column when space is limited. The mixed panel uses the same row gap.

<DemoContainer :src="FloatingLabelSpacingLabSrc" :viewport="false">
  <FloatingLabelSpacingLab />
</DemoContainer>
