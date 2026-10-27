---
title: Getting Started
---

# Getting Started

Install the package, import the shared stylesheet, and register the plugin once at app startup.

## Install

```bash
pnpm add @chillet/m3-vue
```

m3-vue's build enables `@chillet/vue-scope-boundary` for scoped SFC styles; it
does not patch Vue. To prevent your own positive HTML type selectors from
depending on an m3-vue component's private root tag, enable the compiler
integration in the consuming Vite application. Class, ID, and attribute
selectors intentionally keep Vue's normal child-root behavior. See
[Vue Scope Boundaries](/guides/vue-scope-isolation) for installation, behavior,
and limitations.

## Register The Plugin

```ts
import { createApp } from 'vue';
import { M3VuePlugin } from '@chillet/m3-vue';
import App from './App.vue';

import '@chillet/m3-vue/style.css';

const app = createApp(App);

app.use(M3VuePlugin);
app.mount('#app');
```

After registration, `v-tooltip`, `v-dropdown`, `v-dropdown-menu`, and `v-context-menu` are available globally.
Use the plugin's `locale` and `messages` options to configure [localization](/guides/localization).

## Use Components

```vue
<script setup lang="ts">
import { Button } from '@chillet/m3-vue';
</script>

<template>
  <Button leading-icon="favorite">Button</Button>
</template>
```

## Component Defaults

Set application-wide preferences with `M3VuePlugin`, subtree preferences with a defaults helper, and individual
values with component props. Precedence is instance prop > helper subtree field > application field > library default.
The built-in defaults are Button `size="small"` and `pressShapeMorph=true`, Slider `size="medium"`,
`appearance="standard"`, `wheel=false`, and `valueIndicator=true`, and ListItem `appearance="standard"` with `size="medium"` (56px).
`ButtonGroup` inherits its parent's `pressShapeMorph` when the prop is omitted.

### Application configuration

```ts
import { M3VuePlugin, type M3VuePluginOptions } from '@chillet/m3-vue';

const options = {
  shape: 'square',
  fieldSize: 'small',
  buttonDefaults: { size: 'small', pressShapeMorph: true },
  sliderDefaults: { size: 'large', appearance: 'standard', wheel: false, valueIndicator: true },
  listItemDefaults: { appearance: 'standard' },
  timePickerDefaults: { format: '24h', inputMode: 'keyboard' },
} satisfies M3VuePluginOptions;

app.use(M3VuePlugin, options);
```

`M3VuePluginOptions` adds `buttonDefaults?: Pick<ButtonContext, 'size' | 'pressShapeMorph'>`,
`sliderDefaults?: SliderContext` (with `size`, `appearance`, `wheel`, and `valueIndicator`), and
`listItemDefaults?: ListItemContext` (with `size` and `appearance`). Existing options such as `shape`, `fieldSize`,
`iconButtonSize`, `menuColor`, and picker defaults remain available.

| Plugin option                                                     | Applies to                                   | Context field                             |
| ----------------------------------------------------------------- | -------------------------------------------- | ----------------------------------------- |
| `fieldSize`                                                       | Single-line TextField, Select, Combobox      | `fieldContextKey.size`                    |
| `buttonDefaults.size`                                             | Button                                       | `buttonContextKey.size`                   |
| `buttonDefaults.pressShapeMorph`                                  | Button and an inheriting ButtonGroup         | `buttonContextKey.pressShapeMorph`        |
| `iconButtonSize`                                                  | IconButton                                   | `iconButtonContextKey.size`               |
| `sliderDefaults.size`, `.appearance`, `.wheel`, `.valueIndicator` | Slider                                       | Corresponding `sliderContextKey` fields   |
| `listItemDefaults.size`, `.appearance`                            | ListItem                                     | Corresponding `listItemContextKey` fields |
| `menuColor`                                                       | Menu, Select and Combobox menus              | `menuDefaultsContextKey.color`            |
| `datePickerDefaults`                                              | DatePicker, including TextField date pickers | `datePickerContextKey` fields             |
| `timePickerDefaults`                                              | TimePicker, including TextField time pickers | `timePickerContextKey` fields             |

