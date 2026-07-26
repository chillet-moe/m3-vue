# Material Design Web - Vue 3

A Vue 3 component library implementing Material Design 3 (Material You).

> m3-vue's build enables `@chillet/vue-scope-boundary` for scoped SFC styles. It prevents positive HTML type selectors such as `button` and `button.primary` from matching child component roots through Vue's copied parent scope ID. Class, ID, and attribute selectors keep Vue's normal behavior. No Vue runtime patch is required. See [`docs/guides/vue-scope-isolation.md`](docs/guides/vue-scope-isolation.md).

## Installation

```bash
npm install @chillet/m3-vue
# or
pnpm add @chillet/m3-vue
# or
yarn add @chillet/m3-vue
```

## Credits

These projects for inspiration and reference:

- https://github.com/KTibow/m3-svelte -- Some implementations
- https://github.com/zdhxiong/mdui -- Some implementations
- https://github.com/makmn1/material-design-token-gen -- MD3 Tokens (`/reference-tokens`)
- https://github.com/melt-ui/next-gen -- The idea of Builder pattern

## Auto Import (unplugin-vue-components)

```ts
// vite.config.ts
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

If you add a new component in `src/components`, also update `src/resolver.ts`.

## Plugin

```ts
import { createApp } from 'vue';
import { M3VuePlugin } from '@chillet/m3-vue';
import App from './App.vue';

const app = createApp(App);

app.use(M3VuePlugin);
app.mount('#app');
```

After registration, you can use `v-tooltip`, `v-dropdown`, `v-dropdown-menu`, and `v-context-menu` directly in templates.

Render one `OverlayHost` near the application root when using the programmatic `showDialog()` or `showSnackbar()`
functions. It is not required for declaratively rendered `Dialog` or `Snackbar` components.

```vue
<script setup lang="ts">
import { OverlayHost } from '@chillet/m3-vue';
</script>

<template>
  <OverlayHost />
  <!-- Your application content -->
</template>
```

## Nuxt

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@chillet/m3-vue/nuxt'],
});
```

By default, the Nuxt module will:

- register all components for auto import
- add `@chillet/m3-vue/style.css` to `css`
- install `M3VuePlugin` so `v-tooltip`, `v-dropdown`, `v-dropdown-menu`, and `v-context-menu` are available

You can customize it with `m3Vue`:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@chillet/m3-vue/nuxt'],
  m3Vue: {
    prefix: 'M3',
    imports: true,
  },
});
```
