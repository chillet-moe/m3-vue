<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, useId, useTemplateRef, watch } from 'vue';

import { Button, IconButton, Slider } from '@/index';
import { vDropdown } from '@/directives/Menu';

type ShapeRoleKey =
  | 'action'
  | 'field'
  | 'fieldSquare'
  | 'chip'
  | 'card'
  | 'popover'
  | 'compact'
  | 'overlay'
  | 'indicator'
  | 'fab';

type ShapeRole = {
  affects: string;
  full?: boolean;
  key: ShapeRoleKey;
  label: string;
  max: number;
  min: number;
  step: number;
  token: string;
};

type ShapeRoleValue = {
  full: boolean;
  px: number;
};

type ShapePreset = {
  label: string;
  values: Record<ShapeRoleKey, ShapeRoleValue>;
};

const storageKey = 'm3-vue-docs-shape-tokens';

const shapeRoles: ShapeRole[] = [
  {
    key: 'action',
    token: '--md-shape-action',
    label: 'Action',
    affects: 'Button, IconButton, ButtonGroup, Select, DatePicker actions, FAB menu actions',
    min: 0,
    max: 32,
    step: 1,
  },
  {
    key: 'field',
    token: '--md-shape-field',
    label: 'Field',
    affects: 'TextField rounded containers',
    min: 0,
    max: 32,
    step: 1,
  },
  {
    key: 'fieldSquare',
    token: '--md-shape-field-square',
    label: 'Field square',
    affects: 'TextField square containers, InputOtp inputs',
    min: 0,
    max: 32,
    step: 1,
  },
  {
    key: 'chip',
    token: '--md-shape-chip',
    label: 'Chip',
    affects: 'Chip, Menu inactive containers, Tabs active tonal containers, TimePicker fields',
    min: 0,
    max: 28,
    step: 1,
  },
  {
    key: 'card',
    token: '--md-shape-card',
    label: 'Card',
    affects: 'Card, rich Tooltip, Tabs tonal containers and focus indicators',
    min: 0,
    max: 32,
    step: 1,
  },
  {
    key: 'popover',
    token: '--md-shape-popover',
    label: 'Popover',
    affects: 'Menu surfaces, active menu containers, detached SideSheet surfaces',
    min: 0,
    max: 32,
    step: 1,
  },
  {
    key: 'compact',
    token: '--md-shape-compact',
    label: 'Compact',
    affects: 'Snackbar and plain Tooltip surfaces',
    min: 0,
    max: 20,
    step: 1,
  },
  {
    key: 'overlay',
    token: '--md-shape-overlay',
    label: 'Overlay',
    affects: 'Dialog, DatePicker surfaces, TimePicker surfaces',
    min: 0,
    max: 40,
    step: 1,
  },
  {
    key: 'indicator',
    token: '--md-shape-indicator',
    label: 'Indicator',
    affects: 'LinearProgressIndicator, LoadingIndicator, NavigationRail active indicators, ListItem indicators',
    min: 0,
    max: 32,
    step: 1,
    full: true,
  },
  {
    key: 'fab',
    token: '--md-shape-fab',
    label: 'FAB',
    affects: 'FloatingActionButton and FloatingActionButtonMenu triggers',
    min: 0,
    max: 32,
    step: 1,
  },
];

