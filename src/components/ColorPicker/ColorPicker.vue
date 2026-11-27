<script setup lang="ts">
import { computed, ref, shallowRef, useId, useTemplateRef, watch } from 'vue';
import { ButtonGroup, ButtonGroupItem } from '@/components/ButtonGroup';
import { SliderField } from '@/components/SliderField';
import { Button } from '@/components/Button';
import { Menu, MenuContainer, MenuItem, MenuLabel } from '@/components/Menu';
import { vDropdown } from '@/directives/Dropdown';
import { IconButton } from '@/components/IconButton';
import { TextField } from '@/components/TextField';
import { useM3Locale } from '@/locales/context';
import { useElementEnvironment, isHTMLTag } from '@/internal/elementEnvironment';
import ColorSwatch from './ColorSwatch.vue';
import ColorDiagram from './ColorDiagram.vue';
import {
  formatHex,
  parseHex,
  pickerLayouts,
  type ColorPickerLayout,
  type ColorPickerValue,
  type PolarModel,
  type ColorPickerSpace,
} from './color';
import { useColorEditor } from './useColorEditor';

export type ColorPickerProps = {
  /** Show the opacity controls and include alpha in the Hex field. */
  alpha?: boolean;
  /** Color restored by the reset button or Backspace outside text inputs. */
  defaultValue?: ColorPickerValue;
  disabled?: boolean;
};
const { alpha = true, disabled = false, defaultValue } = defineProps<ColorPickerProps>();
/** Unpremultiplied, encoded sRGB with floating-point channels in [0, 1]. */
const value = defineModel<ColorPickerValue>('value', { required: true });
const emit = defineEmits<{ /** Request dismissal of the containing surface. */ close: [] }>();
const root = useTemplateRef('root');
const diagram = useTemplateRef('diagram');
defineExpose({ focus: () => diagram.value?.focus() });

const { messages } = useM3Locale();
const names = computed(() => messages.value.colorPicker);
const editor = useColorEditor(value);
const models = ['RGB', 'HSV', 'HSL'] as const;
const model = ref<'RGB' | PolarModel>('RGB');
const modelGroupName = useId();
/** Diagram selected in picker settings. */
const layout = defineModel<ColorPickerLayout>('layout', { default: 'sv-h' });
/** Transfer function for the numeric editors. Hex and the diagram always use encoded sRGB. */
const space = defineModel<ColorPickerSpace>('channelSpace', { default: 'srgb' });
const settings = useTemplateRef('settings');
const settingsId = useId();
const settingsOpen = ref(false);
const layoutNames = computed(() => ({
  'sv-h': 'SV + H',
  'hs-v': 'HS + V',
  'hv-s': 'HV + S',
  'hsv-wheel': names.value.hsvWheel,
  'hsl-wheel': names.value.hslWheel,
}));
const diagramLayout = computed(() => pickerLayouts[layout.value]);
const spaceName = computed(() => (space.value === 'srgb' ? 'sRGB' : names.value.linear));
const hex = computed(() => formatHex(value.value, alpha));
const spaces = computed(
  () =>
    [
      { value: 'srgb', label: 'sRGB' },
      { value: 'linear', label: names.value.linear },
    ] as const,
);

const hexField = useTemplateRef('hexField');
async function copyHex() {
  const clipboard = root.value?.ownerDocument.defaultView?.navigator.clipboard;
  if (clipboard) {
    try {
      await clipboard.writeText(hex.value);
      return;
    } catch {
      // Keep the native copy shortcut available when clipboard access is denied.
    }
  }
  hexField.value?.focus();
  hexField.value?.select();
}

const channelUnits = {
  byte: { scale: 255, max: 255, step: 1, digits: 0, suffix: '' },
  linear: { scale: 1, max: 1, step: 0.01, digits: 4, suffix: '' },
  degrees: { scale: 1, max: 360, step: 1, digits: 1, suffix: '°' },
  percent: { scale: 100, max: 100, step: 1, digits: 1, suffix: '%' },
} as const;

