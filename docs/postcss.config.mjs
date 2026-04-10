import { postcssIsolateStyles } from 'vitepress';
import customFunctions from '@yuheiy/postcss-custom-functions';
import customMixins from '@chillet/postcss-custom-mixins';

export default {
  plugins: [
    postcssIsolateStyles({
      includeFiles: [/vp-doc\.css/, /base\.css/, /[\\/]docs[\\/]\.vitepress[\\/]theme[\\/]style\.css$/],
    }),
    customFunctions({
      functions: {
        '--dp': (value) => `${parseFloat(value) / 16}rem`,
        '--translucent': (color, opacity) => `rgba(from ${color} r g b / ${opacity})`,
      },
    }),
    customMixins(),
  ],
};