const presets: ShapePreset[] = [
  {
    label: 'Material',
    values: {
      action: { full: false, px: 28 },
      field: { full: false, px: 16 },
      fieldSquare: { full: false, px: 12 },
      chip: { full: false, px: 8 },
      card: { full: false, px: 12 },
      popover: { full: false, px: 16 },
      compact: { full: false, px: 4 },
      overlay: { full: false, px: 28 },
      indicator: { full: true, px: 32 },
      fab: { full: false, px: 16 },
    },
  },
  {
    label: 'Soft',
    values: {
      action: { full: false, px: 30 },
      field: { full: false, px: 20 },
      fieldSquare: { full: false, px: 16 },
      chip: { full: false, px: 12 },
      card: { full: false, px: 18 },
      popover: { full: false, px: 20 },
      compact: { full: false, px: 8 },
      overlay: { full: false, px: 32 },
      indicator: { full: true, px: 32 },
      fab: { full: false, px: 20 },
    },
  },
  {
    label: 'Sharp',
    values: {
      action: { full: false, px: 6 },
      field: { full: false, px: 4 },
      fieldSquare: { full: false, px: 4 },
      chip: { full: false, px: 4 },
      card: { full: false, px: 6 },
      popover: { full: false, px: 8 },
      compact: { full: false, px: 2 },
      overlay: { full: false, px: 12 },
      indicator: { full: false, px: 4 },
      fab: { full: false, px: 8 },
    },
  },
];

const roleValues = reactive<Record<ShapeRoleKey, ShapeRoleValue>>(createRoleValues(presets[0].values));
const isMounted = ref(false);
const isOpen = ref(false);
const copied = ref(false);
const panelRef = useTemplateRef<HTMLDivElement>('panel');
const panelId = `shape-token-controls-${useId()}`;
let copyFeedbackTimer: number | undefined;
const dropdownBinding = computed(() => ({
  target: panelRef.value,
}));

const activePreset = computed(() => {
  return presets.find((preset) => {
    return shapeRoles.every((role) => {
      const presetValue = preset.values[role.key];
      const currentValue = roleValues[role.key];
      return presetValue.px === currentValue.px && presetValue.full === currentValue.full;
    });
  })?.label;
});

const cssSnippet = computed(() => {
  const lines = shapeRoles.map((role) => `  ${role.token}: ${cssTokenValue(role)};`);
  return `:root {\n${lines.join('\n')}\n}`;
});

function createRoleValues(values: Record<ShapeRoleKey, ShapeRoleValue>) {
  return Object.fromEntries(Object.entries(values).map(([key, value]) => [key, { ...value }])) as Record<
    ShapeRoleKey,
    ShapeRoleValue
  >;
}

function clampRoleValue(role: ShapeRole, value: number) {
  if (!Number.isFinite(value)) {
    return role.min;
  }
  return Math.min(role.max, Math.max(role.min, value));
}

function setRoleValues(values: Record<ShapeRoleKey, ShapeRoleValue>) {
  for (const role of shapeRoles) {
    const value = values[role.key];
    roleValues[role.key].px = clampRoleValue(role, value.px);
    roleValues[role.key].full = role.full ? value.full : false;
  }
}

function applyPreset(preset: ShapePreset) {
  setRoleValues(preset.values);
}

function resetShapeTokens() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(storageKey);
  }
  applyPreset(presets[0]);
}

function updateRoleValue(role: ShapeRole, value: number) {
  roleValues[role.key].px = clampRoleValue(role, value);
  roleValues[role.key].full = false;
}

function onSliderInput(role: ShapeRole, event: Event) {
  const target = event.target;

  if (!(target instanceof HTMLInputElement)) {
    return;
  }

  updateRoleValue(role, target.valueAsNumber);
}

function toggleFull(role: ShapeRole) {
  if (!role.full) {
    return;
  }
  roleValues[role.key].full = !roleValues[role.key].full;
}

function formatRoleValue(role: ShapeRole) {
  const value = roleValues[role.key];
  return value.full ? 'full' : `${value.px}px`;
}

function cssTokenValue(role: ShapeRole) {
  const value = roleValues[role.key];
  return value.full ? '9999px' : `${value.px}px`;
}

function applyShapeTokens() {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;

  for (const role of shapeRoles) {
    root.style.setProperty(role.token, cssTokenValue(role));
  }
}

function persistShapeTokens() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(roleValues));
}

