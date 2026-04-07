import { defineConfig } from 'tsdown';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  entry: {
    index: './src/index.ts',
  },
  plugins: [vue({ isProduction: true })],
  platform: 'neutral',
  format: ['esm'],
  tsconfig: './tsconfig.app.json',
  dts: { vue: true },
  sourcemap: true,
  hash: false,

  css: {
    splitting: false,
    fileName: 'style.css',
  },

  treeshake: {
    moduleSideEffects: [
      { test: /\.css$/, sideEffects: true }, // 官方示例就提到 CSS 这么配 :contentReference[oaicite:6]{index=6}
    ],
  },

  inputOptions: {
    preserveEntrySignatures: 'allow-extension',
  },

  outputOptions: {
    minifyInternalExports: false,
    codeSplitting: {
      groups: [
        {
          test: /(?<!\.d\.c?ts)$/,
          name: (id) => {
            const [namespace, file] = id.split('?')[0].split(/[\\/]/g).slice(-2);
            return file
              ? namespace === 'src'
                ? file.slice(0, file.lastIndexOf('.'))
                : `${namespace}/${file.slice(0, file.lastIndexOf('.'))}`
              : namespace;
          },
        },
      ],
    },
  },
});