const fields = computed(() => {
  const field = (
    symbol: string,
    label: string,
    number: number,
    unit: keyof typeof channelUnits,
    set: (n: number) => void,
  ) => {
    const { scale, max, step, digits, suffix } = channelUnits[unit];
    return {
      symbol: symbol + suffix,
      label,
      value: number * scale,
      max,
      step,
      format: (n: number) => String(Number(n.toFixed(digits))),
      update: (n: number) => set(n / scale),
    };
  };

  const names = messages.value.colorPicker;
  const editSpace = space.value;
  const editModel = model.value;
  const channels = [];
  if (editModel === 'RGB') {
    const rgb = editor.rgb(editSpace);
    const unit = editSpace === 'srgb' ? 'byte' : 'linear';
    for (const [key, label] of [
      ['r', names.red],
      ['g', names.green],
      ['b', names.blue],
    ] as const) {
      channels.push(field(key.toUpperCase(), label, rgb[key], unit, (n) => editor.editRgb(editSpace, key, n)));
    }
  } else {
    const { h, s, level } = editor.polar(editSpace)[editModel];
    const hsv = editModel === 'HSV';
    channels.push(
      field('H', names.hue, h, 'degrees', (n) => editor.editPolar(editSpace, editModel, { h: n })),
      field('S', names.saturation, s, 'percent', (n) => editor.editPolar(editSpace, editModel, { s: n })),
      field(hsv ? 'V' : 'L', hsv ? names.value : names.lightness, level, 'percent', (n) =>
        editor.editPolar(editSpace, editModel, { level: n }),
      ),
    );
  }
  if (alpha) channels.push(field('A', names.alpha, value.value.a, 'percent', setAlpha));
  return channels;
});

function setAlpha(a: number) {
  if (!disabled && alpha && value.value.a !== a) value.value = { ...value.value, a };
}

const hexDraft = ref<string>();
watch(
  [value, () => alpha, () => disabled],
  () => {
    hexDraft.value = undefined;
  },
  { deep: true },
);
function commitHex() {
  if (hexDraft.value === undefined) return;
  const parsed = parseHex(hexDraft.value);
  hexDraft.value = undefined;
  if (parsed && !disabled) value.value = { ...parsed, a: alpha ? (parsed.a ?? value.value.a) : value.value.a };
}
function reset() {
  if (!disabled && defaultValue) value.value = { ...defaultValue, a: alpha ? defaultValue.a : value.value.a };
}
function keydown(event: KeyboardEvent) {
  if (event.isComposing || event.defaultPrevented) return;
  const editingText = isHTMLTag(event.target, 'input') && event.target.type === 'text' && !event.target.readOnly;
  if (event.key === 'Escape') {
    if (hexDraft.value === undefined) {
      emit('close');
      return;
    }
    hexDraft.value = undefined;
    event.preventDefault();
    event.stopPropagation();
  } else if (event.key === 'Enter' && event.target === hexField.value?.el) {
    event.preventDefault();
    commitHex();
  } else if (event.key === 'Backspace' && defaultValue && !disabled && !editingText) {
    event.preventDefault();
    reset();
  }
}

type ScreenSampler = new () => { open(options: { signal: AbortSignal }): Promise<{ sRGBHex: string }> };
const sampler = shallowRef<ScreenSampler>();
let request: AbortController | undefined;
useElementEnvironment(root, (document) => {
  const view = document.defaultView as (Window & { EyeDropper?: ScreenSampler }) | null;
  sampler.value = view?.EyeDropper;
  return () => request?.abort();
});
watch(
  () => disabled,
  (off) => {
    if (off) {
      settingsOpen.value = false;
      request?.abort();
    }
  },
);
async function sample() {
  if (!sampler.value || disabled || request) return;
  const controller = new AbortController();
  request = controller;
  try {
    const { sRGBHex } = await new sampler.value().open({ signal: controller.signal });
    const rgb = parseHex(sRGBHex);
    if (rgb && !controller.signal.aborted && !disabled) value.value = { ...rgb, a: value.value.a };
  } catch (error) {
    if ((error as Error).name !== 'AbortError') throw error;
  } finally {
    request = undefined;
  }
}
</script>