function loadShapeTokens() {
  if (typeof window === 'undefined') {
    return;
  }

  const raw = window.localStorage.getItem(storageKey);

  if (!raw) {
    return;
  }

  try {
    const stored = JSON.parse(raw) as Partial<Record<ShapeRoleKey, Partial<ShapeRoleValue>>>;

    for (const role of shapeRoles) {
      const value = stored[role.key];

      if (!value) {
        continue;
      }

      if (typeof value.px === 'number') {
        roleValues[role.key].px = clampRoleValue(role, value.px);
      }

      roleValues[role.key].full = role.full ? value.full === true : false;
    }
  } catch {
    window.localStorage.removeItem(storageKey);
  }
}

function onPanelToggle() {
  isOpen.value = panelRef.value?.matches(':popover-open') ?? false;
}

function markCopied() {
  copied.value = true;

  if (copyFeedbackTimer !== undefined) {
    window.clearTimeout(copyFeedbackTimer);
  }

  copyFeedbackTimer = window.setTimeout(() => {
    copied.value = false;
    copyFeedbackTimer = undefined;
  }, 1800);
}

async function copyCssSnippet() {
  if (typeof navigator === 'undefined' || !navigator.clipboard) {
    return;
  }

  await navigator.clipboard.writeText(cssSnippet.value);
  markCopied();
}

watch(
  roleValues,
  () => {
    if (!isMounted.value) {
      return;
    }

    applyShapeTokens();
    persistShapeTokens();
  },
  { deep: true },
);

onMounted(() => {
  loadShapeTokens();
  applyShapeTokens();
  isMounted.value = true;
});

onBeforeUnmount(() => {
  if (copyFeedbackTimer !== undefined) {
    window.clearTimeout(copyFeedbackTimer);
  }
});
</script>

<template>
  <div class="shape-token-controls vp-raw">
    <IconButton
      v-dropdown="dropdownBinding"
      color="standard"
      size="small"
      width="default"
      icon="rounded_corner"
      aria-label="Shape tokens"
      aria-haspopup="dialog"
      :aria-controls="panelId"
      :aria-expanded="isOpen ? 'true' : 'false'"
      :data-active="isOpen ? 'true' : undefined"
    />

    <div
      :id="panelId"
      ref="panel"
      popover="auto"
      class="shape-token-controls-panel m3-dropdown"
      role="dialog"
      aria-label="Shape tokens"
      @toggle="onPanelToggle"
    >
      <div class="shape-token-controls-header">
        <h2>Shape</h2>
        <Button color="text" size="small" leading-icon="restart_alt" @click="resetShapeTokens">Reset</Button>
      </div>

      <div class="shape-token-controls-presets" aria-label="Shape presets">
        <Button
          v-for="preset in presets"
          :key="preset.label"
          color="text"
          size="small"
          class="shape-token-controls-preset"
          :data-active="activePreset === preset.label ? 'true' : undefined"
          @click="applyPreset(preset)"
        >
          {{ preset.label }}
        </Button>
      </div>

      <div class="shape-token-controls-list">
        <label v-for="role in shapeRoles" :key="role.key" class="shape-token-controls-row">
          <span class="shape-token-controls-row-header">
            <span>
              <span class="shape-token-controls-label">{{ role.label }}</span>
              <code>{{ role.token }}</code>
            </span>
            <span class="shape-token-controls-value">{{ formatRoleValue(role) }}</span>
          </span>

          <span class="shape-token-controls-affects">{{ role.affects }}</span>

          <span class="shape-token-controls-slider-row">
            <Slider
              :value="roleValues[role.key].px"
              :min="role.min"
              :max="role.max"
              :step="role.step"
              :wheel-step="role.step"
              size="small"
              :value-indicator="false"
              :aria-label="`${role.label} radius`"
              @update:value="updateRoleValue(role, $event)"
              @input="onSliderInput(role, $event)"
            />

            <Button
              v-if="role.full"
              color="text"
              size="small"
              class="shape-token-controls-full"
              :aria-pressed="roleValues[role.key].full ? 'true' : 'false'"
              :data-active="roleValues[role.key].full ? 'true' : undefined"
              @click.prevent="toggleFull(role)"
            >
              Full
            </Button>
          </span>
        </label>
      </div>

      <div class="shape-token-controls-code">
        <div class="shape-token-controls-code-header">
          <span>CSS</span>
          <Button color="text" size="small" :leading-icon="copied ? 'check' : 'content_copy'" @click="copyCssSnippet">
            {{ copied ? 'Copied' : 'Copy' }}
          </Button>
        </div>
        <pre><code>{{ cssSnippet }}</code></pre>
        <span class="shape-token-controls-copy-status" aria-live="polite">{{ copied ? 'CSS copied' : '' }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shape-token-controls {
  display: inline-flex;
}

.shape-token-controls-panel[popover] {
  position: fixed;
  inset: auto;
  position-area: block-end span-inline-end;
  position-try-fallbacks:
    flip-block,
    flip-inline,
    flip-block flip-inline;
  inline-size: min(26rem, calc(100vw - 1.5rem));
  max-block-size: min(42rem, calc(100vh - 1.5rem));
  overflow: auto;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: var(--md-shape-popover);
  padding: 0.875rem;
  background: var(--md-sys-color-surface-container);
  color: var(--md-sys-color-on-surface);
  box-shadow: var(--md-sys-elevation-level3);
}

.shape-token-controls-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-block-end: 0.75rem;
}

