---
title: ColorPicker
---

<script setup lang="ts">
import { ref } from 'vue';
import { ColorPicker, type ColorPickerLayout, type ColorPickerSpace } from '@/components/ColorPicker';

const value = ref({ r: 0.18, g: 0.46, b: 0.83, a: 0.9 });
const props = ref({ layout: 'sv-h' as ColorPickerLayout, channelSpace: 'srgb' as ColorPickerSpace, alpha: true, disabled: false });
</script>

# ColorPicker

Embed the panel in a property inspector or bind it to a selected gradient stop. Dragging updates the preview, fields and bound color immediately.

<DemoContainer :sticky="false">
  <ColorPicker v-bind="props" v-model:value="value" v-model:layout="props.layout" v-model:channel-space="props.channelSpace" />
</DemoContainer>

## Color model and precision

Bind `v-model:value` to a `ColorPickerValue` object with `r`, `g`, `b` and `a` in the inclusive range 0–1. RGB uses encoded sRGB and the channels are independent of alpha (unpremultiplied). Values are JavaScript double-precision numbers. The channel fields round their resting display. Click a field or focus it and press Enter to edit the full value. Opening the picker, focusing fields or changing layouts, models and spaces preserves the original values.

The diagram uses encoded sRGB. Open the settings button beside RGB / HSV / HSL to switch numeric channels between sRGB and Linear sRGB. The button shows the active space. Bind `v-model:channel-space` to `srgb` or `linear` to read or set this choice. Encoded RGB uses the familiar 0–255 scale, so red in `#800000` reads 128. Linear RGB uses 0–1. Hue uses 0–360°, and saturation, value, lightness and opacity use 0–100%. Fractional entries are accepted on every scale. A gray color remembers the last hue, and black remembers the last saturation while the panel is mounted.

## Precise input

Drag a channel’s SliderField horizontally or use the arrow keys to adjust it. Click or press Enter for exact input. In a channel or the Hex field, press Enter or leave the field to commit. Escape cancels a draft. Incomplete entries and numbers outside the channel range revert on commit.

Copy the current Hex value with the button at the end of the field, or use the usual text copy and paste shortcuts. It accepts an optional `#` and 3, 4, 6 or 8 hexadecimal digits. For example, `#0F08` expands to `#00FF0088`. Hex always uses 8-bit encoded sRGB. Omitting alpha or using the screen eyedropper keeps the current opacity. Set `:alpha="false"` to hide opacity controls and preserve the bound alpha, including when entering Hex with an alpha suffix. At zero opacity the RGB channels remain editable.

## Diagram and shortcuts

Picker settings also offers five diagrams. Use `v-model:layout` to read or set the choice among `sv-h` (default), `hs-v`, `hv-s`, `hsv-wheel` and `hsl-wheel`. Click or touch to position the marker, then drag. Hold Shift to reduce drag sensitivity or Ctrl to snap hue to 30° intervals. Scroll over the diagram to change HSV value or HSL lightness.

Tab through the plane, tracks, selectors and text fields. Use Left/Right in the RGB, HSV and HSL button group to switch the numeric model. Left/Right and Up/Down adjust the two plane axes. On a wheel they adjust hue and saturation respectively. Arrow keys adjust a focused track, and Home/End select its endpoints. With `default-value` supplied, use the reset button or press Backspace outside a text input. The screen eyedropper appears in supporting browsers.

## Reference

<AnatomyTable scope="color-picker" />

<ApiTable component="ColorPicker" v-model="props" :exclude="['value', 'defaultValue']" />
