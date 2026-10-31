---
title: Getting Started
---

# Getting Started

Install the package, import the shared styles and a preset, then register the plugin once at app startup.

## Install

```bash
pnpm add @chillet/m3-vue
```

## Register The Plugin

```ts
import { createApp } from 'vue';
import { M3VuePlugin } from '@chillet/m3-vue';
import App from './App.vue';

import '@chillet/m3-vue/style.css';
import { defaultPreset } from '@chillet/m3-vue/presets/default';

const app = createApp(App);

app.use(M3VuePlugin, { preset: defaultPreset });
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

## Choose compact or customize

For a complete compact interface, import `compact` from `@chillet/m3-vue/presets/compact` and pass it as `preset`. It applies compact typography, density -2 and coordinated component sizes; no per-component setup is required.

See [Customization](./guides/styling) for preset overrides and [Preset preview](./guides/presets) to compare the layouts.

Compact uses external field labels. Arrange visible labels in your form layout, or provide an accessible name for fields without a visible label. See [Field layout](./guides/field-layout#label-behavior).

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