.shape-token-controls-header h2 {
  margin: 0;
  font-size: 1rem;
  line-height: 1.4;
}

.shape-token-controls-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-block-end: 0.875rem;
}

.shape-token-controls-preset[data-active='true']:deep(.m3-button),
.shape-token-controls-full[data-active='true']:deep(.m3-button) {
  background: --translucent(var(--md-sys-color-primary), 0.12);
  color: var(--md-sys-color-primary);
}

.shape-token-controls-list {
  display: grid;
  gap: 0.875rem;
}

.shape-token-controls-row {
  display: grid;
  gap: 0.375rem;
  min-inline-size: 0;
}

.shape-token-controls-row-header,
.shape-token-controls-slider-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.shape-token-controls-row-header {
  justify-content: space-between;
}

.shape-token-controls-row-header > span:first-child {
  display: grid;
  gap: 0.125rem;
  min-inline-size: 0;
}

.shape-token-controls-label {
  font-size: 0.8125rem;
  font-weight: 700;
}

.shape-token-controls-row code {
  overflow-wrap: anywhere;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 0.6875rem;
}

.shape-token-controls-value {
  flex: none;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
}

.shape-token-controls-affects {
  color: var(--md-sys-color-on-surface-variant);
  font-size: 0.75rem;
  line-height: 1.35;
}

.shape-token-controls-slider-row :deep(.m3-slider) {
  flex: 1 1 auto;
  min-inline-size: 8rem;
}

.shape-token-controls-full {
  flex: none;
}

.shape-token-controls-code {
  display: grid;
  gap: 0.5rem;
  margin-block-start: 1rem;
  border-block-start: 1px solid var(--md-sys-color-outline-variant);
  padding-block-start: 0.875rem;
}

.shape-token-controls-code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  color: var(--md-sys-color-on-surface);
  font-size: 0.8125rem;
  font-weight: 700;
}

.shape-token-controls-code pre {
  overflow: auto;
  margin: 0;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: var(--md-shape-compact);
  padding: 0.75rem;
  background: var(--md-sys-color-surface-container-lowest);
  color: var(--md-sys-color-on-surface);
  font-size: 0.75rem;
  line-height: 1.5;
}

.shape-token-controls-copy-status {
  overflow: hidden;
  position: absolute;
  inline-size: 1px;
  block-size: 1px;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

@media (max-width: 40rem) {
  .shape-token-controls-panel[popover] {
    inline-size: calc(100vw - 1rem);
    max-block-size: calc(100vh - 1rem);
    padding: 0.75rem;
  }
}
</style>
