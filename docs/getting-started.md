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
The plugin also accepts reactive locale configuration; see [Localization](/guides/localization).

Application-level defaults for programmatic snackbars can be configured through `snackbarDefaults`. Refs and getters
are supported, and options passed directly to `showSnackbar()` take precedence.

```ts
app.use(M3VuePlugin, {
  snackbarDefaults: {
    dismissible: false,
    duration: 6_000,
  },
});
```

You can set one global default shape for shape-aware components through the same plugin. This covers buttons, list
items, text fields, pagination links, and navigation drawer items. The value can be a `ref` when the application needs
to switch between `rounded` and `square` at runtime; explicit component props and nested contexts still take
precedence.

```ts
import { ref } from 'vue';

const shape = ref<'rounded' | 'square'>('square');
app.use(M3VuePlugin, { shape });

// Later, all shape-aware components update together.
shape.value = 'rounded';
```

## Default Field Size

Set `fieldSize` to `'extra-small'`, `'small'`, or `'medium'` for single-line `TextField` and `Select` controls.
Combobox inherits the same size default through Select.
It accepts a value or a ref and can be configured alongside `shape`:

```ts
app.use(M3VuePlugin, { shape: 'square', fieldSize: 'small' });
```

You can also provide the typed `fieldContextKey` directly at application startup. If using both APIs, install the
plugin first; a later `app.provide` for the same key replaces the whole context.

```ts
import { fieldContextKey } from '@chillet/m3-vue';

app.provide(fieldContextKey, { size: 'small', shape: 'square', labelClearance: '0.5rem' });
```

For a subtree with medium controls, provide a closer context from its ancestor component. Spread the inherited
context to retain its other defaults, including reactive refs; Vue does not merge context properties automatically.

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

Explicit `size` props take precedence over the nearest context. Without either, the size is `medium`.
Textarea controls always use `medium`, regardless of injected or explicit sizes. A provider applies to descendants,
not to other injections within its own setup. `FieldContext`, `TextFieldSize`, `M3FieldOptions`, and
`M3VuePluginOptions` are exported for typed configuration.

## Other Component Defaults

Configure shared appearance and interaction preferences through the plugin. Each size, color, weekday, format,
or input mode below accepts either a value or a Vue ref. Explicit component props take
precedence over the nearest context; omitted preferences keep the component's existing behavior.

```ts
import { ref } from 'vue';
import { M3VuePlugin, type TimePickerFormat } from '@chillet/m3-vue';

const format = ref<TimePickerFormat>('24h');
app.use(M3VuePlugin, {
  buttonSize: 'small',
  iconButtonSize: 'small',
  sliderSize: 'small',
  menuColor: 'vibrant',
  datePickerDefaults: { firstDayOfWeek: 1 },
  timePickerDefaults: { format, inputMode: 'keyboard' },
});
```

| Plugin option        | Context key              | Context properties    |
| -------------------- | ------------------------ | --------------------- |
| `buttonSize`         | `buttonContextKey`       | `size`                |
| `iconButtonSize`     | `iconButtonContextKey`   | `size`                |
| `sliderSize`         | `sliderContextKey`       | `size`                |
| `menuColor`          | `menuDefaultsContextKey` | `color`               |
| `datePickerDefaults` | `datePickerContextKey`   | `firstDayOfWeek`      |
| `timePickerDefaults` | `timePickerContextKey`   | `format`, `inputMode` |

These typed keys also work with `app.provide()` and component-level `provide()`. Install the plugin before any
application-level overrides for the same key. A closer provider replaces the whole context; spread the inherited
context when retaining its other preferences:

```ts
import { inject, provide, ref } from 'vue';
import { timePickerContextKey, type TimePickerInputMode } from '@chillet/m3-vue';

const inputMode = ref<TimePickerInputMode>('clock');
provide(timePickerContextKey, { ...inject(timePickerContextKey, {}), inputMode });
```

Menu defaults also apply to Select and Combobox menus; explicit `menuColor` wins. Submenus retain their parent menu's
resolved color unless explicitly overridden. TextField's date/time pickers inherit picker preferences too. Without
a format preference, standalone TimePicker follows the locale and TextField keeps its 24-hour fallback. Without an
input-mode preference, 12-hour pickers start with the clock and 24-hour pickers start with keyboard input. Switching
modes inside an open picker remains a local interaction. DatePicker keeps its locale-based week start when unset.

Keep values, open state, validation, disabled/required state, and selectable ranges local to their business owner.
Choose button emphasis for each action instead of setting an application-wide variant. `M3ComponentDefaultsOptions`
and the context types are exported for typed configuration.

## Mount The Overlay Host

Render one `OverlayHost` near the root of the application when using the programmatic `showDialog()` or
`showSnackbar()` functions. The host keeps those overlays inside the application's Vue context while the native
dialog and popover elements use the browser top layer.

```vue
<script setup lang="ts">
import { OverlayHost } from '@chillet/m3-vue';
</script>

<template>
  <OverlayHost />
  <!-- Your application content -->
</template>
```

`OverlayHost` is not required when `Dialog` and `Snackbar` are only rendered declaratively in templates.
`M3VuePlugin` does not insert the host automatically, because doing so would create a separate Vue rendering root or
modify the consuming application's root component.

Mount exactly one host. The programmatic overlay functions reject if it is missing, and pending calls reject if it
is unmounted.

## Use Components

```vue
<script setup lang="ts">
import { Button } from '@chillet/m3-vue';
</script>

<template>
  <Button leading-icon="favorite">Button</Button>
</template>
```

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
