---
title: ColorField
---

<script setup lang="ts">
import { ref } from 'vue';
import { ColorField } from '@/components/ColorField';
import type { ColorPickerLayout, ColorPickerSpace } from '@/components/ColorPicker';
import source from '../demos/color-picker/ColorPickerPopover.vue?raw';

const initial = { r: 0.18, g: 0.46, b: 0.83, a: 1 };
const value = ref({ ...initial });
const props = ref({ label: 'Color', alpha: true, disabled: false, layout: 'sv-h' as ColorPickerLayout, channelSpace: 'srgb' as ColorPickerSpace });
</script>

# ColorField

Type or paste a Hex color directly into the field. Select the checkerboard swatch to open a [ColorPicker](./color-picker) for graphical or numeric editing. Both edit the same `v-model:value`.

<DemoContainer :src="source" :viewport="false">
  <ColorField v-bind="props" v-model:value="value" v-model:layout="props.layout" v-model:channel-space="props.channelSpace" :default-value="initial" />
</DemoContainer>

## Hex input

Hex accepts an optional `#` and 3, 4, 6 or 8 digits, with alpha last. Press Enter or leave the field to commit a valid draft. Escape cancels it. An empty or incomplete entry reverts on commit. For example, entering `#0F0` changes the color to green and preserves its opacity. Focusing the field and leaving it untouched preserves the full precision of the bound color.

## Value and settings

Bind an object with `r`, `g`, `b` and `a` as floating-point values from 0 to 1. RGB uses encoded sRGB independently of opacity. Supply `default-value` to enable reset. Set `:alpha="false"` to hide opacity editing while preserving the stored alpha.

The settings button shows the active numeric space. It offers sRGB, Linear sRGB and five diagram layouts. Bind `v-model:channel-space` or `v-model:layout` to share these preferences between fields.

## Keyboard and sizing

Give each field a descriptive `label`, such as “Fill color”. Tab to the swatch and press Enter or Space to open the picker and focus the diagram. Escape cancels an active text draft first. Escape in the settings menu returns to its button. Escape in the panel returns focus to the swatch. Clicking outside keeps committed edits.

The field uses TextField labels, supporting text, error messages and sizing. Set `readonly` to allow selection and copying of the Hex value. Use `size` to align it with other single-line fields. It inherits `fieldSize` from the plugin or `size` from the nearest `fieldContextKey` provider. The default is `medium` and the compact preset supplies `small`.

## Reference

<AnatomyTable scope="color-field" />

<ApiTable component="ColorField" v-model="props" :exclude="['value', 'defaultValue']" />
