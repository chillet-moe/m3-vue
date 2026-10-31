<script setup lang="ts">
import { computed, inject, nextTick, provide, ref, unref, useId, useTemplateRef, watch } from 'vue';
import { useData } from 'vitepress';
import {
  Button,
  ButtonGroup,
  ButtonGroupItem,
  Switch,
  IconButton,
  Slider,
  Select,
  Combobox,
  TextField,
  Popover,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  fieldContextKey,
  provideButtonDefaults,
  iconButtonContextKey,
  provideSliderDefaults,
  rowSizeContextKey,
} from '@/index';
import { useDocsCustomization } from '../customization/state';
import { defaultSettings, fieldGapSettings, iconSettings, typeProperties, typeRoles } from '../customization/catalog';
import { typographyPresets } from '@/theme/presets';
import { customizationCode } from '../customization/code';
import { defaultSourceColor } from '../customization/colors';
import { shapeRoles } from '../customization/shapes';
import { en, type CopyKey } from '../customization/en';
import { zh } from '../customization/zh';

const { lang } = useData();
const t = (key: CopyKey) => (lang.value === 'zh-Hans' ? zh : en)[key];
const customization = useDocsCustomization();
const { state, inheritedDefaults, baseline, resolvedTokens, setToken, setDefault, setPreset, reset, storageError } =
  customization;
// Keep editor dimensions and slider interaction stable; inherit the remaining theme preferences.
provide(rowSizeContextKey, 'small');
const fieldDefaults = inject(fieldContextKey, undefined);
const externalLabels = computed(() => unref(fieldDefaults?.labelBehavior) === 'external');
provide(fieldContextKey, { ...fieldDefaults, size: 'small' });
provideButtonDefaults({ size: 'small' });
provide(iconButtonContextKey, { ...inject(iconButtonContextKey, undefined), size: 'small' });
provideSliderDefaults({ size: 'small', wheel: false, valueIndicator: false });

const open = ref(false);
const section = ref('theme');
const anchor = useTemplateRef<HTMLElement>('anchor');
const panel = useTemplateRef<InstanceType<typeof Popover>>('panel');
const scroll = useTemplateRef<HTMLElement>('scroll');
const panelId = `customization-${useId()}`;
const sections: CopyKey[] = ['theme', 'typography', 'shapes', 'components', 'code'];
const code = computed(() => customizationCode(state, resolvedTokens.value, baseline.value));
const copyStatus = ref<CopyKey>();
async function copyCode(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    copyStatus.value = 'copied';
  } catch {
    copyStatus.value = 'copyFailed';
  }
}
watch(code, () => {
  copyStatus.value = undefined;
});
const panelStyle = computed(() =>
  Object.fromEntries(
    Object.entries(baseline.value).filter(
      ([key]) => key.startsWith('--md-sys-typescale-') || key.startsWith('--md-ref-typeface-'),
    ),
  ),
);
const density = computed(() => resolvedTokens.value['--md-density'] ?? '0');
function updateDensity(value: string) {
  if (value.trim() && Number.isFinite(Number(value))) state.theme.density = Number(value);
  else if (!value.trim()) delete state.theme.density;
}
const currentRole = ref('body-large');
const roleOptions = typeRoles.flatMap((role) => [role, `emphasized-${role}`]).map((value) => ({ value, label: value }));
const typeToken = (property: string) => `--md-sys-typescale-${currentRole.value}-${property}`;
const selectedTypography = computed(() =>
  (['default', 'compact'] as const).find((preset) =>
    Object.entries(typographyPresets[preset]).every(([name, value]) => resolvedTokens.value[name] === value),
  ),
);
const selectedTheme = computed(() => state.theme.preset);

