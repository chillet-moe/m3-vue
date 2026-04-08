# Material Design Web - Vue 3

A Vue 3 component library implementing Material Design 3 (Material You).

## Installation

```bash
npm install @chillet/m3-vue
# or
pnpm add @chillet/m3-vue
# or
yarn add @chillet/m3-vue
```

## Deploy (Cloudflare Workers)

Build and deploy the static site from `storybook-static`.

```bash
pnpm run story:build
wrangler deploy
```

## Credits

These projects for inspiration and reference:

- https://github.com/KTibow/m3-svelte -- Some implementation ideas
- https://github.com/makmn1/material-design-token-gen -- MD3 Tokens (`/reference-tokens`)
- https://github.com/vuelessjs/vueless -- Usage of Storybook

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
