---
title: Selection Controls in List Items
---

<script setup lang="ts">
import SelectionControlsInListItems from '../demos/selection-controls-in-list-items/SelectionControlsInListItems.vue';
import SelectionControlsInListItemsSrc from '../demos/selection-controls-in-list-items/SelectionControlsInListItems.vue?raw';
</script>

# Selection Controls in List Items

`CheckBox`, `Radio`, and `Switch` can appear inside a list item as state indicators. In that layout the row is usually the larger, easier target, while the selection control only communicates the current state.

Use the control's `presentation` prop for this case. Presentation mode keeps the Material 3 visual state, but removes the nested native input, hides the visual control from assistive technology, and disables the control's own state-layer effect. The parent row must provide the accessible name, role, checked state, disabled state, and interaction feedback.

## Pattern

<DemoContainer :src="SelectionControlsInListItemsSrc" :viewport="false"><SelectionControlsInListItems /></DemoContainer>

## Accessibility Rules

- Keep one interactive target per row. The row is the control; the visual `CheckBox`, `Radio`, or `Switch` is not another focusable element.
- Put the accessible name on the row, usually through visible `title` text.
- Set `aria-checked` on the row and keep it synchronized with the visual control's `checked` state.
- Use the matching role: `checkbox` for independent selections, `radio` for a single choice within a set, and `switch` for immediate on/off settings.
- Wrap related radio rows in a `radiogroup` with an accessible name.
- For radio groups that need native radio keyboard behavior, keep native radio inputs or add arrow-key navigation in the parent group.
- When a row is disabled, disable the row and pass `disabled` to the presentation control so the visual state matches the interaction state.

## When Not to Use Presentation

Do not use `presentation` for a standalone control. A standalone `CheckBox`, `Radio`, or `Switch` should keep its native input so forms, keyboard interaction, focus indication, and assistive technology work without extra code.

Also avoid rendering a disabled visual control inside an enabled row. That communicates that the visible control is unavailable while the row still changes state, which is confusing.