function selectTheme(value: unknown) {
  if (value === 'default' || value === 'compact') setPreset(value);
}
function selectTypography(value: unknown) {
  if (value === 'default' || value === 'compact') customization.setTypography(value);
}
const previewStyle = computed(() => {
  const resolve = (name: string): string => {
    const value = resolvedTokens.value[name] ?? baseline.value[name] ?? '';
    // The compact preset aliases emphasized roles to their ordinary counterparts.
    const alias = /^var\((--md-sys-typescale-[\w-]+)\)$/.exec(value);
    return alias && alias[1] !== name ? (resolvedTokens.value[alias[1]!] ?? baseline.value[alias[1]!] ?? '') : value;
  };
  return {
    fontSize: resolve(typeToken('size')),
    lineHeight: resolve(typeToken('line-height')),
    fontWeight: resolve(typeToken('weight')),
    letterSpacing: resolve(typeToken('tracking')),
    fontFamily: resolve(typeToken('font')),
  };
});
function updateSourceColor(event: Event) {
  const input = event.target;
  if (input instanceof HTMLInputElement) customization.setSourceColor(input.value);
}
function previewShape(token: string, event: Event) {
  const input = event.target;
  if (!(input instanceof HTMLInputElement) || !Number.isFinite(input.valueAsNumber)) return;
  setToken(token, `${input.valueAsNumber}px`);
}
function shapeNumber(token: string) {
  const value = state.tokens[token] ?? baseline.value[token] ?? '0';
  return parseFloat(value) * (value.endsWith('rem') ? 16 : 1) || 0;
}
watch(section, () => {
  if (scroll.value) scroll.value.scrollTop = 0;
});
watch(open, async (value) => {
  if (!value) return;
  await nextTick();
  panel.value?.popoverEl?.querySelector<HTMLButtonElement>('button[autofocus]')?.focus({ preventScroll: true });
});
</script>

