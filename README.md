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
