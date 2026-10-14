---
title: TextField
---

<script setup lang="ts">
import { ref } from 'vue';
import { TextField } from '@/components/TextField';

import TextFieldDefault from '../demos/text-field/TextFieldDefault.vue';
import TextFieldDefaultSrc from '../demos/text-field/TextFieldDefault.vue?raw';
import TextFieldConfigurations from '../demos/text-field/TextFieldConfigurations.vue';
import TextFieldConfigurationsSrc from '../demos/text-field/TextFieldConfigurations.vue?raw';
import TextFieldPassword from '../demos/text-field/TextFieldPassword.vue';
import TextFieldPasswordSrc from '../demos/text-field/TextFieldPassword.vue?raw';
import TextFieldButtonOutlineComparison from '../demos/text-field/TextFieldButtonOutlineComparison.vue';
import TextFieldButtonOutlineComparisonSrc from '../demos/text-field/TextFieldButtonOutlineComparison.vue?raw';
import FieldSizes from '../demos/shared/FieldSizes.vue';
import FieldSizesSrc from '../demos/shared/FieldSizes.vue?raw';

const props = ref({
  label: 'Label',
  shape: 'square',
  size: 'medium',
  labelClearance: undefined,
  disabled: false,
  required: false,
  supportingText: 'Supporting text',
  placeholder: '',
  alwaysFloatLabel: false,
  error: '',
});

const modelValue = ref('');
</script>

# TextField

Text fields cover baseline Material 3 input cases including supporting text, validation, adornments, and multiline entry.

`TextField` always uses a string model, including when `type="number"`. Number inputs retain the native numeric keyboard,
validation behavior, and textual `input.value` representation, while parsing the model into a numeric value remains the
application's responsibility.

Field spacing belongs to the surrounding layout; preserve its intended density instead of normalizing every field
group to one gap. `labelClearance` accepts a CSS length for local block-start clearance and can inherit a subtree
default from `fieldContextKey`; it is additive with any parent gap. See the
[floating label spacing guide](../guides/floating-label-spacing-lab).

<DemoContainer>
  <div style="max-inline-size: 22rem;">
    <TextField v-bind="props" v-model="modelValue" />
  </div>
</DemoContainer>

<AnatomyTable scope="text-field" />

<ApiTable component="TextField" v-model="props" :exclude="['as', 'rows']" />

<StyleTokenTable component="TextField" />

## Examples

### Sizes and toolbar alignment

Single-line fields support `extra-small` (32px), `small` (40px), and `medium` (56px), matching Button size names.
The `size` prop overrides `fieldContextKey`'s `size`, with `medium` as the fallback. Set `fieldSize` in `M3VuePlugin`
for an application default, or provide the context for a subtree. See [component defaults](/getting-started#component-defaults).

Leading and trailing icon slots preserve the selected container height. Multiline fields always use `medium`;
content and `rows` determine their final height.

Prefix and suffix content uses the input typography and preserves the selected single-line height.

Place an `IconButton` directly in the `leading` or `trailing` slot for interactive adornments. TextField automatically sizes and aligns its touch target without changing the field height; plain icons and text remain unchanged.

<DemoContainer :src="FieldSizesSrc">
  <FieldSizes />
</DemoContainer>

### Outlined control comparison

TextField and outlined Button use the same resting outline color, size-matched outline width, square shape, and
container height. TextField keeps its native floating-label notch and field-specific focus, error, and disabled states.

<DemoContainer :src="TextFieldButtonOutlineComparisonSrc">
  <TextFieldButtonOutlineComparison />
</DemoContainer>

### Default

<DemoContainer :src="TextFieldDefaultSrc">
  <TextFieldDefault />
</DemoContainer>

### Configurations

<DemoContainer :src="TextFieldConfigurationsSrc">
  <TextFieldConfigurations />
</DemoContainer>

### Password Visibility

<DemoContainer :src="TextFieldPasswordSrc">
  <TextFieldPassword />
</DemoContainer>
