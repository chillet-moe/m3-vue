<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import {
  Button,
  ButtonGroup,
  ButtonGroupItem,
  Card,
  Chip,
  FloatingActionButton,
  IconButton,
  LinearProgressIndicator,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  TextField,
} from '@/index';

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
  description: string;
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

const shapeRoles: ShapeRole[] = [
  {
    key: 'action',
    token: '--md-shape-action',
    label: 'Action',
    description: 'Button, IconButton, ButtonGroup',
    min: 0,
    max: 32,
    step: 1,
    full: true,
  },
  {
    key: 'field',
    token: '--md-shape-field',
    label: 'Field',
    description: 'Rounded TextField',
    min: 0,
    max: 32,
    step: 1,
  },
  {
    key: 'fieldSquare',
    token: '--md-shape-field-square',
    label: 'Field square',
    description: 'Square TextField, InputOtp',
    min: 0,
    max: 32,
    step: 1,
  },
  {
    key: 'chip',
    token: '--md-shape-chip',
    label: 'Chip',
    description: 'Chip, small active containers',
    min: 0,
    max: 28,
    step: 1,
  },
  {
    key: 'card',
    token: '--md-shape-card',
    label: 'Card',
    description: 'Card, rich tooltip, tonal tabs',
    min: 0,
    max: 32,
    step: 1,
  },
  {
    key: 'popover',
    token: '--md-shape-popover',
    label: 'Popover',
    description: 'Menu and detached surfaces',
    min: 0,
    max: 32,
    step: 1,
  },
  {
    key: 'compact',
    token: '--md-shape-compact',
    label: 'Compact',
    description: 'Snackbar, plain tooltip',
    min: 0,
    max: 20,
    step: 1,
  },
  {
    key: 'overlay',
    token: '--md-shape-overlay',
    label: 'Overlay',
    description: 'Dialog, picker, modal surfaces',
    min: 0,
    max: 40,
    step: 1,
  },
  {
    key: 'indicator',
    token: '--md-shape-indicator',
    label: 'Indicator',
    description: 'Progress and selection indicators',
    min: 0,
    max: 32,
    step: 1,
    full: true,
  },
  {
    key: 'fab',
    token: '--md-shape-fab',
    label: 'FAB',
    description: 'All FloatingActionButton sizes',
    min: 0,
    max: 32,
    step: 1,
  },
];

