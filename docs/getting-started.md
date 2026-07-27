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