<template>
  <span ref="anchor" class="customization-trigger vp-raw">
    <IconButton
      icon="tune"
      variant="standard"
      size="small"
      :aria-label="t('customize')"
      aria-haspopup="dialog"
      :aria-controls="panelId"
      :aria-expanded="open"
      @click="open = !open"
    />
  </span>
  <Popover
    ref="panel"
    :id="panelId"
    v-model:open="open"
    :anchor-element="anchor ?? undefined"
    placement="bottom-end"
    role="dialog"
    :aria-label="t('customize')"
    class="customization-panel vp-raw"
    :style="panelStyle"
  >
    <div class="customization-shell">
      <header class="customization-header">
        <h2>{{ t('customize') }}</h2>
        <IconButton icon="close" variant="standard" :aria-label="t('close')" autofocus @click="open = false" />
      </header>
      <Tabs v-model="section" variant="line" size="extra-small" class="customization-tabs">
        <TabList class="customization-navigation"
          ><Tab v-for="item in sections" :key="item" :value="item">{{ t(item) }}</Tab></TabList
        >
        <div ref="scroll" class="customization-scroll">
          <TabPanel value="theme" class="customization-section customization-form">
            <ButtonGroup
              type="connected"
              variant="outlined"
              :name="`${panelId}-theme`"
              :aria-label="t('themePreset')"
              :model-value="selectedTheme"
              @update:model-value="selectTheme"
            >
              <ButtonGroupItem value="default">{{ t('standard') }}</ButtonGroupItem>
              <ButtonGroupItem value="compact">{{ t('compact') }}</ButtonGroupItem>
            </ButtonGroup>
            <div class="customization-row">
              <label class="customization-color">
                <span>{{ t('themeColor') }}</span>
                <input
                  type="color"
                  :value="state.theme.sourceColor ?? defaultSourceColor"
                  @change="updateSourceColor"
                />
              </label>
              <IconButton
                icon="restart_alt"
                :aria-label="t('resetThemeColor')"
                :disabled="!state.theme.sourceColor"
                @click="customization.setSourceColor('')"
              />
            </div>
            <div class="customization-labeled-field">
              <label v-if="externalLabels" :for="`${panelId}-field-1`">{{ t('density') }}</label>
              <TextField
                :id="`${panelId}-field-1`"
                :model-value="density"
                type="number"
                :label="t('density')"
                :supporting-text="t('densityHint')"
                @update:model-value="updateDensity"
              />
            </div>
            <div class="customization-fields">
              <div v-for="setting in fieldGapSettings" :key="setting.token" class="customization-labeled-field">
                <label v-if="externalLabels" :for="`${panelId}-field-2-${setting.token}`">{{ t(setting.key) }}</label>
                <TextField
                  :id="`${panelId}-field-2-${setting.token}`"
                  :label="t(setting.key)"
                  :model-value="state.tokens[setting.token] ?? ''"
                  :placeholder="baseline[setting.token]"
                  @update:model-value="setToken(setting.token, $event)"
                />
              </div>
            </div>
            <p class="customization-code-empty">{{ t('fieldGapHint') }}</p>
            <div class="customization-fields">
              <div v-for="setting in iconSettings" :key="setting.token" class="customization-labeled-field">
                <label v-if="externalLabels" :for="`${panelId}-field-3-${setting.token}`">{{ t(setting.key) }}</label>
                <TextField
                  :id="`${panelId}-field-3-${setting.token}`"
                  type="number"
                  step="0.05"
                  :min="String(setting.min)"
                  :max="String(setting.max)"
                  :label="t(setting.key)"
                  :model-value="state.tokens[setting.token] ?? ''"
                  :placeholder="setting.fallback"
                  @update:model-value="setToken(setting.token, $event)"
                />
              </div>
            </div>
            <div v-for="name in ['appearance']" :key="name" class="customization-labeled-field">
              <label v-if="externalLabels" :for="`${panelId}-field-4-${name}`">{{ t(name as CopyKey) }}</label>
              <Select
                :id="`${panelId}-field-4-${name}`"
                :label="t(name as CopyKey)"
                :model-value="state.defaults[name] ?? ''"
                :options="[
                  { value: '', label: t('inherited') },
                  ...defaultSettings
                    .find((setting) => setting.key === name)!
                    .options.map((value) => ({ value, label: value })),
                ]"
                @update:model-value="setDefault(name, String($event ?? ''))"
              />
            </div>
          </TabPanel>
          <TabPanel value="typography" class="customization-section customization-form">
            <ButtonGroup
              type="connected"
              variant="outlined"
              :name="`${panelId}-typography`"
              :aria-label="t('typography')"
              :model-value="selectedTypography"
              @update:model-value="selectTypography"
            >
              <ButtonGroupItem value="default">{{ t('standard') }}</ButtonGroupItem>
              <ButtonGroupItem value="compact">{{ t('compact') }}</ButtonGroupItem>
            </ButtonGroup>
            <div class="customization-labeled-field">
              <label v-if="externalLabels" :for="`${panelId}-field-5`">{{ t('role') }}</label>
              <Combobox :id="`${panelId}-field-5`" v-model="currentRole" :label="t('role')" :options="roleOptions" />
            </div>
            <div class="customization-type-preview" :style="previewStyle">{{ t('preview') }}</div>
            <div class="customization-fields">
              <div v-for="property in typeProperties" :key="property" class="customization-labeled-field">
                <label v-if="externalLabels" :for="`${panelId}-field-6-${property}`">{{ t(property) }}</label>
                <TextField
                  :id="`${panelId}-field-6-${property}`"
                  :label="t(property)"
                  :model-value="state.tokens[typeToken(property)] ?? ''"
                  :placeholder="resolvedTokens[typeToken(property)]"
                  @update:model-value="setToken(typeToken(property), $event)"
                />
              </div>
            </div>
          </TabPanel>
          <TabPanel value="shapes" class="customization-section">
            <div class="customization-labeled-field">
              <label v-if="externalLabels" :for="`${panelId}-field-7`">{{ t('shape') }}</label>
              <Select
                :id="`${panelId}-field-7`"
                :label="t('shape')"
                :model-value="state.defaults.shape ?? ''"
                :options="[
                  { value: '', label: t('inherited') },
                  ...defaultSettings
                    .find((setting) => setting.key === 'shape')!
                    .options.map((value) => ({ value, label: value })),
                ]"
                @update:model-value="setDefault('shape', String($event ?? ''))"
              />
            </div>
            <template v-if="state.defaults.shape !== 'minimal' && state.defaults.shape !== 'sharp'">
              <div v-for="role in shapeRoles" :key="role.key" class="customization-shape">
                <div class="customization-row">
                  <span>{{ t(role.key) }}</span
                  ><output>{{
                    role.full && shapeNumber(role.token) > role.max
                      ? t('full')
                      : (state.tokens[role.token] ?? baseline[role.token])
                  }}</output>
                </div>
                <div class="customization-row">
                  <Slider
                    class="customization-slider"
                    :value="Math.min(role.max, shapeNumber(role.token))"
                    :min="role.min"
                    :max="role.max"
                    :step="1"
                    :aria-label="`${t(role.key)} ${t('radius')}`"
                    @update:value="setToken(role.token, `${$event}px`)"
                    @input="previewShape(role.token, $event)"
                  />
                  <Switch
                    v-if="role.full"
                    :checked="shapeNumber(role.token) > role.max"
                    @update:checked="setToken(role.token, $event ? '9999px' : `${role.max}px`)"
                    >{{ t('full') }}</Switch
                  >
                  <IconButton
                    icon="restart_alt"
                    :aria-label="`${t('remove')}: ${t(role.key)}`"
                    @click="setToken(role.token, '')"
                  />
                </div>
              </div>
            </template>
          </TabPanel>
          <TabPanel value="components" class="customization-section customization-form">
            <div
              v-for="setting in defaultSettings.filter((item) => item.key !== 'appearance' && item.key !== 'shape')"
              :key="setting.key"
              class="customization-labeled-field"
            >
              <label v-if="externalLabels" :for="`${panelId}-field-8-${setting.key}`">{{ t(setting.key) }}</label>
              <Select
                :id="`${panelId}-field-8-${setting.key}`"
                :label="t(setting.key)"
                :model-value="state.defaults[setting.key] ?? ''"
                :options="[
                  {
                    value: '',
                    label: inheritedDefaults[setting.key]
                      ? `${t('inherited')} (${inheritedDefaults[setting.key]})`
                      : t('inherited'),
                  },
                  ...setting.options.map((value) => ({ value, label: value })),
                ]"
                @update:model-value="setDefault(setting.key, String($event ?? ''))"
              />
            </div>
          </TabPanel>
          <TabPanel value="code" class="customization-section">
            <section
              v-for="file in [
                { name: 'main.ts', content: code.setup },
                { name: 'customization.css', content: code.css },
              ]"
              :key="file.name"
              class="customization-code-file"
            >
              <div class="customization-row">
                <h3 class="customization-code-title">{{ file.name }}</h3>
                <Button
                  v-if="file.content"
                  :aria-label="t('copy')"
                  leading-icon="content_copy"
                  @click="copyCode(file.content)"
                  >{{ t('copy') }}</Button
                >
              </div>
              <pre v-if="file.content" class="customization-code"><code>{{ file.content }}</code></pre>
              <p v-else class="customization-code-empty">{{ t('noCss') }}</p>
            </section>
            <p v-if="copyStatus" role="status" class="customization-code-empty">{{ t(copyStatus) }}</p>
          </TabPanel>
          <p v-if="storageError" role="status" class="customization-error">{{ t('storageError') }}</p>
        </div>
      </Tabs>
      <footer class="customization-footer">
        <Button variant="text" leading-icon="restart_alt" @click="reset">{{ t('reset') }}</Button>
      </footer>
    </div>
  </Popover>