const presets: ShapePreset[] = [
  {
    label: 'Material',
    values: {
      action: { full: true, px: 32 },
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
      action: { full: true, px: 32 },
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

const roleValues = reactive<Record<ShapeRoleKey, ShapeRoleValue>>(
  Object.fromEntries(Object.entries(presets[0].values).map(([key, value]) => [key, { ...value }])) as Record<
    ShapeRoleKey,
    ShapeRoleValue
  >,
);

const activePreset = ref(presets[0].label);
const textValue = ref('Rounded field');
const selectedChip = ref(true);
const tabValue = ref('shape');
const buttonGroupValue = ref('one');

function applyPreset(preset: ShapePreset) {
  activePreset.value = preset.label;

  for (const [key, value] of Object.entries(preset.values) as Array<[ShapeRoleKey, ShapeRoleValue]>) {
    roleValues[key].px = value.px;
    roleValues[key].full = value.full;
  }
}

function updateRoleValue(role: ShapeRole, value: string) {
  roleValues[role.key].px = Number(value);
  roleValues[role.key].full = false;
  activePreset.value = 'Custom';
}

function toggleFull(role: ShapeRole) {
  roleValues[role.key].full = !roleValues[role.key].full;
  activePreset.value = 'Custom';
}

function formatRoleValue(role: ShapeRole) {
  const value = roleValues[role.key];
  return value.full ? 'full' : `${value.px}px`;
}

function cssTokenValue(role: ShapeRole) {
  const value = roleValues[role.key];
  return value.full ? '9999px' : `${value.px}px`;
}

const previewStyle = computed<Record<string, string>>(() => {
  return Object.fromEntries(shapeRoles.map((role) => [role.token, cssTokenValue(role)]));
});

const cssPreview = computed(() => {
  const lines = shapeRoles.map((role) => `  ${role.token}: ${cssTokenValue(role)};`);
  return `:root {\n${lines.join('\n')}\n}`;
});
</script>

<template>
  <section class="vp-raw shape-token-preview">
    <div class="shape-token-preview-header">
      <div>
        <h3>Shape token playground</h3>
        <p>Adjust semantic shape tokens and preview how related components change together.</p>
      </div>

      <div class="shape-token-preview-presets" aria-label="Shape presets">
        <button
          v-for="preset in presets"
          :key="preset.label"
          type="button"
          class="shape-token-preview-preset"
          :data-active="activePreset === preset.label ? 'true' : undefined"
          @click="applyPreset(preset)"
        >
          {{ preset.label }}
        </button>
      </div>
    </div>

    <div class="shape-token-preview-layout">
      <div class="shape-token-preview-controls">
        <label v-for="role in shapeRoles" :key="role.key" class="shape-token-preview-control">
          <span class="shape-token-preview-control-header">
            <span>
              <span class="shape-token-preview-control-label">{{ role.label }}</span>
              <code>{{ role.token }}</code>
            </span>
            <span class="shape-token-preview-control-value">{{ formatRoleValue(role) }}</span>
          </span>

          <span class="shape-token-preview-control-description">{{ role.description }}</span>

          <span class="shape-token-preview-control-row">
            <input
              type="range"
              :min="role.min"
              :max="role.max"
              :step="role.step"
              :value="roleValues[role.key].px"
              :aria-label="`${role.label} radius`"
              @input="updateRoleValue(role, ($event.target as HTMLInputElement).value)"
            />

            <button
              v-if="role.full"
              type="button"
              class="shape-token-preview-full"
              :aria-pressed="roleValues[role.key].full ? 'true' : 'false'"
              :data-active="roleValues[role.key].full ? 'true' : undefined"
              @click.prevent="toggleFull(role)"
            >
              Full
            </button>
          </span>
        </label>
      </div>

      <div class="shape-token-preview-stage" :style="previewStyle">
        <div class="shape-token-preview-actions">
          <Button color="filled" leading-icon="favorite">Button</Button>
          <IconButton icon="favorite" aria-label="Favorite" />
          <ButtonGroup v-model="buttonGroupValue" type="connected" name="shape-token-preview-button-group">
            <ButtonGroupItem value="one">One</ButtonGroupItem>
            <ButtonGroupItem value="two">Two</ButtonGroupItem>
            <ButtonGroupItem value="three">Three</ButtonGroupItem>
          </ButtonGroup>
        </div>

        <div class="shape-token-preview-grid">
          <Card class="shape-token-preview-card" color="filled">
            <span class="shape-token-preview-eyebrow">Card</span>
            <strong>Container shape</strong>
            <span>Uses <code>--md-shape-card</code>.</span>
          </Card>

          <div class="shape-token-preview-fields">
            <TextField v-model="textValue" label="Rounded field" shape="rounded" />
            <TextField model-value="Square field" label="Square field" shape="square" readonly />
          </div>

          <div class="shape-token-preview-stack">
            <div class="shape-token-preview-chip-row">
              <Chip v-model="selectedChip" variant="filter">Selected chip</Chip>
              <Chip variant="assist">Assist chip</Chip>
            </div>
            <LinearProgressIndicator :value="0.68" aria-label="Shape preview progress" />
          </div>

          <div class="shape-token-preview-popover">
            <span class="shape-token-preview-eyebrow">Popover</span>
            <button type="button">Menu item</button>
            <button type="button">Compact action</button>
          </div>

          <div class="shape-token-preview-overlay">
            <span class="shape-token-preview-eyebrow">Overlay</span>
            <strong>Dialog surface</strong>
            <span>Large modal surfaces share <code>--md-shape-overlay</code>.</span>
          </div>

          <div class="shape-token-preview-tab-wrap">
            <Tabs v-model="tabValue">
              <TabList>
                <Tab value="shape">Shape</Tab>
                <Tab value="tokens">Tokens</Tab>
              </TabList>
              <TabPanel value="shape">Tonal tabs use card and chip semantic shapes.</TabPanel>
              <TabPanel value="tokens">Use component tokens only for local exceptions.</TabPanel>
            </Tabs>
          </div>
        </div>

        <div class="shape-token-preview-fab-row">
          <FloatingActionButton icon="add" aria-label="Add" />
          <FloatingActionButton size="medium" icon="edit" aria-label="Edit" />
          <FloatingActionButton size="large" icon="send" aria-label="Send" />
        </div>
      </div>
    </div>

    <pre class="shape-token-preview-code"><code>{{ cssPreview }}</code></pre>
  </section>
</template>

<style scoped>
.shape-token-preview {
  display: grid;
  gap: 1rem;
  margin-block: 1.5rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: var(--md-shape-card);
  padding: 1rem;
  background: var(--vp-c-bg-soft);
}

.shape-token-preview-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.shape-token-preview-header h3 {
  margin: 0;
  color: var(--vp-c-text-1);
  font-size: 1.0625rem;
  line-height: 1.4;
}

.shape-token-preview-header p {
  margin-block: 0.25rem 0;
  color: var(--vp-c-text-2);
  font-size: 0.875rem;
  line-height: 1.5;
}

.shape-token-preview-presets {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.5rem;
}

.shape-token-preview-preset,
.shape-token-preview-full,
.shape-token-preview-popover button {
  border: 1px solid var(--vp-c-divider);
  border-radius: var(--md-shape-action);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  font: inherit;
  cursor: pointer;
  transition:
    border-color 160ms ease,
    background-color 160ms ease,
    color 160ms ease;
}

.shape-token-preview-preset {
  min-block-size: 2rem;
  padding-inline: 0.75rem;
}

.shape-token-preview-preset[data-active='true'],
.shape-token-preview-full[data-active='true'] {
  border-color: --translucent(var(--vp-c-brand-1), 0.45);
  background: --translucent(var(--vp-c-brand-1), 0.12);
  color: var(--vp-c-brand-1);
}

.shape-token-preview-layout {
  display: grid;
  grid-template-columns: minmax(16rem, 0.82fr) minmax(0, 1.18fr);
  gap: 1rem;
}

.shape-token-preview-controls {
  display: grid;
  align-content: start;
  gap: 0.75rem;
}

.shape-token-preview-control {
  display: grid;
  gap: 0.375rem;
  min-inline-size: 0;
}

.shape-token-preview-control-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
}

.shape-token-preview-control-header > span:first-child {
  display: grid;
  gap: 0.125rem;
  min-inline-size: 0;
}

.shape-token-preview-control-label {
  color: var(--vp-c-text-1);
  font-size: 0.875rem;
  font-weight: 600;
}

.shape-token-preview-control code,
.shape-token-preview-code code,
.shape-token-preview-card code,
.shape-token-preview-overlay code {
  font-size: 0.75rem;
}

.shape-token-preview-control code {
  overflow-wrap: anywhere;
  color: var(--vp-c-text-3);
}

.shape-token-preview-control-value {
  flex: none;
  color: var(--vp-c-text-2);
  font-size: 0.8125rem;
  font-variant-numeric: tabular-nums;
}

.shape-token-preview-control-description {
  color: var(--vp-c-text-3);
  font-size: 0.75rem;
  line-height: 1.35;
}

.shape-token-preview-control-row {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.shape-token-preview-control input[type='range'] {
  inline-size: 100%;
  min-inline-size: 0;
  accent-color: var(--vp-c-brand-1);
}

.shape-token-preview-full {
  min-block-size: 1.75rem;
  padding-inline: 0.625rem;
  font-size: 0.75rem;
}

.shape-token-preview-stage {
  display: grid;
  align-content: start;
  gap: 1rem;
  border: 1px solid --translucent(var(--vp-c-divider), 0.9);
  border-radius: var(--md-shape-card);
  padding: 1rem;
  background: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
}

.shape-token-preview-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}

.shape-token-preview-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.875rem;
}

.shape-token-preview-card,
.shape-token-preview-overlay,
.shape-token-preview-popover,
.shape-token-preview-stack,
.shape-token-preview-fields,
.shape-token-preview-tab-wrap {
  min-inline-size: 0;
}

.shape-token-preview-card {
  display: grid;
  gap: 0.375rem;
  min-block-size: 9.5rem;
  padding: 1rem;
}

.shape-token-preview-card strong,
.shape-token-preview-overlay strong {
  color: var(--md-sys-color-on-surface);
}

.shape-token-preview-card span,
.shape-token-preview-overlay span {
  color: var(--md-sys-color-on-surface-variant);
  font-size: 0.8125rem;
  line-height: 1.45;
}

.shape-token-preview-eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.6875rem;
  font-weight: 700;
}

