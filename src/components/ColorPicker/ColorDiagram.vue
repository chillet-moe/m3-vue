<script setup lang="ts">
import { computed, nextTick, useTemplateRef, watch } from 'vue';
import { useM3Locale } from '@/locales/context';
import {
  cssRgb,
  toRgb,
  unit,
  type pickerLayouts,
  type ColorPickerLayout,
  type ColorPickerValue,
  type Polar,
} from './color';

const props = defineProps<{
  layout: (typeof pickerLayouts)[ColorPickerLayout];
  point: Polar;
  value: ColorPickerValue;
  alpha: boolean;
  disabled: boolean;
}>();
const emit = defineEmits<{ adjust: [patch: Partial<Polar>]; opacity: [alpha: number] }>();
const { messages } = useM3Locale();
const plane = useTemplateRef('plane');
defineExpose({ focus: () => plane.value?.focus() });

type Axis = keyof Polar | 'a';
function label(axis: Axis) {
  const names = messages.value.colorPicker;
  if (axis === 'h') return names.hue;
  if (axis === 's') return names.saturation;
  if (axis === 'a') return names.alpha;
  return props.layout.model === 'HSL' ? names.lightness : names.value;
}
const position = computed(() => {
  const { h, s } = props.point;
  if (props.layout.wheel) {
    const angle = (h * Math.PI) / 180;
    return { x: (1 + s * Math.sin(angle)) / 2, y: (1 - s * Math.cos(angle)) / 2 };
  }
  return { x: fraction(props.layout.x), y: 1 - fraction(props.layout.y) };
});
function fraction(axis: Axis) {
  if (axis === 'a') return props.value.a;
  return axis === 'h' ? props.point.h / 360 : props.point[axis];
}
function color(patch: Partial<Polar>) {
  return cssRgb(toRgb({ ...props.point, ...patch }, props.layout.model));
}
function ramp(axis: keyof Polar, fixed: Partial<Polar> = {}, circular = false) {
  const stops =
    axis === 'h'
      ? [0, 60, 120, 180, 240, 300, 360]
      : axis === 'level' && props.layout.model === 'HSL'
        ? [0, 0.5, 1]
        : [0, 1];
  const colors = stops.map((n) => color({ ...fixed, [axis]: n })).join(', ');
  return circular ? `conic-gradient(in srgb, ${colors})` : `linear-gradient(to right in srgb, ${colors})`;
}
const background = computed(() => {
  if (props.layout.wheel) {
    return `radial-gradient(circle closest-side, ${color({ s: 0 })}, transparent), ${ramp('h', { s: 1 }, true)}`;
  }
  const { x, y } = props.layout;
  return `linear-gradient(to top, ${color({ [y]: 0 })}, transparent), ${ramp(x, { [y]: 1 })}`;
});

type Part = 'plane' | 'bar' | 'alpha';
function apply(part: Part, x: number, y: number, snap: boolean) {
  if (part === 'alpha') {
    emit('opacity', unit(x));
    return;
  }
  const channel = (axis: keyof Polar, t: number) =>
    axis !== 'h' ? unit(t) : snap ? Math.round(unit(t) * 12) * 30 : unit(t) * 360;
  if (part === 'bar') {
    const axis = props.layout.bar;
    emit('adjust', { [axis]: channel(axis, x) });
  } else if (props.layout.wheel) {
    const dx = x * 2 - 1;
    const dy = y * 2 - 1;
    const s = unit(Math.hypot(dx, dy));
    const angle = (Math.atan2(dx, -dy) / (2 * Math.PI) + 1) % 1;
    emit('adjust', s === 0 ? { s } : { h: channel('h', angle), s });
  } else {
    const { x: horizontal, y: vertical } = props.layout;
    emit('adjust', { [horizontal]: channel(horizontal, x), [vertical]: channel(vertical, 1 - y) });
  }
}

let drag:
  | { id: number; part: Part; bounds: DOMRect; x: number; y: number; clientX: number; clientY: number }
  | undefined;