<template>
  <div
    ref="root"
    class="m3-color-picker"
    data-scope="color-picker"
    data-part="root"
    role="group"
    :aria-label="names.picker"
    :aria-disabled="disabled"
    @keydown="keydown"
  >
    <div class="m3-color-row" data-scope="color-picker" data-part="toolbar">
      <ColorSwatch
        class="m3-color-preview"
        data-scope="color-picker"
        data-part="preview"
        :value="value"
        role="img"
        :aria-label="formatHex(value, true)"
      />
      <TextField
        ref="hexField"
        class="m3-color-hex"
        size="extra-small"
        aria-label="Hex"
        spellcheck="false"
        autocomplete="off"
        :disabled="disabled"
        :model-value="hexDraft ?? hex"
        @update:model-value="hexDraft = $event"
        @blur="commitHex"
      >
        <template #prefix>Hex</template>
        <template #trailing>
          <IconButton
            icon="content_copy"
            size="extra-small"
            :title="names.copyHex"
            :disabled="disabled"
            @click="copyHex"
          />
        </template>
      </TextField>
      <IconButton
        v-if="sampler"
        icon="colorize"
        size="extra-small"
        :title="names.sample"
        :disabled="disabled"
        @click="sample"
      />
      <IconButton
        v-if="defaultValue"
        icon="restart_alt"
        size="extra-small"
        :title="names.reset"
        :disabled="disabled"
        @click="reset"
      />
    </div>
    <ColorDiagram
      ref="diagram"
      :layout="diagramLayout"
      :point="editor.polar('srgb')[diagramLayout.model]"
      :value="value"
      :alpha="alpha"
      :disabled="disabled"
      @adjust="editor.editPolar('srgb', diagramLayout.model, $event)"
      @opacity="setAlpha"
    />
    <div class="m3-color-row" data-scope="color-picker" data-part="representation">
      <ButtonGroup
        v-model="model"
        type="connected"
        size="extra-small"
        variant="outlined"
        :name="modelGroupName"
        :aria-label="names.model"
        :disabled="disabled"
      >
        <ButtonGroupItem v-for="mode in models" :key="mode" :value="mode">{{ mode }}</ButtonGroupItem>
      </ButtonGroup>
      <Button
        v-dropdown="settings?.menuRef"
        class="m3-color-settings"
        size="extra-small"
        trailing-icon="tune"
        aria-haspopup="menu"
        :aria-controls="settingsId"
        :aria-expanded="settingsOpen"
        :title="names.settings"
        :aria-label="`${names.settings} (${spaceName})`"
        :disabled="disabled"
      >
        {{ spaceName }}
      </Button>
      <Menu :id="settingsId" ref="settings" v-model:open="settingsOpen" size="small" :aria-label="names.settings">
        <MenuContainer role="group" :aria-label="names.space">
          <MenuLabel>{{ names.space }}</MenuLabel>
          <MenuItem
            v-for="option in spaces"
            :key="option.value"
            role="menuitemradio"
            :checked="space === option.value"
            :disabled="disabled"
            @click="space = option.value"
          >
            {{ option.label }}
          </MenuItem>
        </MenuContainer>
        <MenuContainer role="group" :aria-label="names.layout">
          <MenuLabel>{{ names.layout }}</MenuLabel>
          <MenuItem
            v-for="(label, key) in layoutNames"
            :key="key"
            role="menuitemradio"
            :checked="layout === key"
            :disabled="disabled"
            @click="layout = key"
          >
            {{ label }}
          </MenuItem>
        </MenuContainer>
      </Menu>
    </div>
    <div :key="`${space}-${model}`" class="m3-color-channels" data-scope="color-picker" data-part="channels">
      <label
        v-for="field in fields"
        :key="field.symbol"
        class="m3-color-channel"
        data-scope="color-picker"
        data-part="channel"
      >
        <span>{{ field.symbol }}</span>
        <SliderField
          :value="field.value"
          :max="field.max"
          :step="field.step"
          :format-value="field.format"
          reject-out-of-range
          size="extra-small"
          :aria-label="field.label"
          :disabled="disabled"
          @update:value="field.update"
        />
      </label>
    </div>
  </div>
</template>

<style src="./ColorPicker.css"></style>
