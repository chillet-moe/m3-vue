import { computed, reactive, watch, type Ref } from 'vue';
import {
  coordinates,
  decode,
  encode,
  toRgb,
  type ColorPickerValue,
  type HueMemory,
  type Polar,
  type PolarModel,
  type Rgb,
  type ColorPickerSpace,
} from './color';

export function useColorEditor(value: Ref<ColorPickerValue>) {
  const linear = computed(() => {
    const { r, g, b } = value.value;
    return { r: decode(r), g: decode(g), b: decode(b) };
  });
  // RGB cannot carry hue on the neutral axis, or saturation at black.
  // Remember the last defined coordinates in each editing space.
  const memory = reactive<Record<ColorPickerSpace, HueMemory>>({
    srgb: { h: 0, hsvS: 0, hslS: 0 },
    linear: { h: 0, hsvS: 0, hslS: 0 },
  });
  const rgb = (space: ColorPickerSpace) => (space === 'linear' ? linear.value : value.value);
  const polar = (space: ColorPickerSpace) => coordinates(rgb(space), memory[space]);
  watch(
    [() => value.value.r, () => value.value.g, () => value.value.b],
    () => {
      for (const space of ['srgb', 'linear'] as const) {
        const { HSV, HSL } = polar(space);
        memory[space] = { h: HSV.h, hsvS: HSV.s, hslS: HSL.s };
      }
    },
    { immediate: true },
  );

  function editPolar(space: ColorPickerSpace, model: PolarModel, patch: Partial<Polar>) {
    const current = polar(space)[model];
    const next = { ...current, ...patch };
    if (next.h === current.h && next.s === current.s && next.level === current.level) return;
    const result = toRgb(next, model);
    if (result.r === result.g && result.g === result.b) {
      // An explicit choice at a singularity must survive even when RGB stays identical.
      for (const key of ['srgb', 'linear'] as const) {
        const hint = memory[key];
        if (patch.h !== undefined || key === space) hint.h = next.h;
        if (key === space || patch.s !== undefined) {
          if (model === 'HSV') {
            hint.hsvS = next.s;
            if (result.r === 0) hint.hslS = next.s / (2 - next.s);
          } else {
            hint.hslS = next.s;
            if (result.r === 0) hint.hsvS = (2 * next.s) / (1 + next.s);
          }
        }
      }
    } else {
      memory[space].h = next.h;
    }
    const { r, g, b } = result;
    const previous = rgb(space);
    if (r === previous.r && g === previous.g && b === previous.b) return;
    value.value =
      space === 'linear'
        ? { r: encode(r), g: encode(g), b: encode(b), a: value.value.a }
        : { ...result, a: value.value.a };
  }

  function editRgb(space: ColorPickerSpace, key: keyof Rgb, next: number) {
    if (rgb(space)[key] !== next) value.value = { ...value.value, [key]: space === 'linear' ? encode(next) : next };
  }
  return { rgb, polar, editRgb, editPolar };
}
