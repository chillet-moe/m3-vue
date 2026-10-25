import { defineConfig } from 'vite';
import vue, { type Options as VuePluginOptions } from '@vitejs/plugin-vue';
import { createScopeBoundaryVueOptions } from '@chillet/vue-scope-boundary/vite';
import { fileURLToPath } from 'url';
import pkg from './package.json' with { type: 'json' };
import { webTypesFromVueComponentMeta } from './scripts/web-types-gen/index.ts';
import copyFiles from './scripts/copy-files/index.ts';
import fixCssLayerOrder from './scripts/fix-css-layer-order/index.ts';
import { browserslistToTargets, Features } from 'lightningcss';
import browserslist from 'browserslist';

const externalPackages = [...new Set([...Object.keys(pkg.peerDependencies), '@nuxt/kit'])];

function vueWithScopeBoundary(options: VuePluginOptions = {}) {
  return vue(createScopeBoundaryVueOptions(options));
}

export default defineConfig({
  plugins: [
    vueWithScopeBoundary(),
    webTypesFromVueComponentMeta({
      tsconfigPath: 'tsconfig.types.json',
      entryPoints: 'src/index.ts',
      outFile: 'web-types.json',
      checkerOptions: {
        printer: {
          newLine: 1,
        },
      },
    }),
    copyFiles({
      targets: [
        { src: 'src/styles/typography-compact.css' },
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
    fixCssLayerOrder(),
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
        'locales/en': 'src/locales/en.ts',
        'locales/zh-Hans': 'src/locales/zh-Hans.ts',
        'locales/zh-Hant': 'src/locales/zh-Hant.ts',
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
});
