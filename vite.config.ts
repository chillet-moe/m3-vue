import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'url';
import pkg from './package.json';
import { webTypesFromVueComponentMeta } from './scripts/web-types-gen';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    webTypesFromVueComponentMeta({
      tsconfigPath: "tsconfig.types.json",
      components: ["src/components/**/*.vue"],
      outFile: "web-types.json",
      tagNameStyle: "both",
      checkerOptions: {
        forceUseTs: true,
        printer: { newLine: 1 },
      },
    })
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

    // 让所有 CSS（包括 CSS Modules）被抽到 dist/style.css（常见做法）
    cssCodeSplit: false,
  },

  css: {
    modules: {
      localsConvention: 'camelCase',
    },
  },
});