`shape` sets `rounded` or `square` across buttons, list items, text fields, pagination links, and navigation drawer
items. It can be combined with size defaults. Textarea fields always use `medium`, regardless of `fieldSize`.

### Subtree configuration

Use the field-specific helpers to override selected values in a subtree while inheriting every other field from the
nearest provider. Helper fields accept refs and computed values. An omitted or `undefined` field inherits; explicit
values such as `false` override the inherited value.

```vue
<script setup lang="ts">
import { computed, ref } from 'vue';
import { provideButtonDefaults, provideSliderDefaults, provideListItemDefaults } from '@chillet/m3-vue';

const compact = ref(true);
provideButtonDefaults({ size: computed(() => (compact.value ? 'small' : undefined)) });
provideSliderDefaults({ wheel: false, valueIndicator: computed(() => !compact.value) });
provideListItemDefaults({ appearance: 'expressive' });
</script>
```

The helpers compute each field against the nearest provider, so an inner subtree can override one preference and
continue inheriting the others. By contrast, direct `provide(contextKey, value)` replaces the entire context object.
Spread the injected context when using direct provide if you need to retain its other fields and refs. A provider
applies to descendants, not to injections in its own setup.

### Shared appearance

Set `app.use(M3VuePlugin, { appearance: 'expressive' })` to choose the appearance for Slider and ListItem.
These are the components with a standard/expressive appearance API.
`appearanceContextKey` and `provideAppearanceDefaults({ appearance })` provide the same reactive preference for a
subtree; refs, computed values, and `undefined` inheritance are supported. Component props take precedence over
component-specific defaults, then the shared appearance preference, then the library's `standard` fallback.
A component-specific application default therefore also overrides a shared subtree preference; omit that specific
default when the subtree should control the style.

Appearance does not change sizes, shape, or Button's independent `pressShapeMorph` setting. The selected ListItem
preset supplies row geometry, and public `--md-item-*` tokens override individual dimensions. `typography-compact.css` changes only typography.

### Migrating removed options

The old `buttonSize`, `sliderSize`, and `sliderAppearance` options have been removed, with no aliases. Move each
value into the corresponding defaults object:

```ts
// Before
app.use(M3VuePlugin, { buttonSize: 'small', sliderSize: 'large', sliderAppearance: 'expressive' });

// After
app.use(M3VuePlugin, {
  buttonDefaults: { size: 'small' },
  sliderDefaults: { size: 'large', appearance: 'expressive' },
});
```

### Snackbar Configuration

`snackbarDefaults` configures programmatic snackbars. It accepts an object, ref, or getter; options passed to
`showSnackbar()` take precedence. See [Snackbar](/components/snackbar) for the overlay API.

```ts
app.use(M3VuePlugin, {
  snackbarDefaults: { dismissible: false, duration: 6_000 },
});
```

## Mount The Overlay Host

Render one `OverlayHost` near the root of the application when using the programmatic `showDialog()` or
`showSnackbar()` functions. In descendant components, call `const { showDialog, showSnackbar } = useOverlays()` during setup, then use `showDialog(options)` or `showSnackbar(options)`. Outside components, bind once with `createOverlayService(host)`. The host keeps those overlays inside the application's Vue context while the native
dialog and popover elements use the browser top layer.

```vue
<script setup lang="ts">
import { OverlayHost, createOverlayHost, provideOverlayHost } from '@chillet/m3-vue';
const overlays = provideOverlayHost(createOverlayHost());
</script>

<template>
  <OverlayHost :host="overlays" />
  <!-- Your application content -->
</template>
```

`OverlayHost` is not required when `Dialog` and `Snackbar` are only rendered declaratively in templates.
`M3VuePlugin` does not insert the host automatically, because doing so would create a separate Vue rendering root or
modify the consuming application's root component.

Mount exactly one host. The programmatic overlay functions reject if it is missing, and pending calls reject if it
is unmounted.

## Auto Import

If you use `unplugin-vue-components`, pair it with `M3VueResolver`.

```ts
import Components from 'unplugin-vue-components/vite';
import { M3VueResolver } from '@chillet/m3-vue';

export default defineConfig({
  plugins: [
    Components({
      resolvers: [M3VueResolver()],
    }),
  ],
});
```
