import { switchSizeContextKey, type SwitchSize } from '@/components/Switch';
import { computed, inject, onMounted, onScopeDispose, provide, reactive, ref, watch, type InjectionKey } from 'vue';
import {
  appearanceContextKey,
  provideShape,
  type M3Shape,
  rowSizeContextKey,
  type RowSize,
  fieldContextKey,
  buttonContextKey,
  iconButtonContextKey,
  listItemContextKey,
  sliderContextKey,
  menuDefaultsContextKey,
  datePickerContextKey,
  timePickerContextKey,
} from '@/index';
import { defaultSettings, tokenNames } from './catalog';
import { themePresets, typographyPresets, type Preset } from '@/theme/presets';

import { colorTokens, isSourceColor } from './colors';

const storageKey = 'm3-vue-docs-theme';
const key: InjectionKey<ReturnType<typeof provideDocsCustomization>> = Symbol('DocsCustomization');

/** One owner per documentation layout; no process-global state during SSR. */
export function provideDocsCustomization() {
  const state = reactive({
    theme: { preset: 'default' } as { preset: Preset; typography?: Preset; density?: number; sourceColor?: string },
    tokens: {} as Record<string, string>,
    defaults: {} as Record<string, string>,
  });
  const paletteTokens = computed(() => (state.theme.sourceColor ? colorTokens(state.theme.sourceColor) : {}));
  const resolvedTokens = computed<Record<string, string>>(() => {
    const preset = themePresets[state.theme.preset];
    return {
      ...typographyPresets[state.theme.typography ?? preset.typography],
      '--md-density': String(state.theme.density ?? preset.density),
      ...paletteTokens.value,
      ...state.tokens,
    };
  });
  const appliedTokens = computed<Record<string, string>>(() => {
    // Markdown and VitePress search are not Vue library components. Keep their shape adapter here.
    const minimal = state.defaults.shape === 'minimal';
    const sharp = state.defaults.shape === 'sharp';
    return {
      ...resolvedTokens.value,
      '--docs-shape-surface': sharp ? '0px' : minimal ? '0.25rem' : 'var(--md-shape-card)',
      '--docs-shape-overlay': sharp ? '0px' : minimal ? '0.375rem' : 'var(--md-shape-overlay)',
      '--docs-shape-control': sharp
        ? '0px'
        : minimal
          ? '0.1875rem'
          : state.defaults.shape === 'square'
            ? 'var(--md-shape-field-square)'
            : 'var(--md-shape-field)',
      '--docs-shape-compact': sharp ? '0px' : minimal ? '0.125rem' : 'var(--md-shape-compact)',
    };
  });
  const clearTypography = () => {
    for (const name of Object.keys(state.tokens)) if (name in typographyPresets.default) delete state.tokens[name];
  };
  const setPreset = (preset: Preset) => {
    state.theme = { preset, sourceColor: state.theme.sourceColor };
    clearTypography();
  };
  const setTypography = (typography: Preset) => {
    state.theme.typography = typography;
    clearTypography();
  };
  const baseline = ref<Record<string, string>>({});
  const storageError = ref(false);
  const choice = <T>(name: string) => computed(() => state.defaults[name] as T | undefined);
  const boolean = (name: string) =>
    computed(() => (state.defaults[name] === undefined ? undefined : state.defaults[name] === 'true'));
  provideShape(choice<M3Shape>('shape'));
  provide(switchSizeContextKey, choice<SwitchSize>('switchSize'));
  provide(rowSizeContextKey, choice<RowSize>('rowSize'));
  provide(appearanceContextKey, { appearance: choice<'standard' | 'expressive'>('appearance') });
  provide(fieldContextKey, { size: choice<'extra-small' | 'small' | 'medium'>('fieldSize') });
  provide(buttonContextKey, {
    size: choice<'extra-small' | 'small' | 'medium' | 'large' | 'extra-large'>('buttonSize'),
    pressShapeMorph: boolean('pressShapeMorph'),
  });
  provide(iconButtonContextKey, {
    size: choice<'extra-small' | 'small' | 'medium' | 'large' | 'extra-large'>('iconButtonSize'),
  });
  provide(listItemContextKey, {
    size: choice<'extra-small' | 'small' | 'medium' | 'large' | 'extra-large'>('listSize'),
    appearance: choice<'standard' | 'expressive'>('listAppearance'),
  });
  provide(sliderContextKey, {
    size: choice<'extra-small' | 'small' | 'medium' | 'large' | 'extra-large'>('sliderSize'),
    appearance: choice<'standard' | 'expressive'>('sliderAppearance'),
    wheel: boolean('sliderWheel'),
    valueIndicator: boolean('valueIndicator'),
  });
  provide(menuDefaultsContextKey, { color: choice<'standard' | 'vibrant'>('menuColor') });
  provide(datePickerContextKey, {
    firstDayOfWeek: computed(() =>
      state.defaults.firstDayOfWeek === undefined
        ? undefined
        : (Number(state.defaults.firstDayOfWeek) as 0 | 1 | 2 | 3 | 4 | 5 | 6),
    ),
  });
  provide(timePickerContextKey, {
    format: choice<'12h' | '24h'>('timeFormat'),
    inputMode: choice<'clock' | 'keyboard'>('timeInputMode'),
  });

  const setSourceColor = (value: string) => {
    if (!value) delete state.theme.sourceColor;
    else if (isSourceColor(value)) state.theme.sourceColor = value.toLowerCase();
  };
  const setToken = (name: string, value: string) => {
    if (!tokenNames.has(name)) return;
    if (value.trim()) state.tokens[name] = value.trim();
    else delete state.tokens[name];
  };
  const setDefault = (name: string, value: string) => {
    const setting = defaultSettings.find((item) => item.key === name);
    if (!setting) return;
    if (setting.options.includes(value)) state.defaults[name] = value;
    else delete state.defaults[name];
  };
  const reset = () => {
    state.theme = { preset: 'default' };
    state.tokens = {};
    state.defaults = {};
  };
  onMounted(() => {
    const root = document.documentElement;
    const original = new Map<string, { value: string; priority: string }>();
    const computedStyle = getComputedStyle(root);
    baseline.value = Object.fromEntries(
      [...tokenNames].map((name) => [name, computedStyle.getPropertyValue(name).trim()]),
    );
    try {
      const raw = localStorage.getItem(storageKey);
      const saved = raw ? JSON.parse(raw) : undefined;
      if (saved && typeof saved === 'object') {
        if (saved.theme?.preset === 'default' || saved.theme?.preset === 'compact')
          state.theme.preset = saved.theme.preset;
        if (saved.theme?.typography === 'default' || saved.theme?.typography === 'compact')
          state.theme.typography = saved.theme.typography;
        if (typeof saved.theme?.density === 'number' && Number.isFinite(saved.theme.density))
          state.theme.density = saved.theme.density;
        if (isSourceColor(saved.theme?.sourceColor)) setSourceColor(saved.theme.sourceColor);
        if (saved.tokens && typeof saved.tokens === 'object')
          for (const [name, value] of Object.entries(saved.tokens))
            if (typeof value === 'string') setToken(name, value);
        if (saved.defaults && typeof saved.defaults === 'object')
          for (const [name, value] of Object.entries(saved.defaults))
            if (typeof value === 'string') setDefault(name, value);
      }
    } catch {
      storageError.value = true;
    }
    const apply = () => {
      for (const [name, previous] of original)
        if (!(name in appliedTokens.value)) {
          if (previous.value) root.style.setProperty(name, previous.value, previous.priority);
          else root.style.removeProperty(name);
          original.delete(name);
        }
      for (const [name, value] of Object.entries(appliedTokens.value)) {
        if (!original.has(name))
          original.set(name, {
            value: root.style.getPropertyValue(name),
            priority: root.style.getPropertyPriority(name),
          });
        if (root.style.getPropertyValue(name) !== value) root.style.setProperty(name, value);
      }
    };
    apply();
    const stop = watch(
      state,
      () => {
        apply();
        try {
          localStorage.setItem(storageKey, JSON.stringify(state));
          storageError.value = false;
        } catch {
          storageError.value = true;
        }
      },
      { deep: true },
    );
    cleanup = () => {
      stop();
      for (const [name, previous] of original) {
        if (previous.value) root.style.setProperty(name, previous.value, previous.priority);
        else root.style.removeProperty(name);
      }
    };
  });
  let cleanup: (() => void) | undefined;
  onScopeDispose(() => cleanup?.());
  const customization = {
    state,
    baseline,
    storageError,
    setToken,
    setSourceColor,
    setDefault,
    reset,
    resolvedTokens,
    setPreset,
    setTypography,
  };
  provide(key, customization);
  return customization;
}
export function useDocsCustomization() {
  const state = inject(key);
  if (!state) throw new Error('Docs customization requires the Layout provider.');
  return state;
}
