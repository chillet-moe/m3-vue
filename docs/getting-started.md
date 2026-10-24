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

Use `M3VuePlugin` for application-wide appearance and interaction preferences, a context provider for a component
subtree, and props for individual controls. Explicit props take precedence over the nearest context; without either,
each component uses its built-in default.

### Application Configuration

```ts
import { ref } from 'vue';
import { M3VuePlugin, type M3VuePluginOptions, type TimePickerFormat } from '@chillet/m3-vue';

const format = ref<TimePickerFormat>('24h');
const options = {
  shape: 'square',
  fieldSize: 'small',
  buttonSize: 'small',
  timePickerDefaults: { format, inputMode: 'keyboard' },
} satisfies M3VuePluginOptions;

app.use(M3VuePlugin, options);
```

Sizes, shape, menu color, week start, time format, and input mode accept values or refs. Updating a ref updates the
controls that inherit it.

| Plugin option                       | Applies to                                   | Context key and property                  |
| ----------------------------------- | -------------------------------------------- | ----------------------------------------- |
| `fieldSize`                         | Single-line TextField, Select, Combobox      | `fieldContextKey` → `size`                |
| `buttonSize`                        | Button                                       | `buttonContextKey` → `size`               |
| `iconButtonSize`                    | IconButton                                   | `iconButtonContextKey` → `size`           |
| `sliderAppearance`                  | Slider                                       | `sliderContextKey` → `appearance`         |
| `sliderSize`                        | Slider                                       | `sliderContextKey` → `size`               |
| `menuColor`                         | Menu, Select and Combobox menus              | `menuDefaultsContextKey` → `color`        |
| `datePickerDefaults.firstDayOfWeek` | DatePicker, including TextField date pickers | `datePickerContextKey` → `firstDayOfWeek` |
| `timePickerDefaults.format`         | TimePicker, including TextField time pickers | `timePickerContextKey` → `format`         |
| `timePickerDefaults.inputMode`      | TimePicker, including TextField time pickers | `timePickerContextKey` → `inputMode`      |

`shape` sets `rounded` or `square` across buttons, list items, text fields, pagination links, and navigation drawer
items. It can be combined with size defaults. Textarea fields always use `medium`, regardless of `fieldSize`.

### Subtree Configuration

Provide a context from an ancestor component to configure its descendants. This example gives the subtree medium
fields while keeping the inherited shape and floating-label clearance. The Reference field explicitly uses small;
the Notes textarea uses medium.

```vue
<script setup lang="ts">
import { inject, provide, ref } from 'vue';
import { fieldContextKey, Select, TextField } from '@chillet/m3-vue';

const customer = ref('');
const reference = ref('');
const notes = ref('');
const inherited = inject(fieldContextKey, {});
provide(fieldContextKey, { ...inherited, size: 'medium' });
</script>

<template>
  <TextField v-model="customer" label="Customer" />
  <Select label="Status" :options="[{ label: 'Open', value: 'open' }]" />
  <TextField v-model="reference" label="Reference" size="small" />
  <TextField v-model="notes" label="Notes" as="textarea" />
</template>
```

Vue replaces the whole context rather than merging individual properties. Spread the inherited context to retain
its other values and refs. A component's provider applies to descendants, not to injections in its own setup.

All keys in the table are typed and exported, along with their context types. They also work with `app.provide()`:

```ts
import { fieldContextKey } from '@chillet/m3-vue';

app.provide(fieldContextKey, { size: 'small', shape: 'square', labelClearance: '0.5rem' });
```

When combining `app.provide()` with plugin configuration for the same key, install the plugin first so the explicit
application provider takes precedence.

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