async function start(event: PointerEvent, part: Part) {
  if (props.disabled || drag || !event.isPrimary || event.button !== 0) return;
  const target = event.currentTarget as HTMLElement;
  const bounds = target.getBoundingClientRect();
  if (!bounds.width || !bounds.height) return;
  event.preventDefault();
  target.focus({ preventScroll: true });
  target.setPointerCapture(event.pointerId);
  // Focusing the diagram commits any channel draft on blur. Read its updated
  // hue, saturation, level and alpha before applying the pointer position.
  await nextTick();
  if (props.disabled || !target.hasPointerCapture(event.pointerId)) return;
  const { clientX, clientY } = event;
  let x = (clientX - bounds.left) / bounds.width;
  let y = (clientY - bounds.top) / bounds.height;
  if (event.shiftKey) {
    x = part === 'plane' ? position.value.x : fraction(part === 'alpha' ? 'a' : props.layout.bar);
    y = position.value.y;
  }
  drag = { id: event.pointerId, part, bounds, x, y, clientX, clientY };
  if (!event.shiftKey) apply(part, x, y, event.ctrlKey);
}
function move(event: PointerEvent) {
  if (!drag || drag.id !== event.pointerId || props.disabled) return;
  const scale = event.shiftKey ? 0.1 : 1;
  drag.x += ((event.clientX - drag.clientX) / drag.bounds.width) * scale;
  drag.y += ((event.clientY - drag.clientY) / drag.bounds.height) * scale;
  drag.clientX = event.clientX;
  drag.clientY = event.clientY;
  apply(drag.part, drag.x, drag.y, event.ctrlKey);
}
function end(event: PointerEvent) {
  if (drag?.id !== event.pointerId) return;
  if (event.type === 'pointerup' && (drag.clientX !== event.clientX || drag.clientY !== event.clientY)) move(event);
  drag = undefined;
}
watch(
  () => [props.layout, props.disabled, props.alpha],
  () => {
    drag = undefined;
  },
);

function keydown(event: KeyboardEvent, part: Part) {
  if (props.disabled) return;
  let delta: number;
  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowUp':
      delta = 1;
      break;
    case 'ArrowLeft':
    case 'ArrowDown':
      delta = -1;
      break;
    case 'Home':
      delta = -Infinity;
      break;
    case 'End':
      delta = Infinity;
      break;
    default:
      return;
  }
  event.preventDefault();
  const vertical = event.key === 'ArrowUp' || event.key === 'ArrowDown';
  const axis = part === 'alpha' ? 'a' : part === 'bar' ? props.layout.bar : vertical ? props.layout.y : props.layout.x;
  const step = axis === 'h' ? 1 / 360 : 0.01;
  let next = unit(fraction(axis) + delta * step * (event.shiftKey ? 0.1 : 1));
  if (axis === 'h' && event.ctrlKey && Number.isFinite(delta))
    next = unit((Math.round(fraction(axis) * 12) + delta) / 12);
  if (axis === 'a') emit('opacity', next);
  else emit('adjust', { [axis]: axis === 'h' ? next * 360 : next });
}
function scroll(event: WheelEvent) {
  if (props.disabled || !event.deltaY) return;
  event.preventDefault();
  emit('adjust', { level: unit(props.point.level - Math.sign(event.deltaY) * (event.shiftKey ? 0.001 : 0.01)) });
}
const tracks = computed(() => {
  const axis = props.layout.bar;
  const items = [
    { part: 'bar' as Part, axis: axis as Axis, gradient: axis === 'h' ? ramp('h', { s: 1, level: 1 }) : ramp(axis) },
  ];
  if (props.alpha)
    items.push({
      part: 'alpha',
      axis: 'a',
      gradient: `linear-gradient(to right, transparent, ${cssRgb(props.value)})`,
    });
  return items;
});
</script>

<template>
  <div
    class="m3-color-diagram"
    data-scope="color-picker"
    data-part="diagram"
    @pointermove="move"
    @pointerup="end"
    @pointercancel="end"
    @lostpointercapture="end"
    @wheel="scroll"
  >
    <div
      ref="plane"
      class="m3-color-plane"
      data-scope="color-picker"
      data-part="plane"
      :data-wheel="layout.wheel"
      :style="{
        backgroundImage: background,
        '--_marker-x': position.x * 100 + '%',
        '--_marker-y': position.y * 100 + '%',
        '--_marker-color': cssRgb(value),
      }"
      role="group"
      :aria-label="`${label(layout.x)} / ${label(layout.y)}`"
      :aria-disabled="disabled"
      :tabindex="disabled ? -1 : 0"
      @pointerdown="start($event, 'plane')"
      @keydown="keydown($event, 'plane')"
    />
    <div
      v-for="track in tracks"
      :key="track.part"
      class="m3-color-track"
      data-scope="color-picker"
      :data-part="track.part"
      :style="{ '--_gradient': track.gradient, '--_marker-x': fraction(track.axis) * 100 + '%' }"
      role="slider"
      :aria-label="label(track.axis)"
      :aria-valuemin="0"
      :aria-valuemax="track.axis === 'h' ? 360 : 1"
      :aria-valuenow="track.axis === 'h' ? point.h : fraction(track.axis)"
      :aria-disabled="disabled"
      :tabindex="disabled ? -1 : 0"
      @pointerdown="start($event, track.part)"
      @keydown="keydown($event, track.part)"
    />
  </div>
</template>