</template>

<style scoped>
.customization-labeled-field {
  display: grid;
  gap: 0.375rem;
  min-inline-size: 0;
  font: var(--md-sys-typescale-body-small);
}

.customization-trigger {
  display: inline-flex;
}
.customization-panel {
  --md-density: 0;
  --md-popover-padding: 0;
  --md-popover-max-width: 38rem;
  --md-popover-max-height: calc(100dvb - 2rem);
  inline-size: min(38rem, calc(100vw - 2rem));
}
.customization-shell {
  display: flex;
  flex-direction: column;
  block-size: min(42rem, calc(100dvb - 7rem));
  min-block-size: 0;
}
.customization-header,
.customization-footer {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  gap: 0.5rem;
}
.customization-header h2 {
  font: 600 1.125rem/1.5 sans-serif;
  margin: 0;
}
.customization-footer {
  border-block-start: 1px solid var(--md-sys-color-outline-variant);
}
.customization-tabs {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-block-size: 0;
}
.customization-navigation {
  flex: none;
  padding-inline: 1rem;
}
.customization-scroll {
  overflow: auto;
  overscroll-behavior: contain;
  min-block-size: 0;
  flex: 1;
}
.customization-section {
  display: grid;
  gap: 1.25rem;
  padding: 1.5rem;
}
.customization-form {
  row-gap: var(--md-field-row-gap);
}
.customization-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}
.customization-color {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.customization-color input {
  inline-size: 3rem;
  block-size: 2.5rem;
  padding: 0.125rem;
  border: 1px solid var(--md-sys-color-outline);
  border-radius: 0.25rem;
  background: var(--md-sys-color-surface);
  cursor: pointer;
}
.customization-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  row-gap: var(--md-field-row-gap);
  column-gap: var(--md-field-column-gap);
}
.customization-type-preview {
  padding: 1rem;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: var(--docs-shape-surface);
  overflow-wrap: anywhere;
}
.customization-code-file {
  min-inline-size: 0;
}
.customization-code-title {
  margin: 0;
  font: inherit;
  font-weight: 600;
}
.customization-code {
  margin: 0;
  padding: 1rem;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font: 0.8125rem/1.5 monospace;
  background: var(--md-sys-color-surface-container);
  border-radius: var(--docs-shape-surface);
  user-select: text;
}
.customization-code-empty {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
}
.customization-shape {
  display: grid;
  gap: 0.25rem;
}
.customization-slider {
  flex: 1;
  min-inline-size: 0;
}
.customization-row output {
  color: var(--md-sys-color-on-surface-variant);
  font-variant-numeric: tabular-nums;
}
.customization-error {
  padding: 0 1.5rem;
  color: var(--md-sys-color-error);
}
@media (max-width: 40rem) {
  .customization-section {
    padding: 1rem;
  }
  .customization-navigation {
    padding-inline: 0;
  }
  .customization-footer {
    flex-wrap: wrap;
  }
}
</style>
