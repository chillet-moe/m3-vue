import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'url';
import pkg from './package.json';
import { webTypesFromVueComponentMeta } from './scripts/web-types-gen';
import path from 'node:path';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';

const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

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
      entry: 'src/index.ts',
      name: 'm3-vue',
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: Object.keys(pkg.peerDependencies),
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
    modules: {
      localsConvention: 'camelCase',
    },
  },
  test: {
    projects: [
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({
            configDir: path.join(dirname, '.storybook'),
          }),
        ]
      },
    ],
  },
});
