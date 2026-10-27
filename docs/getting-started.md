---
title: Getting Started
---

# Getting Started

Install the package, import the shared styles and a theme, then register the plugin once at app startup.

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
import '@chillet/m3-vue/themes/default.css';

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

Configure common preferences when registering the plugin:

```ts
app.use(M3VuePlugin, {
  fieldSize: 'small',
  buttonDefaults: { size: 'small' },
});
```

Continue with [Customization](./guides/styling) for theme selection, subtree defaults, density, typography, colors,
shapes and local component styling.

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
