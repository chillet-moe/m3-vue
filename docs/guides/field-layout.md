---
title: Field Layout
---

<script setup lang="ts">
import FieldLabelLayouts from '../.vitepress/components/FieldLabelLayouts.vue';
import FloatingLabelSpacingLab from '../demos/guides/FloatingLabelSpacingLab.vue';
import FloatingLabelSpacingLabSrc from '../demos/guides/FloatingLabelSpacingLab.vue?raw';
</script>

# Field Layout

Choose field dimensions and spacing to fit the surrounding layout density. Let the parent layout's `gap` set spacing
between fields and other controls. Add `labelClearance` only when you observe a floating label visually crowding the
content above an outlined `TextField`, `Select`, or `Combobox`.

## Field and action sizes

Small and extra-small fields use body-medium text and a 20dp icon baseline. Medium fields use body-large text and a 24dp icon baseline. Density adjusts whitespace around the content; typography and icon calibration determine how much room the content needs.

The compact preset selects small fields and small buttons: their default control heights are both 30px at a 16px root font size. This applies to TextField, Select and Combobox. External labels and supporting text sit outside this height. At very negative densities, fields retain at least 4dp of padding above and below their content. Textareas remain content-driven and use the medium typography role.

See the filters-and-actions row in [Preset preview](./presets) to compare controls together.

## Label behavior

`TextField`, `Select` and `Combobox` share `labelBehavior`:

- `floating` renders the built-in floating label and outline notch. This is the component and default preset behavior.
- `external` renders neither, and reserves no floating-label clearance. The compact preset selects this behavior.

Use `fieldLabelBehavior` in `M3VuePlugin` for an application default, or `provide(fieldContextKey, { labelBehavior })` for a subtree. Both accept reactive refs. A component's `label-behavior` prop wins. This setting is independent of size, typography and density. `labelClearance` and `alwaysFloatLabel` only apply to floating labels.

External labels belong to the parent layout. Arrange them above or beside fields, and connect a native `<label>` with the field's `id`. For custom label elements, use `aria-labelledby`. Without a visible label, pass `label` or `aria-label` for an accessible name; a placeholder alone is not a label. In external mode, `label` supplies an `aria-label` fallback only when neither `aria-label` nor `aria-labelledby` is provided. It is not rendered as a placeholder.

```vue
<template>
  <div class="property-row">
    <label for="part-name">Name</label>
    <TextField id="part-name" v-model="name" label-behavior="external" />
  </div>
  <TextField label="Search parts" placeholder="Search…" label-behavior="external" />
</template>

<style scoped>
.property-row {
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr);
  align-items: center;
  column-gap: var(--md-field-column-gap);
}
</style>
```

<FieldLabelLayouts />

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
    <TextField label="Name" label-behavior="floating" />
    <TextField label="Email" type="email" label-behavior="floating" />
    <TextField label="City" label-behavior="floating" />
    <TextField label="Postal code" label-behavior="floating" />
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
