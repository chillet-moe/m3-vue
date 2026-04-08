import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'url';
import pkg from './package.json';
import { webTypesFromVueComponentMeta } from './scripts/web-types-gen';
import path from 'node:path';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import copyFiles from './scripts/copy-files';
import { browserslistToTargets, Features } from 'lightningcss';
import browserslist from 'browserslist';

const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));
const externalPackages = [...new Set([...Object.keys(pkg.peerDependencies), '@nuxt/kit'])];

export default defineConfig({
  plugins: [
    vue(),
    webTypesFromVueComponentMeta({
      tsconfigPath: 'tsconfig.types.json',
      components: ['src/components/**/*.vue'],
      outFile: 'web-types.json',
      tagNameStyle: 'as-is',
      checkerOptions: {
        forceUseTs: true,
        printer: {
          newLine: 1,
        },
      },
    }),
    copyFiles({
      targets: [
        {
          src: 'src/styles/typography-classes.css',
        },
        {
          src: 'src/styles/color-classes.css',
        },
        {
          src: 'src/styles/typography.module.css',
        },
        {
          src: 'src/styles/colors.module.css',
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    minify: false,
    copyPublicDir: false,
    sourcemap: true,
    emptyOutDir: true,
    lib: {
      entry: {
        index: 'src/index.ts',
        nuxt: 'src/nuxt.ts',
      },
      name: 'm3-vue',
      formats: ['es'],
      fileName: (_format, entryName) => entryName,
      cssFileName: 'style',
    },
    rolldownOptions: {
      external: externalPackages,
      output: {
        assetFileNames: '[name][extname]',
        entryFileNames: (chunkInfo) => {
          const format = chunkInfo.facadeModuleId?.includes('format=')
            ? chunkInfo.facadeModuleId.split('format=')[1]
            : 'es';
          const ext = format === 'es' ? '.mjs' : format === 'cjs' ? '.cjs' : '.js';
          return `[name]${ext}`;
        },
        preserveModules: true,
        preserveModulesRoot: 'src',
      },
    },
    cssCodeSplit: false,
  },
  css: {
    transformer: 'postcss',
    modules: {
      localsConvention: 'camelCase',
    },
    lightningcss: {
      targets: browserslistToTargets(browserslist('baseline 2025')),
      // https://github.com/porsche-design-system/porsche-design-system/issues/4257
      exclude: Features.LightDark,
    },
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['src/**/*.test.ts'],
          exclude: ['src/**/*.stories.@(js|jsx|mjs|ts|tsx)', 'src/**/*.mdx'],
        },
      },
      {
        extends: true,
        plugins: [
          storybookTest({
            configDir: path.join(dirname, '.storybook'),
          }),
        ],
      },
    ],
  },
});