.shape-token-preview-fields,
.shape-token-preview-stack,
.shape-token-preview-popover,
.shape-token-preview-overlay {
  display: grid;
  align-content: start;
  gap: 0.75rem;
}

.shape-token-preview-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.shape-token-preview-popover {
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: var(--md-shape-popover);
  padding: 0.5rem;
  background: var(--md-sys-color-surface-container);
  box-shadow: var(--md-sys-elevation-level2);
}

.shape-token-preview-popover button {
  display: flex;
  align-items: center;
  min-block-size: 2.25rem;
  border: 0;
  border-radius: var(--md-shape-popover-item);
  padding-inline: 0.75rem;
  background: transparent;
  color: var(--md-sys-color-on-surface);
  text-align: start;
}

.shape-token-preview-popover button:first-of-type {
  background: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
}

.shape-token-preview-overlay {
  border-radius: var(--md-shape-overlay);
  padding: 1rem;
  background: var(--md-sys-color-surface-container-high);
  box-shadow: var(--md-sys-elevation-level3);
}

.shape-token-preview-tab-wrap {
  grid-column: 1 / -1;
}

.shape-token-preview-fab-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
}

.shape-token-preview-code {
  overflow: auto;
  margin: 0;
  border: 1px solid --translucent(var(--vp-c-divider), 0.9);
  border-radius: var(--md-shape-compact);
  padding: 0.875rem;
  background: var(--vp-code-block-bg);
  color: var(--vp-c-text-1);
  line-height: 1.6;
}

@media (max-width: 56rem) {
  .shape-token-preview-header,
  .shape-token-preview-layout {
    grid-template-columns: 1fr;
  }

  .shape-token-preview-header {
    display: grid;
  }

  .shape-token-preview-presets {
    justify-content: flex-start;
  }
}

@media (max-width: 40rem) {
  .shape-token-preview {
    padding: 0.875rem;
  }

  .shape-token-preview-grid {
    grid-template-columns: 1fr;
  }
}
</style>
