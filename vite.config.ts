import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'url';
import pkg from './package.json';
import { webTypesFromVueComponentMeta } from './scripts/web-types-gen';
import path from 'node:path';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import copyFiles from './scripts/copy-files';

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
    copyFiles({
      targets: [
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