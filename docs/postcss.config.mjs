import { cssFunctions } from '../scripts/css-functions.mjs';
import { postcssIsolateStyles } from 'vitepress';
import customFunctions from '@yuheiy/postcss-custom-functions';
import customMixins from '@chillet/postcss-custom-mixins';

export default {
  plugins: [
    postcssIsolateStyles({
      includeFiles: [/vp-doc\.css/, /base\.css/, /[\\/]docs[\\/]\.vitepress[\\/]theme[\\/]style\.css$/],
    }),
    customFunctions({ functions: cssFunctions }),
    customMixins(),
  ],
};
