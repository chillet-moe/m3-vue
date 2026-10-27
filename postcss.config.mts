import { cssFunctions } from './scripts/css-functions.mjs';

export default {
  plugins: {
    '@yuheiy/postcss-custom-functions': { functions: cssFunctions },
    '@chillet/postcss-custom-mixins': {},
  },
};
